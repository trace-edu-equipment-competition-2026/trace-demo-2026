import { useEffect, useRef, useState } from 'react'

// AI 응답 준비(그라데이션·점 애니메이션) 및 글자 스트리밍 표시
export function StreamingAiText({
  text,
  animate,
  onTick,
}: {
  text: string
  animate: boolean
  onTick?: () => void
}) {
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const shouldAnimate = animate && !reducedMotion

  const [phase, setPhase] = useState<'thinking' | 'streaming' | 'done'>(() =>
    shouldAnimate ? 'thinking' : 'done',
  )
  const [visibleLen, setVisibleLen] = useState(() => (shouldAnimate ? 0 : text.length))
  const onTickRef = useRef(onTick)

  useEffect(() => {
    onTickRef.current = onTick
  }, [onTick])

  useEffect(() => {
    if (!shouldAnimate) return
    const thinkTimer = window.setTimeout(() => {
      setPhase('streaming')
      onTickRef.current?.()
    }, 1000)

    return () => window.clearTimeout(thinkTimer)
  }, [shouldAnimate, text])

  useEffect(() => {
    if (phase !== 'streaming') return
    const step = Math.max(2, Math.ceil(text.length / 38))
    const interval = window.setInterval(() => {
      setVisibleLen(prev => {
        const next = prev + step
        if (next >= text.length) {
          window.clearInterval(interval)
          setPhase('done')
          return text.length
        }
        return next
      })
      onTickRef.current?.()
    }, 28)

    return () => window.clearInterval(interval)
  }, [phase, text])

  if (!shouldAnimate || phase === 'done') {
    return <p>{text}</p>
  }

  if (phase === 'thinking') {
    return (
      <div className="ai-thinking-box" role="status" aria-live="polite">
        <div className="ai-thinking-header">
          <span className="ai-thinking-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="ai-thinking-label">학습 맥락과 실습 상태를 확인하여 답변 준비 중...</span>
        </div>
        <div className="ai-thinking-shimmer" aria-hidden="true">
          <span className="shimmer-line full" />
          <span className="shimmer-line short" />
        </div>
      </div>
    )
  }

  return (
    <p className="ai-streaming-text">
      {text.slice(0, visibleLen)}
      <span className="ai-stream-cursor" aria-hidden="true">
        ▍
      </span>
    </p>
  )
}
