interface Props {
  date: string
}

export default function DateDivider({ date }: Props) {
  return (
    <div className="flex items-center justify-center my-3">
      <span className="bg-black/20 text-white text-[12px] px-3 py-1 rounded-full">
        {date}
      </span>
    </div>
  )
}
