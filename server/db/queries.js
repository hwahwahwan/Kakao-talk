const db = require('./index')

// ── 유저 ──────────────────────────────────────────────

const findUserByCredentials = db.prepare(
  'SELECT id, name, email FROM users WHERE email = ? AND password = ?'
)

const getUserById = db.prepare('SELECT id, name, email FROM users WHERE id = ?')

function getUsersByIds(ids) {
  if (ids.length === 0) return []
  const placeholders = ids.map(() => '?').join(',')
  return db.prepare(`SELECT id, name, email FROM users WHERE id IN (${placeholders})`).all(ids)
}

// ── 룸 ───────────────────────────────────────────────

const getOrCreateRoom = db.transaction((roomId, userIds) => {
  db.prepare('INSERT OR IGNORE INTO rooms (id) VALUES (?)').run(roomId)
  const insertMember = db.prepare(
    'INSERT OR IGNORE INTO room_members (room_id, user_id) VALUES (?, ?)'
  )
  for (const uid of userIds) {
    insertMember.run(roomId, uid)
  }
})

function getRoomMembers(roomId) {
  return db
    .prepare(
      'SELECT u.id, u.name FROM users u JOIN room_members rm ON u.id = rm.user_id WHERE rm.room_id = ?'
    )
    .all(roomId)
}

function getLastMessage(roomId) {
  return (
    db
      .prepare(
        `SELECT m.id, m.room_id AS roomId, m.sender_id AS senderId,
                u.name AS senderName, m.content, m.type, m.created_at AS createdAt
         FROM messages m
         LEFT JOIN users u ON m.sender_id = u.id
         WHERE m.room_id = ?
         ORDER BY m.created_at DESC
         LIMIT 1`
      )
      .get(roomId) ?? undefined
  )
}

function getRoomWithDetails(roomId) {
  const exists = db.prepare('SELECT id FROM rooms WHERE id = ?').get(roomId)
  if (!exists) return null
  return {
    id: roomId,
    members: getRoomMembers(roomId),
    lastMessage: getLastMessage(roomId),
  }
}

function getRoomsByUserId(userId) {
  return db
    .prepare('SELECT room_id FROM room_members WHERE user_id = ?')
    .all(userId)
    .map((r) => r.room_id)
}

function isMember(roomId, userId) {
  return !!db
    .prepare('SELECT 1 FROM room_members WHERE room_id = ? AND user_id = ?')
    .get(roomId, userId)
}

const removeMember = db.prepare('DELETE FROM room_members WHERE room_id = ? AND user_id = ?')

function getMemberCount(roomId) {
  const row = db.prepare('SELECT COUNT(*) AS cnt FROM room_members WHERE room_id = ?').get(roomId)
  return row?.cnt ?? 0
}

const deleteRoom = db.prepare('DELETE FROM rooms WHERE id = ?')

// ── 메시지 ────────────────────────────────────────────

function saveMessage({ id, roomId, senderId, content, type, createdAt }) {
  db.prepare(
    'INSERT INTO messages (id, room_id, sender_id, content, type, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, roomId, senderId ?? null, content, type, createdAt)
}

function getMessagesByRoomId(roomId, limit = 50) {
  return db
    .prepare(
      `SELECT m.id, m.room_id AS roomId, m.sender_id AS senderId,
              u.name AS senderName, m.content, m.type, m.created_at AS createdAt
       FROM messages m
       LEFT JOIN users u ON m.sender_id = u.id
       WHERE m.room_id = ?
       ORDER BY m.created_at ASC
       LIMIT ?`
    )
    .all(roomId, limit)
}

module.exports = {
  findUserByCredentials,
  getUserById,
  getUsersByIds,
  getOrCreateRoom,
  getRoomWithDetails,
  getRoomMembers,
  getLastMessage,
  getRoomsByUserId,
  isMember,
  removeMember,
  getMemberCount,
  deleteRoom,
  saveMessage,
  getMessagesByRoomId,
}
