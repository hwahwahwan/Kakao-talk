interface Props {
  date: string
}

export default function DateDivider({ date }: Props) {
  return (
    <div className="flex justify-center my-4">
      <span className="bg-black/10 text-white px-4 py-1 rounded-full text-xs font-label">
        {date}
      </span>
    </div>
  )
}
