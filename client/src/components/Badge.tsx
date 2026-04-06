interface Props {
  count: number
}

export default function Badge({ count }: Props) {
  if (count <= 0) return null

  return (
    <span className="bg-badge-red text-white text-[9px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1.5 leading-none">
      {count > 999 ? '999+' : count}
    </span>
  )
}
