const crypto = require('crypto')
const { SOCKET_EVENTS } = require('../constants')
const { socketToUser, onlineSockets, getOnlineUserIds } = require('../store')
const {
  findUserByCredentials,
  getUserById,
  getUsersByIds,
  getOrCreateRoom,
  getRoomWithDetails,
  getRoomsByUserId,
  isMember,
  removeMember,
  getMemberCount,
  deleteRoom,
  saveMessage,
  getMessagesByRoomId,
} = require('../db/queries')

function registerSocketHandlers(io, socket) {
  // 유저 입장
  socket.on(SOCKET_EVENTS.USER_JOIN, ({ email, password }) => {
    const user = findUserByCredentials.get(email, password)
    if (!user) {
      socket.emit(SOCKET_EVENTS.USER_JOIN_ERROR, {
        message: '이메일 또는 비밀번호가 올바르지 않습니다',
      })
      return
    }

    const { id: userId, name, email: userEmail } = user
    onlineSockets[userId] = socket.id
    socketToUser[socket.id] = userId

    const roomIds = getRoomsByUserId(userId)
    const rooms = roomIds
      .map((roomId) => getRoomWithDetails(roomId))
      .filter(Boolean)

    const onlineUsers = getUsersByIds(getOnlineUserIds()).filter((u) => u.id !== userId)

    socket.emit(SOCKET_EVENTS.USER_JOINED, {
      me: { id: userId, name, email: userEmail },
      onlineUsers,
      rooms,
    })

    io.emit(SOCKET_EVENTS.USER_LIST, { users: getUsersByIds(getOnlineUserIds()) })
  })

  // 소켓 룸 재가입 (재접속 시 클라이언트가 각 룸마다 emit)
  socket.on(SOCKET_EVENTS.ROOM_REJOIN, ({ roomId }) => {
    const userId = socketToUser[socket.id]
    if (!userId) return
    if (!isMember(roomId, userId)) return

    socket.join(roomId)
    const history = getMessagesByRoomId(roomId)
    socket.emit(SOCKET_EVENTS.ROOM_REJOINED, { roomId, history })
  })

  // 채팅방 생성
  socket.on(SOCKET_EVENTS.ROOM_CREATE, ({ targetUserId }) => {
    const userId = socketToUser[socket.id]
    if (!userId) return

    const targetUser = getUserById.get(targetUserId)
    if (!targetUser) {
      socket.emit(SOCKET_EVENTS.ROOM_ERROR, { message: '존재하지 않는 사용자입니다' })
      return
    }

    const roomId = [userId, targetUserId].sort().join('_')
    const existingRoom = getRoomWithDetails(roomId)

    if (!existingRoom && !onlineSockets[targetUserId]) {
      socket.emit(SOCKET_EVENTS.ROOM_ERROR, { message: '상대방이 오프라인입니다' })
      return
    }

    getOrCreateRoom(roomId, [userId, targetUserId])
    const room = getRoomWithDetails(roomId)
    const history = getMessagesByRoomId(roomId)

    socket.join(roomId)
    const targetSocketId = onlineSockets[targetUserId]
    const targetSocket = io.sockets.sockets.get(targetSocketId)
    targetSocket?.join(roomId)

    socket.emit(SOCKET_EVENTS.ROOM_JOINED, { room, history })
    targetSocket?.emit(SOCKET_EVENTS.ROOM_INVITED, { room })
  })

  // 메시지 전송
  socket.on(SOCKET_EVENTS.MESSAGE_SEND, ({ roomId, content }) => {
    const userId = socketToUser[socket.id]
    if (!userId) return
    if (!content || content.trim() === '') return
    if (!isMember(roomId, userId)) return

    const createdAt = new Date().toISOString()
    const saved = {
      id: crypto.randomUUID(),
      roomId,
      senderId: userId,
      content: content.trim(),
      type: 'text',
      createdAt,
    }
    saveMessage(saved)

    const broadcastMsg = { ...saved, senderName: getUserById.get(userId)?.name ?? null }
    io.to(roomId).emit(SOCKET_EVENTS.MESSAGE_RECEIVE, broadcastMsg)
  })

  // 채팅방 나가기
  socket.on(SOCKET_EVENTS.ROOM_LEAVE, ({ roomId }) => {
    const userId = socketToUser[socket.id]
    if (!userId) return
    if (!isMember(roomId, userId)) return

    const userName = getUserById.get(userId)?.name ?? '알 수 없음'
    removeMember.run(roomId, userId)
    socket.leave(roomId)

    const remaining = getMemberCount(roomId)

    if (remaining > 0) {
      const sysMsg = {
        id: crypto.randomUUID(),
        roomId,
        senderId: null,
        senderName: null,
        content: `${userName}님이 나갔습니다`,
        type: 'system',
        createdAt: new Date().toISOString(),
      }
      saveMessage(sysMsg)
      io.to(roomId).emit(SOCKET_EVENTS.MESSAGE_RECEIVE, sysMsg)
    } else {
      deleteRoom.run(roomId)
    }

    socket.emit(SOCKET_EVENTS.ROOM_LEFT, { roomId })
  })

  // 연결 해제
  socket.on('disconnect', () => {
    const userId = socketToUser[socket.id]
    if (!userId) return

    delete socketToUser[socket.id]
    delete onlineSockets[userId]

    io.emit(SOCKET_EVENTS.USER_LIST, { users: getUsersByIds(getOnlineUserIds()) })
    io.emit(SOCKET_EVENTS.USER_DISCONNECT, { userId })

    const userName = getUserById.get(userId)?.name ?? '알 수 없음'
    const roomIds = getRoomsByUserId(userId)

    for (const roomId of roomIds) {
      const sysMsg = {
        id: crypto.randomUUID(),
        roomId,
        senderId: null,
        senderName: null,
        content: `${userName}님이 나갔습니다`,
        type: 'system',
        createdAt: new Date().toISOString(),
      }
      saveMessage(sysMsg)
      io.to(roomId).emit(SOCKET_EVENTS.MESSAGE_RECEIVE, sysMsg)
    }
  })
}

module.exports = { registerSocketHandlers }
