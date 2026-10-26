import { useEffect, useRef, useState } from 'react'
import { Bot, Headphones, Home, Maximize2, MessageCircle, RotateCcw, Send, X } from 'lucide-react'
import { useWorkspace } from '@/components/layout/WorkspaceContext'
import { deliverSupport, policyFor, stamp, supportFor } from '@/domain/learningLoop'
import { StreamingAiText } from './StreamingAiText'

export function LabAiAssistant({ onOpenFullAi }: { onOpenFullAi?: () => void }) {
  const { scenario: s, data, setData } = useWorkspace()
  const policy = policyFor(data, s)
  const [open, setOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [animatedIds, setAnimatedIds] = useState<number[]>([])
  const [sessionStart, setSessionStart] = useState<number | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const allMessages = data.student.privateMessages
  const start =
    sessionStart !== null
      ? Math.min(sessionStart, allMessages.length)
      : Math.min(data.student.privateConversationStart ?? 0, allMessages.length)
  const messages = allMessages.slice(start)

  function scrollToBottom() {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }

  useEffect(() => {
    if (open) {
      scrollToBottom()
    }
  }, [open, allMessages.length])

  function askAi(customText?: string) {
    const q = (customText ?? question).trim()
    if (!q) return
    if (sessionStart === null) {
      setSessionStart(data.student.privateMessages.length)
    }
    const p = supportFor(q, data, s, 'private')
    const aiMsgIndex = data.student.privateMessages.length + 1
    const next = {
      ...data,
      student: {
        ...data.student,
        privateMessages: [
          ...data.student.privateMessages,
          { author: '유송민', text: q, time: stamp(), supportId: p?.id },
        ],
      },
    }
    if (!p) {
      setData(next)
    } else {
      const queued = { ...next, supports: [...(data.supports ?? []), p] }
      setAnimatedIds(prev => [...prev, aiMsgIndex])
      setData(p.status === 'approved' ? deliverSupport(queued, p) : queued)
    }
    if (!customText) setQuestion('')
  }

  function resetChat() {
    setSessionStart(null)
    setData(prev => ({
      ...prev,
      student: {
        ...prev.student,
        privateConversationStart: prev.student.privateMessages.length,
      },
    }))
    setQuestion('')
  }

  return (
    <div className="floating-ai-root">
      {open && (
        <aside className="floating-ai-popover" aria-label="실시간 개인 AI 지원 창">
          <header className="floating-ai-banner">
            <div className="floating-ai-banner-top">
              <span className="floating-ai-brand">TRACE AI SUPPORT</span>
              <button type="button" className="floating-ai-reset" onClick={resetChat}>
                <RotateCcw size={12} /> 새 대화
              </button>
            </div>
            <strong>{s.course.name} · 개인 AI 지원</strong>
            <small>
              {policy.mode} · 개입 {policy.intervention} · 정답 직접 제공 제한
            </small>
          </header>

          <div className="floating-ai-body" ref={listRef} aria-label="실습 중 개인 AI 대화">
            {sessionStart === null && (
              <div className="floating-ai-welcome-card">
                <div className="floating-ai-welcome-head">
                  <span className="floating-ai-avatar">
                    <Bot size={16} aria-hidden="true" />
                  </span>
                  <div>
                    <strong>TRACE AI 코치</strong>
                    <p>
                      안녕하세요, 유송민 학생!
                      <br />
                      막힌 구간이나 확인할 장비를 선택해 주시면 학습목표에 맞춰 빠르게 안내해 드릴게요.
                    </p>
                  </div>
                </div>
                <ul className="floating-ai-rules">
                  <li>🎯 이번 목표 : 장애 증거 수집 · 라우팅 테이블 비교 · 양방향 검증</li>
                  <li>🤖 지원 방식 : 완성된 정답 명령어 대신 진단 순서와 확인 범위 안내</li>
                </ul>
                <button
                  type="button"
                  className="floating-ai-cta"
                  onClick={() => inputRef.current?.focus()}
                >
                  질문하기 <Send size={13} aria-hidden="true" />
                </button>
              </div>
            )}

            {messages.map((m, idx) => {
              const isAi = m.author === 'AI' || m.author === '교수자 설정 안내'
              const globalIdx = start + idx
              return (
                <div key={`${m.time}-${idx}`} className={`lab-ai-bubble ${isAi ? 'ai' : 'mine'}`}>
                  <div className="lab-ai-meta">
                    <strong>
                      {isAi && <Bot size={13} aria-hidden="true" />}
                      {m.author === 'AI' ? 'TRACE AI' : m.author}
                    </strong>
                    <time>{m.time}</time>
                  </div>
                  {isAi ? (
                    <StreamingAiText
                      text={m.text}
                      animate={animatedIds.includes(globalIdx)}
                      onTick={scrollToBottom}
                    />
                  ) : (
                    <p>{m.text}</p>
                  )}
                </div>
              )
            })}

            <div className="lab-ai-prompts" aria-label="빠른 질문 예시">
              <small>자주 묻는 질문 (클릭 시 바로 질문)</small>
              {s.prompts.slice(0, 3).map(prompt => (
                <button
                  type="button"
                  key={prompt}
                  className="lab-ai-prompt-chip"
                  onClick={() => askAi(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <form
            className="floating-ai-composer"
            onSubmit={e => {
              e.preventDefault()
              askAi()
            }}
          >
            <input
              ref={inputRef}
              aria-label="실습 중 AI 질문"
              placeholder="막힌 구간이나 확인할 장비를 질문하세요..."
              value={question}
              onChange={e => setQuestion(e.target.value)}
            />
            <button type="submit" className="button primary" disabled={!question.trim()}>
              AI 도움 요청
            </button>
          </form>

          <nav className="floating-ai-nav" aria-label="개인 AI 위젯 메뉴">
            <button
              type="button"
              onClick={() => {
                if (listRef.current) listRef.current.scrollTop = 0
              }}
            >
              <Home size={15} />
              <span>홈</span>
            </button>
            <button
              type="button"
              className="active"
              onClick={() => inputRef.current?.focus()}
            >
              <MessageCircle size={15} />
              <span>대화</span>
            </button>
            {onOpenFullAi && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  onOpenFullAi()
                }}
              >
                <Maximize2 size={15} />
                <span>전체화면</span>
              </button>
            )}
          </nav>
        </aside>
      )}

      <button
        type="button"
        className={`floating-ai-launcher ${open ? 'is-open' : ''}`}
        aria-label={open ? '1:1 개인 AI 지원 닫기' : '1:1 개인 AI 지원 열기'}
        aria-expanded={open}
        onClick={() => setOpen(prev => !prev)}
      >
        {open ? (
          <X size={24} aria-hidden="true" />
        ) : (
          <>
            <Headphones size={22} aria-hidden="true" />
            <span>1:1 AI</span>
          </>
        )}
      </button>
    </div>
  )
}
