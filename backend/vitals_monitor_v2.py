import cv2
import numpy as np
import tensorflow as tf
import time
from collections import deque
from scipy.signal import butter, filtfilt, hilbert, find_peaks

MODEL_PATH = "PulseNet_v1_best.keras"
# 🔹 Global vitals shared with Flask
heart_rate = 0
respiratory_rate = 0
spo2 = 0

def update_vitals(hr, rr, sp):
    global heart_rate, respiratory_rate, spo2
    heart_rate = hr
    respiratory_rate = rr
    spo2 = sp

FPS = 30
BUFFER_SEC = 10
BUFFER_SIZE = FPS * BUFFER_SEC

HR_MIN, HR_MAX = 50, 130
RR_MIN, RR_MAX = 8, 25

MODEL_FRAMES = 60
MODEL_SIZE = (128,128)

# -----------------------------
# SIGNAL UTILITIES
# -----------------------------

def bandpass(sig, fs, lo, hi, order=4):
    nyq = fs/2
    lo/=nyq
    hi/=nyq
    if lo>=hi:
        return sig
    b,a = butter(order,[lo,hi],btype='band')
    if len(sig)<max(len(a),len(b))*3:
        return sig
    return filtfilt(b,a,sig)

def detrend(sig):
    t=np.arange(len(sig))
    return sig-np.polyval(np.polyfit(t,sig,2),t)

def normalize(sig):
    return (sig-np.mean(sig))/(np.std(sig)+1e-9)

# -----------------------------
# POS rPPG SIGNAL
# -----------------------------

def pos_bvp(r,g,b,fs):

    r=np.array(r)/np.mean(r)
    g=np.array(g)/np.mean(g)
    b=np.array(b)/np.mean(b)

    s1=g-r
    s2=-2*r+g+b

    h=s1+(np.std(s1)/(np.std(s2)+1e-9))*s2

    h=detrend(h)
    h=bandpass(h,fs,HR_MIN/60,HR_MAX/60)

    return normalize(h)

# -----------------------------
# HR FROM PEAKS
# -----------------------------

def hr_from_peaks(bvp,fs):

    if len(bvp)<fs*3:
        return None

    min_dist=int(fs*60/HR_MAX)

    peaks,_=find_peaks(
        bvp,
        distance=min_dist,
        prominence=0.35*np.std(bvp)
    )

    if len(peaks)<4:
        return None

    intervals=np.diff(peaks[-4:])/fs
    median=np.median(intervals)

    good=intervals[np.abs(intervals-median)<0.25*median]

    if len(good)==0:
        return None

    bpm=60/np.mean(good)

    if HR_MIN<bpm<HR_MAX:
        return bpm

    return None

# -----------------------------
# MODEL HR
# -----------------------------

def model_hr(model,model_buf):

    if model is None or len(model_buf)<MODEL_FRAMES:
        return None

    arr=np.array(list(model_buf)[-MODEL_FRAMES:],dtype=np.float32)
    pred=model.predict(np.expand_dims(arr,0),verbose=0)[0][0]
    bpm=pred*(HR_MAX-HR_MIN)+HR_MIN

    if HR_MIN<bpm<HR_MAX:
        return bpm

    return None

# -----------------------------
# FUSED HR
# -----------------------------

def calculate_hr(model,model_buf,r,g,b,fs):

    hr_model=model_hr(model,model_buf)

    if len(g)<fs*4:
        return hr_model

    bvp=pos_bvp(r,g,b,fs)
    hr_signal=hr_from_peaks(bvp,fs)

    if hr_model and hr_signal:
        if abs(hr_model-hr_signal)<15:
            return 0.6*hr_model + 0.4*hr_signal
        return hr_signal

    return hr_signal or hr_model

# -----------------------------
# HR STABILIZER
# -----------------------------

class HRStabilizer:

    def __init__(self):
        self.value = None
        self.trend = 0
        self.history = deque(maxlen=8)

    def update(self, new):

        if new is None:
            return int(self.value) if self.value else None

        if self.value is None:
            self.value = new
            self.history.append(new)
            return int(self.value)

        diff = new - self.value

        if abs(diff) > 20:
            return int(self.value)

        self.trend = 0.7*self.trend + 0.3*diff

        if abs(self.trend) < 0.8:
            alpha = 0.94
            max_step = 1.2
        elif abs(self.trend) < 3:
            alpha = 0.88
            max_step = 2.5
        else:
            alpha = 0.75
            max_step = 4.0

        diff = max(-max_step, min(max_step, diff))
        self.value = alpha*self.value + (1-alpha)*(self.value + diff)

        self.history.append(self.value)
        stable = np.median(self.history)

        return int(stable)

# -----------------------------
# RR STABILIZER (NEW)
# -----------------------------

class StableRR:
    def __init__(self):
        self.value = None
        self.alpha = 0.92
        self.max_step = 2.0

    def update(self, raw_rr):
        if raw_rr is None:
            return self.value

        if self.value is None:
            self.value = raw_rr
            return int(self.value)

        diff = raw_rr - self.value
        if abs(diff) > self.max_step:
            raw_rr = self.value + np.sign(diff) * self.max_step

        self.value = self.alpha * self.value + (1 - self.alpha) * raw_rr
        return int(self.value)

# -----------------------------
# RR CALCULATION (NEW)
# -----------------------------

def calculate_rr(g, fs):

    if len(g) < fs*8:
        return None

    sig = normalize(detrend(np.array(g)))
    sig = bandpass(sig, fs, RR_MIN/60, RR_MAX/60)

    n = len(sig)
    freqs = np.fft.rfftfreq(n, d=1/fs)
    power = np.abs(np.fft.rfft(sig))**2

    mask = (freqs >= RR_MIN/60) & (freqs <= RR_MAX/60)
    if not np.any(mask):
        return None

    rr = freqs[mask][np.argmax(power[mask])] * 60

    if RR_MIN < rr < RR_MAX:
        return rr

    return None

# -----------------------------
# SpO2
# -----------------------------

def calculate_spo2(r,g,fs):

    n=int(fs*6)
    if len(r)<n:
        return None

    r=np.array(r[-n:])
    g=np.array(g[-n:])

    r_ac=bandpass(r,fs,HR_MIN/60,HR_MAX/60)
    g_ac=bandpass(g,fs,HR_MIN/60,HR_MAX/60)

    rpi=np.sqrt(np.mean(r_ac**2))/(np.mean(r)+1e-9)
    gpi=np.sqrt(np.mean(g_ac**2))/(np.mean(g)+1e-9)

    if gpi<1e-7:
        return None

    R=rpi/gpi
    spo2=100-max(0,R-1)*4

    return np.clip(spo2,80,100)

# -----------------------------
# MAIN
# -----------------------------

def main():

    try:
        model=tf.keras.models.load_model(MODEL_PATH,compile=False)
    except:
        model=None

    face=cv2.CascadeClassifier(cv2.data.haarcascades+'haarcascade_frontalface_default.xml')
    cap=cv2.VideoCapture(0,cv2.CAP_DSHOW)

    r_buf=deque(maxlen=BUFFER_SIZE)
    g_buf=deque(maxlen=BUFFER_SIZE)
    b_buf=deque(maxlen=BUFFER_SIZE)
    model_buf=deque(maxlen=MODEL_FRAMES)

    hr_filter=HRStabilizer()
    rr_stable=StableRR()

    prev_time=time.time()
    fps=30

    while True:

        ret,frame=cap.read()
        if not ret: break

        now=time.time()
        dt=now-prev_time
        prev_time=now

        if dt>0:
            fps=0.9*fps+0.1*(1/dt)

        gray=cv2.cvtColor(frame,cv2.COLOR_BGR2GRAY)
        faces=face.detectMultiScale(gray,1.1,5)

        if len(faces)>0:

            x,y,w,h=faces[0]
            roi=frame[int(y+h*0.15):int(y+h*0.35),int(x+w*0.2):int(x+w*0.8)]

            if roi.size>0:
                r_buf.append(np.mean(roi[:,:,2]))
                g_buf.append(np.mean(roi[:,:,1]))
                b_buf.append(np.mean(roi[:,:,0]))
                model_buf.append(cv2.resize(roi,MODEL_SIZE)/255)

        hr=None; rr=None; spo2=None

        if len(g_buf)>fps*4:

            fs=max(fps,15)

            hr_raw=calculate_hr(model,model_buf,list(r_buf),list(g_buf),list(b_buf),fs)
            hr=hr_filter.update(hr_raw)

            rr_raw=calculate_rr(list(g_buf),fs)
            rr=rr_stable.update(rr_raw)

            spo2 = calculate_spo2(list(r_buf), list(g_buf), fs)

            if hr is not None and rr is not None and spo2 is not None:
               update_vitals(int(hr), int(rr), int(spo2))

        if hr:
            cv2.putText(frame,f"HR: {hr}",(30,60),cv2.FONT_HERSHEY_SIMPLEX,1,(0,255,0),2)

        if rr:
            cv2.putText(frame,f"RR: {rr}",(30,100),cv2.FONT_HERSHEY_SIMPLEX,1,(255,0,0),2)

        if spo2:
            cv2.putText(frame,f"SpO2: {int(spo2)}",(30,140),cv2.FONT_HERSHEY_SIMPLEX,1,(0,165,255),2)

        #cv2.imshow("PulseNet Vitals",frame)

        #if cv2.waitKey(1)&0xFF==ord('q'):
            #break

    cap.release()
    #cv2.destroyAllWindows()

if __name__=="__main__":
    main()