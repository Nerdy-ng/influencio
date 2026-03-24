import { useEffect, useRef, useState } from 'react'

const stats = [
  { value: 15000, suffix: '+',  label: 'Active Talents',        color: 'text-white'        },
  { value: 3500,  suffix: '+',  label: 'SMB Brands',             color: 'text-white'        },
  { value: 8.2,   prefix: '₦', suffix: 'B+', label: 'Paid to Talents', color: 'text-[#c084fc]', decimals: 1 },
  { value: 97,    suffix: '%',  label: 'Campaign Success Rate',  color: 'text-[#c084fc]' },
]

function useCountUp(target, duration = 2000, decimals = 0) {
  const [count, setCount] = useState(0)
  const ref     = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const start = performance.now()
          const animate = (now) => {
            const progress = Math.min((now - start) / duration, 1)
            const eased    = 1 - Math.pow(1 - progress, 3)
            setCount(+(eased * target).toFixed(decimals))
            if (progress < 1) requestAnimationFrame(animate)
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration, decimals])

  return [count, ref]
}

function StatItem({ value, suffix, prefix, label, color, decimals = 0 }) {
  const [count, ref] = useCountUp(value, 2000, decimals)
  return (
    <div ref={ref} className="text-center">
      <div className={`text-5xl lg:text-6xl font-black mb-3 ${color} tabular-nums`}>
        {prefix}{decimals > 0 ? count.toFixed(decimals) : Math.floor(count)}{suffix}
      </div>
      <p className="text-white/30 text-xs font-semibold uppercase tracking-widest">{label}</p>
    </div>
  )
}

export default function Stats() {
  return (
    <section className="bg-brand-dark py-24 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] px-10 py-8 flex flex-wrap items-center gap-8 lg:gap-0 lg:divide-x divide-white/5">
          <p className="text-xs font-semibold uppercase tracking-widest lg:pr-10 whitespace-nowrap" style={{ color: '#D4AF37' }}>
            Platform numbers<br className="hidden lg:block" /> that speak for<br className="hidden lg:block" /> themselves
          </p>
          {stats.map(s => (
            <div key={s.label} className="lg:flex-1 lg:px-8">
              <StatItem {...s} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
