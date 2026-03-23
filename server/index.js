require('dotenv').config()
const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const crypto = require('crypto')
const { SOCKET_EVENTS } = require('./constants')
const { translateToKorean } = require('./translate')

const PORT = parseInt(process.env.PORT, 10) || 4000
const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:3000'

const app = express()
app.use(cors({ origin: CLIENT_URL }))
app.use(express.json())

const server = http.createServer(app)
const io = new Server(server, {
  cors: { origin: CLIENT_URL, methods: ['GET', 'POST'] },
})

// 서버 메모리 저장소
const users = {}       // { [userId]: { id, name, socketId } }
const rooms = {}       // { [roomId]: { id, memberIds: string[], messages: [] } }
const socketToUser = {} // { [socketId]: userId }

function getOnlineUsers() {
  return Object.values(users).filter((u) => u.socketId !== null)
}

function hydrateRoom(room) {
  const members = room.memberIds
    .map((id) => users[id])
    .filter(Boolean)
    .map(({ id, name }) => ({ id, name }))
  const lastMessage = room.messages[room.messages.length - 1] ?? undefined
  return { id: room.id, members, lastMessage }
}

io.on('connection', (socket) => {
  // 유저 입장
  socket.on(SOCKET_EVENTS.USER_JOIN, ({ name, email }) => {
    const userId = crypto.randomUUID()
    const user = { id: userId, name, email: email ?? '', socketId: socket.id }
    users[userId] = user
    socketToUser[socket.id] = userId

    // 나에게만: 내 정보 + 현재 접속자 목록 (나 제외)
    const onlineUsers = getOnlineUsers()
      .filter((u) => u.id !== userId)
      .map(({ id, name }) => ({ id, name }))

    socket.emit(SOCKET_EVENTS.USER_JOINED, {
      me: { id: userId, name, email: user.email },
      onlineUsers,
    })

    // 전체 브로드캐스트: 접속자 목록 갱신
    const allOnline = getOnlineUsers().map(({ id, name }) => ({ id, name }))
    io.emit(SOCKET_EVENTS.USER_LIST, { users: allOnline })
  })

  // 채팅방 생성
  socket.on(SOCKET_EVENTS.ROOM_CREATE, ({ targetUserId }) => {
    const userId = socketToUser[socket.id]
    if (!userId) return

    const targetUser = users[targetUserId]
    if (!targetUser || targetUser.socketId === null) {
      socket.emit(SOCKET_EVENTS.ROOM_ERROR, { message: '상대방이 오프라인입니다' })
      return
    }

    const roomId = [userId, targetUserId].sort().join('_')

    if (!rooms[roomId]) {
      rooms[roomId] = { id: roomId, memberIds: [userId, targetUserId], messages: [] }
    } else if (!rooms[roomId].memberIds.includes(userId)) {
      rooms[roomId].memberIds.push(userId)
    }

    const room = rooms[roomId]

    // 두 유저 모두 socket.io room에 join
    socket.join(roomId)
    const targetSocket = io.sockets.sockets.get(targetUser.socketId)
    if (targetSocket) targetSocket.join(roomId)

    // 생성자에게: 채팅창 오픈 + 히스토리
    socket.emit(SOCKET_EVENTS.ROOM_JOINED, {
      room: hydrateRoom(room),
      history: room.messages,
    })

    // 상대방에게: 채팅방 목록에 추가
    if (targetSocket) {
      targetSocket.emit(SOCKET_EVENTS.ROOM_INVITED, {
        room: hydrateRoom(room),
      })
    }
  })

  // 메시지 전송
  socket.on(SOCKET_EVENTS.MESSAGE_SEND, ({ roomId, content }) => {
    const userId = socketToUser[socket.id]
    if (!userId) return

    const room = rooms[roomId]
    if (!room) return

    if (!content || content.trim() === '') return

    const user = users[userId]
    const message = {
      id: crypto.randomUUID(),
      roomId,
      senderId: userId,
      senderName: user?.name ?? null,
      content: content.trim(),
      type: 'text',
      createdAt: new Date().toISOString(),
    }

    room.messages.push(message)

    // 방 전체에 브로드캐스트 (발신자 포함)
    io.to(roomId).emit(SOCKET_EVENTS.MESSAGE_RECEIVE, message)
  })

  // 채팅방 나가기
  socket.on(SOCKET_EVENTS.ROOM_LEAVE, ({ roomId }) => {
    const userId = socketToUser[socket.id]
    if (!userId) return

    const room = rooms[roomId]
    if (!room) return

    const userName = users[userId]?.name ?? '알 수 없음'

    // memberIds에서 제거
    room.memberIds = room.memberIds.filter((id) => id !== userId)

    // socket.io room에서 제거 (이후 io.to(roomId) 브로드캐스트에서 제외)
    socket.leave(roomId)

    // 남은 멤버에게 시스템 메시지
    if (room.memberIds.length > 0) {
      const sysMsg = {
        id: crypto.randomUUID(),
        roomId: room.id,
        senderId: null,
        senderName: null,
        content: `${userName}님이 나갔습니다`,
        type: 'system',
        createdAt: new Date().toISOString(),
      }
      room.messages.push(sysMsg)
      io.to(roomId).emit(SOCKET_EVENTS.MESSAGE_RECEIVE, sysMsg)
    }

    // 나간 유저에게 완료 응답
    socket.emit(SOCKET_EVENTS.ROOM_LEFT, { roomId })

    // 방에 멤버가 없으면 삭제
    if (room.memberIds.length === 0) {
      delete rooms[roomId]
    }
  })

  // 연결 해제
  socket.on('disconnect', () => {
    const userId = socketToUser[socket.id]
    if (!userId) return

    delete socketToUser[socket.id]

    if (users[userId]) {
      users[userId].socketId = null
    }

    // 전체 브로드캐스트: 접속자 목록 갱신
    const allOnline = getOnlineUsers().map(({ id, name }) => ({ id, name }))
    io.emit(SOCKET_EVENTS.USER_LIST, { users: allOnline })
    io.emit(SOCKET_EVENTS.USER_DISCONNECT, { userId })

    // 해당 유저가 속한 모든 방에 시스템 메시지 전송
    const userName = users[userId]?.name ?? '알 수 없음'
    Object.values(rooms).forEach((room) => {
      if (room.memberIds.includes(userId)) {
        const sysMsg = {
          id: crypto.randomUUID(),
          roomId: room.id,
          senderId: null,
          senderName: null,
          content: `${userName}님이 나갔습니다`,
          type: 'system',
          createdAt: new Date().toISOString(),
        }
        room.messages.push(sysMsg)
        io.to(room.id).emit(SOCKET_EVENTS.MESSAGE_RECEIVE, sysMsg)
      }
    })
  })
})

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

app.get('/translate', async (req, res) => {
  const text = req.query.text
  if (!text) return res.status(400).json({ error: 'text required' })
  const translated = await translateToKorean(text)
  if (!translated) return res.status(422).json({ error: '번역 실패' })
  res.json({ translated })
})

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
