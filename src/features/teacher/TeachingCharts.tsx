export function ProgressRing({ value, label, tone = 'mint', center }: { value: number; label: string; tone?: string; center?: string }) {
  const percent = Math.max(0, Math.min(100, value))
  return <span className={`progress-ring chart-${tone}`} role="img" aria-label={`${label} ${Math.round(percent)}%`}>
    <svg viewBox="0 0 100 100" aria-hidden="true"><circle className="ring-track" cx="50" cy="50" r="41" />{percent > 0 && <circle className="ring-value" cx="50" cy="50" r="41" pathLength="100" strokeDasharray={`${percent} 100`} transform="rotate(-90 50 50)" />}</svg>
    <strong aria-hidden="true">{center ?? `${Math.round(percent)}%`}</strong>
  </span>
}
