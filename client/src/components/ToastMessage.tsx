import { useChatStore } from '../store/useChatStore'

export default function ToastMessage() {
  const toastMessage = useChatStore((s) => s.toastMessage)

  if (!toastMessage) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#333] text-white text-sm px-4 py-2 rounded-full shadow-lg pointer-events-none">
      {toastMessage}
    </div>
  )
}
