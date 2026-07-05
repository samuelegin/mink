export default function InsightsCard() {
  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-white p-5">
      <h3 className="font-display font-bold text-base">This month</h3>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-[var(--color-ink-soft)]">Received</p>
          <p className="font-display font-bold text-xl text-[var(--color-moss)] mt-0.5">$0.00</p>
        </div>
        <div>
          <p className="text-xs text-[var(--color-ink-soft)]">Sent</p>
          <p className="font-display font-bold text-xl mt-0.5">$0.00</p>
        </div>
      </div>
    </div>
  )
}
