import { useState } from 'react'
import { useChatStore } from './store/useChatStore'
import { useSocket } from './hooks/useSocket'
import LoginScreen from './components/LoginScreen'
import Sidebar from './components/Sidebar'
import FriendList from './components/FriendList'
import ChatList from './components/ChatList'
import ChatWindow from './components/ChatWindow'
import MoreTab from './components/MoreTab'
import SettingsModal from './components/SettingsModal'
import ToastMessage from './components/ToastMessage'

export default function App() {
  const me = useChatStore((s) => s.me)
  const activeTab = useChatStore((s) => s.activeTab)
  const rooms = useChatStore((s) => s.rooms)
  const activeRoomId = useChatStore((s) => s.activeRoomId)
  const setActiveRoom = useChatStore((s) => s.setActiveRoom)
  const setActiveTab = useChatStore((s) => s.setActiveTab)

  const [settingsOpen, setSettingsOpen] = useState(false)
  const { joinAs, createRoom, sendMessage, leaveRoom } = useSocket()

  const handleJoin = (name: string, email: string) => {
    joinAs(name, email)
  }

  const handleFriendClick = (userId: string) => {
    const myId = me?.id
    if (!myId) return
    // 이미 해당 유저와의 방이 있으면 바로 열기
    const existingRoom = rooms.find(
      (r) => r.members.some((m) => m.id === userId) && r.members.some((m) => m.id === myId)
    )
    if (existingRoom) {
      setActiveRoom(existingRoom.id)
      setActiveTab('chats')
    } else {
      createRoom(userId)
    }
  }

  const handleRoomClick = (roomId: string) => {
    setActiveRoom(roomId)
  }

  const handleSend = (content: string) => {
    if (!activeRoomId) return
    sendMessage(activeRoomId, content)
  }

  const handleLeave = () => {
    if (activeRoomId) leaveRoom(activeRoomId)
  }

  if (!me) {
    return (
      <>
        <LoginScreen onJoin={(name, email) => handleJoin(name, email)} />
        <ToastMessage />
      </>
    )
  }

  return (
    <div className="flex h-full bg-white">
      {/* 사이드바 */}
      <Sidebar onOpenSettings={() => setSettingsOpen(true)} />

      {/* 패널 영역 */}
      <div className="w-[320px] flex-shrink-0 border-r border-[#EBEBEB] flex flex-col">
        {activeTab === 'friends' && (
          <FriendList onFriendClick={handleFriendClick} />
        )}
        {activeTab === 'chats' && (
          <ChatList onRoomClick={handleRoomClick} />
        )}
        {activeTab === 'more' && <MoreTab />}
      </div>

      {/* 채팅창 */}
      <ChatWindow onSend={handleSend} onLeave={handleLeave} />

      {/* 설정 모달 */}
      {settingsOpen && (
        <SettingsModal onClose={() => setSettingsOpen(false)} />
      )}

      {/* 토스트 */}
      <ToastMessage />
    </div>
  )
}
