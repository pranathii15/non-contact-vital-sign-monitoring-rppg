from flask import Flask, render_template, Response, jsonify
import threading
import cv2
import vitals_monitor_v2 as vm

app = Flask(__name__)

# ---------------------------
# Start AI scanner thread
# ---------------------------
def start_scanner():
    vm.main()

thread = threading.Thread(target=start_scanner)
thread.daemon = True
thread.start()

# ---------------------------
# Camera streaming
# ---------------------------
camera = cv2.VideoCapture(0, cv2.CAP_DSHOW)
if not camera.isOpened():
    print("ERROR: Camera could not be opened")

def generate_frames():
    while True:
        success, frame = camera.read()
        if not success:
            break
        else:
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

# ---------------------------
# Routes
# ---------------------------
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/vitals")
def vitals():
    return jsonify({
        "hr": vm.heart_rate,
        "rr": vm.respiratory_rate,
        "spo2": vm.spo2
    })

if __name__ == "__main__":
    app.run(debug=True)