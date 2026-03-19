// 기능 테스트 스크립트
const { io } = require('socket.io-client')

const SERVER = 'http://localhost:4000'
const PASS = '✅'
const FAIL = '❌'

let passed = 0
let failed = 0

function assert(condition, label) {
  if (condition) {
    console.log(`  ${PASS} ${label}`)
    passed++
  } else {
    console.log(`  ${FAIL} ${label}`)
    failed++
  }
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function run() {
  console.log('\n=== KakaoTalk 서버 기능 테스트 ===\n')

  // ── 테스트 1: 유저 입장 ──────────────────────────────
  console.log('[1] 유저 입장 (user:join → user:joined)')
  await new Promise((resolve) => {
    const client = io(SERVER)
    client.on('connect', () => {
      client.emit('user:join', { name: '철수' })
    })
    client.on('user:joined', ({ me, onlineUsers }) => {
      assert(me.name === '철수', 'me.name === 철수')
      assert(typeof me.id === 'string' && me.id.length > 0, 'me.id 발급됨')
      assert(Array.isArray(onlineUsers), 'onlineUsers 배열')
      client.disconnect()
      resolve()
    })
  })

  await delay(200)

  // ── 테스트 2: 두 유저 접속 → user:list 브로드캐스트 ──
  console.log('\n[2] 두 유저 접속 시 user:list 브로드캐스트')
  await new Promise((resolve) => {
    const a = io(SERVER)
    let aId = null
    let listReceived = false

    a.on('connect', () => a.emit('user:join', { name: '철수' }))
    a.on('user:joined', ({ me }) => { aId = me.id })
    a.on('user:list', ({ users }) => {
      if (listReceived) return
      const names = users.map(u => u.name)
      if (names.includes('영희')) {
        listReceived = true
        assert(names.includes('철수'), 'user:list에 철수 포함')
        assert(names.includes('영희'), 'user:list에 영희 포함')
        a.disconnect()
        b.disconnect()
        resolve()
      }
    })

    const b = io(SERVER)
    b.on('connect', () => b.emit('user:join', { name: '영희' }))
  })

  await delay(200)

  // ── 테스트 3: 채팅방 생성 (room:create) ─────────────
  console.log('\n[3] 1:1 채팅방 생성 (room:create → room:joined + room:invited)')
  await new Promise((resolve) => {
    const a = io(SERVER)
    const b = io(SERVER)
    let aId = null
    let bId = null
    let roomJoined = false
    let roomInvited = false

    a.on('connect', () => a.emit('user:join', { name: '철수' }))
    a.on('user:joined', ({ me }) => { aId = me.id })

    b.on('connect', () => b.emit('user:join', { name: '영희' }))
    b.on('user:joined', ({ me }) => {
      bId = me.id
      // 영희가 입장한 뒤 철수가 방 생성
      setTimeout(() => {
        a.emit('room:create', { targetUserId: bId })
      }, 100)
    })

    a.on('room:joined', ({ room, history }) => {
      roomJoined = true
      assert(room.id.includes(aId.slice(0, 4)) || room.id.length > 10, 'roomId 생성됨')
      assert(Array.isArray(room.members) && room.members.length === 2, 'members 2명')
      assert(Array.isArray(history), 'history 배열')
      checkDone()
    })

    b.on('room:invited', ({ room }) => {
      roomInvited = true
      assert(Array.isArray(room.members) && room.members.length === 2, 'invited room members 2명')
      checkDone()
    })

    function checkDone() {
      if (roomJoined && roomInvited) {
        a.disconnect()
        b.disconnect()
        resolve()
      }
    }
  })

  await delay(200)

  // ── 테스트 4: 실시간 메시지 송수신 ──────────────────
  console.log('\n[4] 실시간 메시지 송수신 (message:send → message:receive)')
  await new Promise((resolve) => {
    const a = io(SERVER)
    const b = io(SERVER)
    let roomId = null
    let aId = null
    let bId = null
    let msgReceivedByA = false
    let msgReceivedByB = false

    a.on('connect', () => a.emit('user:join', { name: '철수' }))
    a.on('user:joined', ({ me }) => { aId = me.id })

    b.on('connect', () => b.emit('user:join', { name: '영희' }))
    b.on('user:joined', ({ me }) => {
      bId = me.id
      setTimeout(() => a.emit('room:create', { targetUserId: bId }), 100)
    })

    a.on('room:joined', ({ room }) => {
      roomId = room.id
      setTimeout(() => {
        a.emit('message:send', { roomId, content: '안녕하세요!' })
      }, 100)
    })

    a.on('message:receive', (msg) => {
      if (msg.content === '안녕하세요!') {
        msgReceivedByA = true
        assert(msg.senderId === aId, '발신자 ID 정확')
        assert(msg.type === 'text', 'type === text')
        assert(msg.roomId === roomId, 'roomId 정확')
        checkDone()
      }
    })

    b.on('message:receive', (msg) => {
      if (msg.content === '안녕하세요!') {
        msgReceivedByB = true
        assert(msg.senderName === '철수', 'senderName === 철수')
        checkDone()
      }
    })

    function checkDone() {
      if (msgReceivedByA && msgReceivedByB) {
        assert(true, 'A와 B 모두 message:receive 수신 (io.to 발신자 포함)')
        a.disconnect()
        b.disconnect()
        resolve()
      }
    }
  })

  await delay(200)

  // ── 테스트 5: 빈 메시지 차단 ────────────────────────
  console.log('\n[5] 빈 메시지 전송 차단')
  await new Promise((resolve) => {
    const a = io(SERVER)
    const b = io(SERVER)
    let roomId = null
    let bId = null
    let receivedCount = 0

    a.on('connect', () => a.emit('user:join', { name: '철수' }))
    b.on('connect', () => b.emit('user:join', { name: '영희' }))
    b.on('user:joined', ({ me }) => {
      bId = me.id
      setTimeout(() => a.emit('room:create', { targetUserId: bId }), 100)
    })
    a.on('room:joined', ({ room }) => {
      roomId = room.id
      // 빈 메시지와 공백 메시지 전송
      a.emit('message:send', { roomId, content: '' })
      a.emit('message:send', { roomId, content: '   ' })
      // 정상 메시지 전송
      setTimeout(() => {
        a.emit('message:send', { roomId, content: '정상메시지' })
      }, 100)
    })
    a.on('message:receive', (msg) => {
      if (msg.type === 'text') receivedCount++
      if (msg.content === '정상메시지') {
        assert(receivedCount === 1, '빈/공백 메시지 차단, 정상 메시지만 수신')
        a.disconnect()
        b.disconnect()
        resolve()
      }
    })
  })

  await delay(200)

  // ── 테스트 6: 오프라인 유저에게 room:create → room:error ─
  console.log('\n[6] 오프라인 유저 room:create → room:error')
  await new Promise((resolve) => {
    const a = io(SERVER)
    a.on('connect', () => a.emit('user:join', { name: '철수' }))
    a.on('user:joined', () => {
      // 존재하지 않는 userId
      a.emit('room:create', { targetUserId: 'nonexistent-user-id' })
    })
    a.on('room:error', ({ message }) => {
      assert(message === '상대방이 오프라인입니다', 'room:error 메시지 정확')
      a.disconnect()
      resolve()
    })
  })

  await delay(200)

  // ── 테스트 7: 유저 퇴장 → user:disconnect 브로드캐스트 ─
  console.log('\n[7] 유저 퇴장 → user:list 갱신 + 시스템 메시지')
  await new Promise((resolve) => {
    const a = io(SERVER)
    const b = io(SERVER)
    let bId = null
    let roomId = null
    let systemMsgReceived = false
    let userListUpdated = false

    a.on('connect', () => a.emit('user:join', { name: '철수' }))
    b.on('connect', () => b.emit('user:join', { name: '영희' }))
    b.on('user:joined', ({ me }) => {
      bId = me.id
      setTimeout(() => a.emit('room:create', { targetUserId: bId }), 100)
    })
    a.on('room:joined', ({ room }) => {
      roomId = room.id
      // 영희 퇴장
      setTimeout(() => b.disconnect(), 200)
    })
    a.on('message:receive', (msg) => {
      if (msg.type === 'system' && msg.content.includes('영희')) {
        systemMsgReceived = true
        assert(true, '시스템 메시지 수신: ' + msg.content)
        checkDone()
      }
    })
    a.on('user:list', ({ users }) => {
      const names = users.map(u => u.name)
      if (!names.includes('영희')) {
        userListUpdated = true
        assert(true, '영희 퇴장 후 user:list에서 제거됨')
        checkDone()
      }
    })

    function checkDone() {
      if (systemMsgReceived && userListUpdated) {
        a.disconnect()
        resolve()
      }
    }

    // 타임아웃 안전장치
    setTimeout(() => {
      if (!systemMsgReceived) assert(false, '시스템 메시지 수신 타임아웃')
      if (!userListUpdated) assert(false, 'user:list 갱신 타임아웃')
      a.disconnect()
      resolve()
    }, 3000)
  })

  await delay(200)

  // ── 테스트 8: 중복 방 방지 ───────────────────────────
  console.log('\n[8] 중복 방 방지 (같은 두 유저 room:create 2번)')
  await new Promise((resolve) => {
    const a = io(SERVER)
    const b = io(SERVER)
    let bId = null
    let joinedRoomIds = []

    a.on('connect', () => a.emit('user:join', { name: '철수' }))
    b.on('connect', () => b.emit('user:join', { name: '영희' }))
    b.on('user:joined', ({ me }) => {
      bId = me.id
      setTimeout(() => {
        a.emit('room:create', { targetUserId: bId })
      }, 100)
    })
    a.on('room:joined', ({ room }) => {
      joinedRoomIds.push(room.id)
      if (joinedRoomIds.length === 1) {
        // 같은 방 다시 생성 시도
        setTimeout(() => {
          a.emit('room:create', { targetUserId: bId })
        }, 100)
      }
      if (joinedRoomIds.length === 2) {
        assert(joinedRoomIds[0] === joinedRoomIds[1], '두 번 생성해도 같은 roomId')
        a.disconnect()
        b.disconnect()
        resolve()
      }
    })
  })

  // ── 결과 출력 ────────────────────────────────────────
  console.log('\n' + '─'.repeat(40))
  console.log(`결과: ${passed}개 통과 / ${failed}개 실패`)
  if (failed === 0) console.log('🎉 모든 테스트 통과!')
  else console.log('⚠️  일부 테스트 실패')
  console.log('─'.repeat(40) + '\n')

  process.exit(failed > 0 ? 1 : 0)
}

run().catch((err) => {
  console.error('테스트 오류:', err)
  process.exit(1)
})
