import cv2
import time

cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)

start = time.time()
frames = 0

while frames < 120:
    ret, frame = cap.read()
    if not ret:
        break
    frames += 1

end = time.time()

fps = frames / (end - start)
print("Real FPS:", fps)

cap.release()