import { useState } from 'react'
import { ClipboardCheck, MessageCircle, RefreshCw } from 'lucide-react'
import { applySituation, makeEvidence, policyFor, stamp } from '@/domain/learningLoop'
import { useWorkspace } from './WorkspaceContext'
import { SectionTitle } from './SectionTitle'

export function SituationPanel({ teacher = false }: { teacher?: boolean }) {
  const { data, setData, scenario: s } = useWorkspace()
  const policy = policyFor(data, s)
  const situation = data.situation
  const [response, setResponse] = useState('')
  const [edit, setEdit] = useState('')
  const [notice, setNotice] = useState('')

  const waiting = situation?.status === 'pending'
  const active = situation?.status === 'active'
  const draft = edit || situation?.title || ''
  const visible = situation && (teacher || situation.status === 'active' || situation.status === 'complete')
  const sources =
    (visible ? situation.sourceIds : undefined)
      ?.map(id => data.student.resources.find(r => r.id === id))
      .filter(r => !!r) ?? []

  function saveResponse() {
    if (!response.trim() || !situation) return
    setData({
      ...data,
      situation: { ...situation, response: response.trim() },
      evidence: [
        ...data.evidence,
        makeEvidence(data, s, {
          title: '변경 상황에 대한 재분석과 팀 합의',
          detail: response.trim(),
          owner: '유송민',
          source: '학생 공유 · 상황 대응 계획',
          criterion: '해결 과정',
          time: stamp(),
          stage: 2,
          kind: 'plan',
          raw: `적용된 추가 조건: ${situation.title}\n이전 검증 설명: ${situation.previous}`,
        }),
      ],
    })
    setNotice('재분석과 팀 합의를 저장했습니다. 새 조건의 조사·실행 원자료도 팀 자료에 공유하세요.')
  }

  return (
    <section className={teacher ? 'detail-section learning-loop' : 'panel learning-loop'}>
      <div className="section-heading">
        <SectionTitle icon={RefreshCw}>
          {teacher ? (policy.mode === '교수자 승인형' ? '추가 문제 상황 승인' : 'AI 추가 문제 상황') : '추가 문제 상황과 수행 조건'}
        </SectionTitle>
        <span className="teach-badge yellow">
          {waiting
            ? '교수자 검토 대기'
            : active
              ? '추가 조건 수행 중'
              : situation?.status === 'complete'
                ? '재검증 근거 공유됨'
                : situation?.status === 'rejected'
                  ? '제안 거절됨'
                  : 'AI가 수행 맥락 확인 중'}
        </span>
      </div>
      <p className="section-note">
        프로젝트 상의와 일반 가이던스는 바로 제공됩니다. 승인형 과제에 선행 단계나 심화 조건을 추가할 때 교수자가 검토합니다.
      </p>
      {waiting && !teacher ? (
        <p role="status">AI가 수행 맥락을 보고 추가 문제 상황을 교수자에게 제안했습니다. 승인 전이므로 기존 과제를 계속 진행하세요.</p>
      ) : visible ? (
        <>
          <dl className="situation-conditions">
            <dt>원래 과제</dt>
            <dd>{situation.original || policy.description}</dd>
            <dt>{situation.purpose || '추가 수행 조건'}</dt>
            <dd>{situation.title}</dd>
            <dt>AI 판단 이유</dt>
            <dd>{situation.reason}</dd>
            <dt>추가로 남길 학습 증거</dt>
            <dd>{situation.expectedEvidence || '변경 전후 원자료, 선택 이유, 새 조건의 검증 결과'}</dd>
          </dl>
          {situation.basis?.length && (
            <details className="situation-sources">
              <summary>AI 판단에 사용한 채팅·학습 증거 {situation.basis.length}개</summary>
              {situation.basis.map((item, i) => (
                <section key={i}>
                  <h3>{item.title}</h3>
                  <pre>{item.raw}</pre>
                </section>
              ))}
            </details>
          )}
          {situation.reviewedAt && (
            <p className="section-note">
              {situation.reviewedBy} 승인 · {situation.reviewedAt}
            </p>
          )}
          {sources.length > 0 && (
            <details className="situation-sources">
              <summary>제안에 연결된 조사·수행 원자료 {sources.length}개</summary>
              {sources.map(r => (
                <section key={r.id}>
                  <h3>
                    {r.name} · {r.author} · v{r.version}
                  </h3>
                  <pre>{r.body}</pre>
                </section>
              ))}
            </details>
          )}
          <details>
            <summary>이전 검증과 현재 대응</summary>
            <p>이전 판단: {situation.previous}</p>
            <p>팀 대응: {situation.response || '아직 합의 기록이 없습니다.'}</p>
          </details>
        </>
      ) : situation?.status === 'rejected' ? (
        <p>교수자가 추가 조건을 적용하지 않기로 했습니다. 원래 과제를 계속 수행하세요.</p>
      ) : (
        <p>AI가 채팅·수행 기록·학습 증거에서 어려움이나 성공 근거를 관찰하면 필요한 추가 상황을 판단합니다.</p>
      )}
      {waiting && teacher && (
        <>
          <label className="field">
            적용할 변경 상황
            <textarea rows={4} value={draft} onChange={e => setEdit(e.target.value)} />
          </label>
          <p className="section-note">
            승인하면 위 조건이 학생에게 제시되고 새 수행 회차가 시작됩니다. 이전 원자료는 보존됩니다.
          </p>
          <div className="loop-actions">
            <button
              className="button primary"
              disabled={!draft.trim()}
              onClick={() => {
                setData(
                  applySituation(data, {
                    ...situation,
                    title: draft.trim(),
                    added: draft.trim(),
                    reviewedAt: stamp(),
                    reviewedBy: '강병준 교수자',
                  }),
                )
                setEdit('')
                setNotice('추가 문제 상황을 승인하여 학생에게 적용했습니다.')
              }}
            >
              변경 상황 승인·적용
            </button>
            <button
              className="button secondary"
              onClick={() => setData({ ...data, situation: { ...situation, status: 'rejected' } })}
            >
              변경 상황 거절
            </button>
          </div>
        </>
      )}
      {active && !teacher && (
        <>
          <label className="field">
            변경 조건의 영향·대안 비교·팀 역할 합의
            <textarea
              rows={3}
              value={response}
              onChange={e => setResponse(e.target.value)}
              placeholder="추가된 조건은 무엇인가요? 조사한 내용, 대안과 선택 이유, 담당자와 확인 방법을 남기세요."
            />
          </label>
          <button className="button secondary" disabled={!response.trim()} onClick={saveResponse}>
            재분석과 팀 합의 저장
          </button>
        </>
      )}
      {!situation && (
        <p className="section-note">
          {policy.mode === '교수자 직접'
            ? '추가 문제 상황은 교수자가 직접 정해 안내합니다.'
            : 'AI가 새로운 채팅·수행 기록·학습 증거를 살펴보고 추가 상황이 필요한지 판단합니다. 학생은 상황 유형을 선택하지 않습니다. ' +
              (policy.mode === 'AI 자동'
                ? '필요한 상황을 판단하면 자동으로 적용합니다.'
                : '필요한 상황을 판단하면 교수자에게 승인 요청을 보냅니다.')}
        </p>
      )}
      {notice && <p role="status">{notice}</p>}
    </section>
  )
}

export function TeacherSupportQueue() {
  const { data } = useWorkspace()
  const delivered = (data.supports ?? []).filter(p => p.status === 'approved')
  return (
    <section className="detail-section learning-loop">
      <div className="section-heading">
        <SectionTitle icon={MessageCircle}>가이던스 제공 현황</SectionTitle>
        <span>{delivered.length}건</span>
      </div>
      <p className="section-note">
        프로젝트 논의·질문·역할 분담은 승인 없이 지원합니다. 새로운 수행 조건을 추가하는 문제 상황만 아래에서 검토합니다. 개인 질문 원문은 표시하지 않습니다.
      </p>
      {delivered.slice(-3).map(p => (
        <p key={p.id}>
          {p.time} · {p.channel === 'team' ? '팀 채팅' : '개인 지원'} · {p.topic}
          <br />
          {p.reason}
        </p>
      ))}
      {!delivered.length && <p>추가로 제공한 가이던스가 없습니다.</p>}
    </section>
  )
}

export function AlternativeEvidence() {
  const { data, setData, scenario: s } = useWorkspace()
  const primary = s.id === 'fusion'
  const submitted = data.alternative?.evidenceId ? data.evidence.find(e => e.id === data.alternative?.evidenceId) : undefined
  const draft = data.alternativeDraft ?? { method: '', raw: '', explanation: '' }
  const { method, raw, explanation } = draft
  const [notice, setNotice] = useState('')

  function edit(field: keyof typeof draft, value: string) {
    setNotice('')
    setData(previous => ({ ...previous, alternativeDraft: { ...draft, [field]: value } }))
  }

  function submit() {
    if (!method.trim() || !raw.trim() || !explanation.trim()) return
    const e = makeEvidence(data, s, {
      title: primary ? '프로젝트 수행자료와 검증 기록' : '대안 접근의 검증 자료',
      detail: explanation.trim(),
      raw: `선택한 방법: ${method.trim()}\n학생이 제출한 수행자료:\n${raw.trim()}`,
      owner: '유송민',
      source: '학생 제출 · 외부 수행자료 (진위·범위 확인 필요)',
      criterion: '검증',
      stage: 3,
      kind: 'record',
      time: stamp(),
    })
    setData({
      ...data,
      experiment: false,
      experimentNote: '',
      completed: data.completed.filter(id => id !== 'test'),
      situation: data.situation?.status === 'complete' ? { ...data.situation, status: 'active' } : data.situation,
      evidence: [...data.evidence, e],
      alternative: { evidenceId: e.id!, status: 'pending' },
      student: {
        ...data.student,
        resources: [
          ...data.student.resources,
          {
            id: `project-verification-${e.id}`,
            name: e.title,
            kind: 'Learning Evidence',
            body: `${e.raw}\n\n학생 설명\n${e.detail}`,
            author: '유송민',
            version: 1,
          },
        ],
      },
    })
    setNotice('수행자료를 공유했습니다. 교수자 확인 전에는 검증 완료로 처리하지 않습니다.')
  }

  const form = (
    <>
      <p className="section-note">작성 중인 내용은 이 브라우저에 임시 저장됩니다.</p>
      <p>
        {primary
          ? '팀이 선택한 도구에서 프로젝트를 수행하고 산출물과 검증 결과를 남기세요. 실습 폼 연결은 필요하지 않습니다. 원본 파일은 팀 자료에 첨부할 수 있습니다.'
          : '목표를 충족하는 다른 도구나 접근도 제출할 수 있습니다. 외부 원본 파일은 팀 자료에 첨부하고 이곳에 자료명·실행 조건·결과를 남겨 주세요.'}
      </p>
      <label className="field">
        {primary ? '수행 방법과 도구 선택 이유' : '대안 접근과 선택 이유'}
        <textarea rows={2} value={method} onChange={e => edit('method', e.target.value)} />
      </label>
      <label className="field">
        {primary ? '산출물·검증 조건·관찰 결과' : '외부 원자료·자료명·실행 조건'}
        <textarea
          rows={4}
          value={raw}
          onChange={e => edit('raw', e.target.value)}
          placeholder={primary ? '자료명 또는 링크, 확인한 조건, 예상 결과와 실제 결과를 구분해 기록하세요.' : undefined}
        />
      </label>
      <label className="field">
        결과 해석과 목표 충족 설명
        <textarea rows={3} value={explanation} onChange={e => edit('explanation', e.target.value)} />
      </label>
      <button
        className="button secondary"
        disabled={!method.trim() || !raw.trim() || !explanation.trim()}
        onClick={submit}
      >
        {primary ? '수행자료 검토 요청' : '대안 수행자료 검토 요청'}
      </button>
      {notice && <p role="status">{notice}</p>}
    </>
  )

  return (
    <section className="panel learning-loop">
      {primary && (
        <div className="section-heading">
          <div className="form-heading-copy">
            <SectionTitle icon={ClipboardCheck}>수행자료와 검증 기록</SectionTitle>
            <small className="form-heading-note">
              AI가 대화 내용과 입력 자료를 대조하고, 추가 질문으로 보완하여 과정증거로 활용하는 흐름입니다. (기능 설계 시연)
            </small>
          </div>
          <span className="teach-badge mint">팀 선택 도구 활용</span>
        </div>
      )}
      {submitted && (
        <div className="alternative-outcome">
          <strong>
            {submitted.title} · {submitted.time}
          </strong>
          <p>
            {data.alternative?.status === 'accepted'
              ? '교수자가 이 자료의 목표 충족을 확인했습니다.'
              : data.alternative?.status === 'needs-evidence'
                ? '교수자가 추가 자료를 요청했습니다. 아래에서 원자료·실행 조건·결과 설명을 보완해 다시 검토를 요청하세요.'
                : '교수자 검토 대기 · 제출만으로 검증 완료가 되지는 않습니다.'}
          </p>
          <details>
            <summary>제출한 근거와 설명 보기</summary>
            <pre>{submitted.raw}</pre>
            <p>{submitted.detail}</p>
          </details>
        </div>
      )}
      {primary ? (
        form
      ) : (
        <details>
          <summary>다른 해결 방법으로 수행했나요?</summary>
          {form}
        </details>
      )}
    </section>
  )
}

export function AlternativeReview() {
  const { data, setData, scenario: s } = useWorkspace()
  const e = data.evidence.find(e => e.id === data.alternative?.evidenceId)
  if (!e || !data.alternative) return null

  return (
    <section className="detail-section learning-loop">
      <h3>{s.id === 'fusion' ? '수행자료 교수자 확인' : '대안 접근 교수자 확인'}</h3>
      <p>{e.goal}</p>
      <pre>{e.raw}</pre>
      <p>{e.detail}</p>
      <p>
        현재 상태:{' '}
        {data.alternative.status === 'pending'
          ? '검토 대기'
          : data.alternative.status === 'accepted'
            ? '목표 충족 확인'
            : '추가 자료 요청'}
      </p>
      {data.alternative.status === 'pending' && (
        <div className="loop-actions">
          <button
            className="button primary"
            disabled={data.situation?.status === 'active' && !data.situation.response}
            onClick={() =>
              setData({
                ...data,
                alternative: { evidenceId: e.id!, status: 'accepted' },
                experiment: true,
                experimentNote: e.detail,
                completed: [...new Set([...data.completed, 'test'])],
                situation: data.situation?.status === 'active' ? { ...data.situation, status: 'complete' } : data.situation,
              })
            }
          >
            {s.id === 'fusion' ? '수행자료의 목표 충족 확인' : '대안의 목표 충족 확인'}
          </button>
          <button
            className="button secondary"
            onClick={() => setData({ ...data, alternative: { evidenceId: e.id!, status: 'needs-evidence' } })}
          >
            {s.id === 'fusion' ? '추가 수행자료 요청' : '대안의 추가 자료 요청'}
          </button>
        </div>
      )}
    </section>
  )
}
