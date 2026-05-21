import { useState } from 'react'
import { useChatStore } from './store/useChatStore'
import { useSocket } from './hooks/useSocket'
import LoginScreen from './components/LoginScreen'
import Sidebar from './components/Sidebar'
import FriendList from './components/FriendList'
import ChatList from './components/ChatList'
import ChatWindow from './components/ChatWindow'
import MoreTab from './components/MoreTab'
import ChatbotPanel from './components/ChatbotPanel'
import SettingsModal from './components/SettingsModal'
import ToastMessage from './components/ToastMessage'
import CategoryPage from './pages/CategoryPage'
import GazeCursor from './components/GazeCursor'

export default function App() {
  const me = useChatStore((s) => s.me)
  const activeTab = useChatStore((s) => s.activeTab)
  const rooms = useChatStore((s) => s.rooms)
  const activeRoomId = useChatStore((s) => s.activeRoomId)
  const setActiveRoom = useChatStore((s) => s.setActiveRoom)
  const setActiveTab = useChatStore((s) => s.setActiveTab)

  const [settingsOpen, setSettingsOpen] = useState(false)
  const { joinAs, createRoom, sendMessage, leaveRoom, loginError, clearLoginError } = useSocket()

  const handleJoin = (email: string, password: string) => {
    joinAs(email, password)
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
        <LoginScreen
            onJoin={(email, password) => handleJoin(email, password)}
            serverError={loginError}
            onClearServerError={clearLoginError}
          />
        <ToastMessage />
      </>
    )
  }

  return (
    <div className="flex h-full bg-surface">
      {/* 사이드바 */}
      <Sidebar onOpenSettings={() => setSettingsOpen(true)} />

      {activeTab === 'chatbot' ? (
        <div className="flex-1 min-w-0 ml-[72px]">
          <ChatbotPanel />
        </div>
      ) : activeTab === 'category' ? (
        <div className="flex-1 min-w-0 ml-[72px]">
          <CategoryPage />
        </div>
      ) : activeTab === 'chats' ? (
        activeRoomId ? (
          <div className="flex-1 min-w-0 ml-[72px] flex">
            <ChatWindow onSend={handleSend} onLeave={handleLeave} />
          </div>
        ) : (
          <div className="ml-[72px] flex-1 flex flex-col bg-surface">
            <ChatList onRoomClick={handleRoomClick} />
          </div>
        )
      ) : (
        <div className="ml-[72px] flex-1 flex flex-col bg-surface">
          {activeTab === 'friends' && (
            <FriendList onFriendClick={handleFriendClick} />
          )}
          {activeTab === 'more' && <MoreTab onOpenSettings={() => setSettingsOpen(true)} />}
        </div>
      )}

      {/* 설정 모달 */}
      {settingsOpen && (
        <SettingsModal onClose={() => setSettingsOpen(false)} />
      )}

      {/* 토스트 */}
      <ToastMessage />

      {/* 시선 커서 — 카테고리 탭에서만 표시 */}
      {activeTab === 'category' && <GazeCursor />}
    </div>
  )
}
