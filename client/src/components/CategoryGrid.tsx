import { CATEGORIES, type CategoryId } from '../constants/categories'

interface Props {
  selectedIds: (CategoryId | null)[]
  onSelect: (id: CategoryId) => void
}

export default function CategoryGrid({ selectedIds, onSelect }: Props) {
  return (
    <div className="flex items-center justify-center gap-1.5 py-4 px-6 flex-wrap">
      {CATEGORIES.map((cat) => {
        const isSelected = selectedIds.includes(cat.id)
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-xl transition-all ${
              isSelected
                ? 'bg-primary-container text-on-surface scale-105 shadow-sm'
                : 'hover:bg-surface-container text-secondary'
            }`}
          >
            <span className="text-2xl leading-none">{cat.emoji}</span>
            <span className="text-[11px] font-medium font-label">{cat.label}</span>
          </button>
        )
      })}
    </div>
  )
}
