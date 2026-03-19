export const SOCKET_EVENTS = {
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
} as const
