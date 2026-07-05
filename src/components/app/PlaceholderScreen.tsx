export default function PlaceholderScreen({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-md px-4 pt-6 pb-28">
      <h2 className="font-display font-bold text-2xl">{title}</h2>
      <div className="mt-6 rounded-2xl border border-dashed border-[var(--color-line)] p-8 text-center">
        <p className="text-sm text-[var(--color-ink-soft)]">This screen is next up.</p>
      </div>
    </div>
  )
}