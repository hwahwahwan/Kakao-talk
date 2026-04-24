import { CATEGORIES, type CategoryId } from '../constants/categories'

interface Props {
  selectedIds: (CategoryId | null)[]
  onSelect: (id: CategoryId) => void
}

export default function CategoryGrid({ selectedIds, onSelect }: Props) {
  return (
    <div className="flex items-center justify-between w-full py-8 px-16">
      {CATEGORIES.map((cat) => {
        const isSelected = selectedIds.includes(cat.id)
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`flex flex-col items-center gap-2 px-10 py-6 rounded-2xl transition-all w-52 ${
              isSelected
                ? 'bg-primary-container text-on-surface scale-105 shadow-sm'
                : 'hover:bg-surface-container text-secondary'
            }`}
          >
            <span className="text-4xl leading-none">{cat.emoji}</span>
            <span className="text-base font-medium font-label">{cat.label}</span>
          </button>
        )
      })}
    </div>
  )
}
