// 클라이언트 constants/socket.ts와 이벤트 이름 동일하게 유지
const SOCKET_EVENTS = {
  // 유저
  USER_JOIN: 'user:join',
  USER_JOINED: 'user:joined',
  USER_LIST: 'user:list',
  USER_DISCONNECT: 'user:disconnect',
  // 채팅방
  ROOM_CREATE: 'room:create',
  ROOM_JOINED: 'room:joined',
  ROOM_INVITED: 'room:invited',
  ROOM_LIST: 'room:list',
  ROOM_LEAVE: 'room:leave',
  ROOM_LEFT: 'room:left',
  ROOM_ERROR: 'room:error',
  // 메시지
  MESSAGE_SEND: 'message:send',
  MESSAGE_RECEIVE: 'message:receive',
  // 재접속
  ROOM_REJOIN: 'room:rejoin',
  ROOM_REJOINED: 'room:rejoined',
  // 인증
  USER_JOIN_ERROR: 'user:join_error',
}

module.exports = { SOCKET_EVENTS }
