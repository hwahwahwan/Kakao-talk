interface Props {
  rank: number
  image?: string
  title: string
  subtitle?: string
}

export default function RecommendCard({ rank, image, title, subtitle }: Props) {
  return (
    <article className="rounded-2xl overflow-hidden bg-white border border-[#ececec] shadow-[0_2px_6px_rgba(0,0,0,0.04)] hover:scale-[1.02] hover:shadow-md transition-all duration-200 cursor-pointer">
      <div className="relative" style={{ aspectRatio: '3/4' }}>
        <div className="absolute inset-0 bg-[#f3f3f3]">
          {image && <img src={image} alt={title} className="w-full h-full object-cover block" />}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent from-[45%] to-black/55" />
        <span className="absolute top-3 left-3 text-[10px] font-bold text-[#1b1b1b] bg-white/95 px-2.5 py-1 rounded-full tracking-[0.06em]">
          {String(rank).padStart(2, '0')}
        </span>
        <div className="absolute left-4 right-4 bottom-3.5 text-white">
          <div className="text-[17px] font-bold tracking-[-0.01em] [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]">{title}</div>
          {subtitle && (
            <div className="mt-0.5 text-xs opacity-90 [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]">{subtitle}</div>
          )}
        </div>
      </div>
    </article>
  )
}
