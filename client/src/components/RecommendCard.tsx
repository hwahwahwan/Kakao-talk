interface Props {
  image?: string
  title: string
  subtitle?: string
  meta?: string
}

export default function RecommendCard({ image, title, subtitle, meta }: Props) {
  return (
    <div className="flex-shrink-0 w-36 rounded-xl overflow-hidden bg-surface-container-lowest border border-outline-variant/20 shadow-sm">
      <div className="h-24 bg-surface-container-high overflow-hidden flex items-center justify-center">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <span className="material-symbols-outlined text-3xl text-secondary opacity-40">image</span>
        )}
      </div>
      <div className="p-2.5 space-y-0.5">
        <p className="font-headline font-medium text-xs text-on-surface truncate leading-tight">{title}</p>
        {subtitle && <p className="text-[10px] text-secondary truncate">{subtitle}</p>}
        {meta && <p className="text-[10px] text-secondary">{meta}</p>}
      </div>
    </div>
  )
}
