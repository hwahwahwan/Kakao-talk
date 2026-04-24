import asyncio
import json
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'GazeTracking'))

import cv2
import websockets
from gaze_tracking import GazeTracking

gaze = GazeTracking()
webcam = cv2.VideoCapture(0)

connected_clients: set = set()


async def broadcast(data: dict):
    if connected_clients:
        message = json.dumps(data)
        await asyncio.gather(*[client.send(message) for client in connected_clients])


async def gaze_loop():
    loop = asyncio.get_event_loop()
    while True:
        ret, frame = await loop.run_in_executor(None, webcam.read)
        if not ret or frame is None or frame.size == 0:
            await asyncio.sleep(0.1)
            continue

        gaze.refresh(frame)

        data = {
            "isBlinking": gaze.is_blinking(),
            "isRight": gaze.is_right(),
            "isLeft": gaze.is_left(),
            "isCenter": gaze.is_center(),
            "horizontalRatio": gaze.horizontal_ratio(),
            "verticalRatio": gaze.vertical_ratio(),
        }

        pupils = gaze.pupil_left_coords(), gaze.pupil_right_coords()
        data["pupilLeft"] = [int(v) for v in pupils[0]] if pupils[0] else None
        data["pupilRight"] = [int(v) for v in pupils[1]] if pupils[1] else None

        await broadcast(data)
        await asyncio.sleep(0.033)  # ~30fps


async def handler(websocket):
    connected_clients.add(websocket)
    print(f"클라이언트 연결: {websocket.remote_address}")
    try:
        await websocket.wait_closed()
    finally:
        connected_clients.discard(websocket)
        print(f"클라이언트 연결 해제: {websocket.remote_address}")


async def main():
    print("GazeTracking WebSocket 서버 시작: ws://localhost:8765")
    async with websockets.serve(handler, "localhost", 8765):
        await gaze_loop()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    finally:
        webcam.release()
