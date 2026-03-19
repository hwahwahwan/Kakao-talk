interface Props {
  name: string
  size?: number
  className?: string
}

const BG_COLORS = [
  'bg-blue-400',
  'bg-green-400',
  'bg-purple-400',
  'bg-orange-400',
  'bg-pink-400',
  'bg-teal-400',
  'bg-indigo-400',
  'bg-red-400',
]

function getBgColor(name: string) {
  const code = name.charCodeAt(0) || 0
  return BG_COLORS[code % BG_COLORS.length]
}

export default function Avatar({ name, size = 40, className = '' }: Props) {
  const bgColor = getBgColor(name)
  const initial = name.charAt(0).toUpperCase()

  return (
    <div
      className={`${bgColor} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initial}
    </div>
  )
}
