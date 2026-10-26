import { useWorkspace } from '@/components/layout/WorkspaceContext'
import { getTeamGroups, type Assignment } from '@/domain/assignment'
import { EnvironmentPreview } from './ExecutionEnvironment'

const examples: Record<string, { student: string; question: string; next: string }> = {
  '최소': {
    student: '무엇부터 확인해야 할지 모르겠어요.',
    question: '지금까지 직접 확인한 사실은 무엇인가요? 다음에 확인할 항목 하나를 스스로 골라보세요.',
    next: '현재 상태 정리 → 다음 행동 직접 선택',
  },
  '보통': {
    student: '설정을 바꿨는데 여전히 연결이 안 돼요.',
    question: '설정을 바꾸기 전과 후에 무엇이 달라졌나요? 그 차이로 제외할 수 있는 원인을 찾고, 확인할 명령을 정해보세요.',
    next: '관찰 비교 → 탐색 방향 선택 → 직접 검증',
  },
  '적극': {
    student: 'ping이 성공했으니 문제가 해결된 것 같아요.',
    question:
      '그 판단의 근거가 모든 단말과 경로에도 적용되나요? 검증 조건 두 가지로 결과를 다시 확인한 뒤, 다른 네트워크 대역에서도 같은 원리가 성립하는지 설명해보세요.',
    next: '판단 근거 점검 → 재검증 → 다른 조건에 적용',
  },
}

const fusionExamples: typeof examples = {
  '최소': {
    student: '만들고 싶은 것은 있지만 어디서 시작해야 할까요?',
    question: '누가 어떤 상황에서 겪는 문제인가요? 먼저 확인할 요구 하나를 골라보세요.',
    next: '사용자 문제 정리 → 다음 행동 선택',
  },
  '보통': {
    student: '배운 Python으로 화면과 API까지 만들 수 있을까요?',
    question: '지금 알고 있는 부분과 새로 필요한 부분은 무엇인가요? 실제 API 없이 확인할 작은 실험부터 정해보세요.',
    next: '기존 지식 비교 → 탐색 방향 선택 → 작은 실험',
  },
  '적극': {
    student: '일반 질문에 답변이 나오니 완성한 것 같아요.',
    question:
      '자료에 없는 질문이나 개인정보가 포함된 입력에서도 같은 판단을 할 수 있나요? 조건별 기대 결과와 실제 결과를 비교하고 한계를 설명해 보세요.',
    next: '판단 근거 점검 → 경계 조건 검증 → 다른 문제에 적용',
  },
}

export function ThinkingExample({ level }: { level: string }) {
  const { scenario } = useWorkspace()
  const options = scenario.id === 'fusion' ? fusionExamples : examples
  const example = options[level] || options['보통']
  return (
    <div className="thinking-example">
      <div className="example-heading">
        <strong>사고를 이어가는 질문</strong>
        <span>개입 수준 · {level}</span>
      </div>
      <p className="student-message">
        <b>학생</b>
        {example.student}
      </p>
      <div className="coach-message">
        <b>TRACE 학습 지원</b>
        <p>{example.question}</p>
        <span>{example.next}</span>
      </div>
    </div>
  )
}

export function StudentPreview({ assignment: a }: { assignment: Assignment }) {
  const { scenario } = useWorkspace()
  const myTeam = getTeamGroups(a)[0]
  const ncsLinked = a.ncsLinked !== false
  return (
    <div className="student-preview">
      <div className="preview-notice">
        <strong>학생 화면 미리보기</strong>
        <span>입력한 과제 내용이 학생에게 이렇게 보입니다.</span>
      </div>
      <article className="panel student-assignment">
        <div className="student-course">
          {scenario.course.name} <span>{a.projectType}</span>
        </div>
        <h2>{a.title}</h2>
        <div className="assignment-meta">
          <span>
            {a.start.replaceAll('-', '.')} — {a.end.replaceAll('-', '.')}
          </span>
          <span>난이도 {a.difficulty}</span>
          {a.projectType === '팀 프로젝트' && (
            <span>
              {a.teamFormation} · 팀당 {a.teamSize}명
            </span>
          )}
          <span>{ncsLinked ? '교육과정 성취기준 + NCS 직무 연계' : '교육과정 성취기준 단독 적용'}</span>
          <span>강병준 교수님</span>
        </div>
        {a.projectType === '팀 프로젝트' && (
          <div className="my-team-card">
            <div>
              <span>나의 팀</span>
              <strong>{myTeam.name}</strong>
            </div>
            <p>{myTeam.members.join(' · ')}</p>
            <small>
              {a.teamFormation === '학생 자율 구성'
                ? '교수자 승인 후 팀 구성이 확정됩니다.'
                : '배정된 팀 구성원과 함께 과제를 수행합니다.'}
            </small>
          </div>
        )}
        <p className="assignment-description">{a.description}</p>
        <EnvironmentPreview value={a.environment} />
        <section>
          <h3>이번 과제의 목표</h3>
          <div className="preview-goals">
            {a.goals.map((g, i) => (
              <span key={i}>{g}</span>
            ))}
          </div>
        </section>
        <section>
          <h3>수행 체크리스트</h3>
          <ul className="student-checklist">
            {a.requirements.map((r, i) => (
              <li key={i}>
                <span className="empty-check" />
                {r}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3>제출할 산출물</h3>
          <div className="student-outputs">
            {a.outputs.map((o, i) => (
              <div key={i}>
                <span className="output-format">{o.format}</span>
                <div>
                  <strong>{o.name}</strong>
                  {o.template ? (
                    <a href={o.template.data} download={o.template.name}>
                      양식 다운로드 · {o.template.name}
                    </a>
                  ) : (
                    <small>자유 양식</small>
                  )}
                </div>
                <span className={o.required === '필수' ? 'required-badge' : 'optional-badge'}>{o.required}</span>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h3>평가 기준</h3>
          <div className="student-criteria">
            {a.criteria.map((c, i) => (
              <div key={i}>
                <i className={`color-dot color-${i % 5}`} />
                <span>{c.name}</span>
                <strong>{c.weight}%</strong>
              </div>
            ))}
          </div>
        </section>
      </article>
      <section className="panel student-support">
        <h2>학습 지원</h2>
        <p className="section-note">답을 확인하는 데서 끝내지 않고, 이유를 설명하고 직접 검증해 보세요.</p>
        <div className="preview-goals">
          {a.guidance[a.mode].map(g => (
            <span key={g}>{g}</span>
          ))}
        </div>
        {a.mode === '교수자 직접' ? (
          <div className="manual-preview">
            <span>{a.timing} · 교수자 안내</span>
            <h3>{a.situation}</h3>
            <p>{a.manualGuidance}</p>
          </div>
        ) : (
          <ThinkingExample level={a.intervention} />
        )}
        <p className="micro-note">
          {a.mode === '교수자 승인형'
            ? '일반 가이던스는 바로 제공되며, 새로운 수행 조건을 추가하는 문제 상황은 교수자 승인 후 적용됩니다.'
            : a.mode === 'AI 자동'
              ? '수행 상태에 따라 학습 지원이 제공됩니다.'
              : '교수자가 정한 시점에 안내가 제공됩니다.'}{' '}
          대화는 시연용 예시입니다.
        </p>
      </section>
    </div>
  )
}
