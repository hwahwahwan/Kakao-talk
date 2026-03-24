// 런타임 소켓 상태만 관리 (영속 데이터는 DB에서 관리)

// socketId → userId
const socketToUser = {}

// userId → socketId  (온라인 여부 판단용)
const onlineSockets = {}

function getOnlineUserIds() {
  return Object.keys(onlineSockets)
}

module.exports = { socketToUser, onlineSockets, getOnlineUserIds }
