import { useEffect, useRef, useState } from 'react'

export interface GazeData {
  isBlinking: boolean
  isRight: boolean
  isLeft: boolean
  isCenter: boolean
  horizontalRatio: number | null
  verticalRatio: number | null
  pupilLeft: [number, number] | null
  pupilRight: [number, number] | null
}

const GAZE_SERVER_URL = 'ws://localhost:8765'

export function useGazeTracking() {
  const [gazeData, setGazeData] = useState<GazeData | null>(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const connect = () => {
      const ws = new WebSocket(GAZE_SERVER_URL)
      wsRef.current = ws

      ws.onopen = () => {
        setConnected(true)
        setError(null)
      }

      ws.onmessage = (event) => {
        const data: GazeData = JSON.parse(event.data)
        setGazeData(data)
      }

      ws.onerror = () => {
        setError('GazeTracking 서버에 연결할 수 없습니다. gaze-server/server.py를 먼저 실행해주세요.')
        setConnected(false)
      }

      ws.onclose = () => {
        setConnected(false)
      }
    }

    connect()

    return () => {
      wsRef.current?.close()
    }
  }, [])

  return { gazeData, connected, error }
}
