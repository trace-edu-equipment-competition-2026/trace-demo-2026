import type { Assignment } from '@/domain/assignment'
import { demoLessonOverview, type Course } from '@/domain/course'
import type { WorkspaceId } from '@/domain/scenarios'

// 교수자 조건(교육과정·선택적 NCS 연계·수행 방식·난이도)에 연동되는 AI 과제 제안 패널.
export function AssignmentProposalPanel({
  scenarioId,
  assignment: a,
  course,
  onUpdate,
  onApplyProposal,
}: {
  scenarioId: WorkspaceId
  assignment: Assignment
  course: Course
  onUpdate: <K extends keyof Assignment>(field: K, value: Assignment[K]) => void
  onApplyProposal: (proposal: { title: string; description: string; requirements: string[] }) => void
}) {
  const lessonOverview = demoLessonOverview[scenarioId]
  const ncsLinked = a.ncsLinked !== false
  const isNetwork = scenarioId === 'network'

  const taskModeLabel = isNetwork ? lessonOverview.taskMode : a.projectType

  const dynamicProposal = isNetwork
    ? ncsLinked
      ? {
          title: '본사–지사 네트워크 통신 장애 복구',
          description:
            '학생은 본사(192.168.10.0/24)와 지사(192.168.20.0/24) 구간의 통신 장애 원인을 진단하고, 장비 설정(running-config)과 라우팅 테이블(RIB)을 비교·수정하여 양방향 통신을 복구합니다. 변경 전후의 검증 결과와 판단 근거를 기록합니다.',
          teacherOnlyNote:
            '교수자 전용 주입 장애·정답 기준 (학생 비공개): R2 반환 경로 Next Hop 오설정(10.0.0.9 → RIB 미설치) / 복구 목표: no ip route 제거 후 10.0.0.1 재설정',
          requirements: [
            'show running-config와 show ip route를 비교해 미설치 정적 경로 원인을 설명한다.',
            'no ip route로 잘못된 정적 경로를 제거하고 올바른 Next Hop 경로를 설정한다.',
            '복구 전·후 양방향 Ping 및 경로 추적 결과를 비교하여 검증한다.',
          ],
          conditionBadge: `교육과정 성취기준 + NCS 직무 연계 · ${taskModeLabel} · 난이도 ${a.difficulty}`,
        }
      : {
          title: '정적 라우팅 경로 분석과 양방향 통신 복구',
          description:
            '학생은 본사와 지사 구간의 요청·반환 경로를 구분하여 통신 실패 원인을 진단하고, 정적 라우팅 수정 전후의 양방향 통신 결과를 비교·설명합니다.',
          teacherOnlyNote:
            '교수자 전용 주입 장애·정답 기준 (학생 비공개): 지사 라우터(R2) 반환 경로 오설정으로 인한 왕복 통신 실패 사례',
          requirements: [
            'IP 설정과 라우팅 경로를 확인하고 장애 원인을 설명한다.',
            '복구 전·후 양방향 연결 상태를 비교하여 결과를 검증한다.',
            '판단 근거와 문제 해결 과정을 기록한다.',
          ],
          conditionBadge: `2022 개정 교육과정 성취기준 단독 적용 · ${taskModeLabel} · 난이도 ${a.difficulty}`,
        }
    : {
        title: lessonOverview.proposalTitle,
        description: lessonOverview.proposalSummary,
        teacherOnlyNote: lessonOverview.briefingSummary,
        requirements: a.requirements,
        conditionBadge: `${ncsLinked ? '교과 성취기준 + 직무 능력단위 연계' : '교과 성취기준 단독 적용'} · ${a.projectType}`,
      }

  return (
    <section className="panel design-triptych-panel" aria-label="차시 과제 설계 3단 요약">
      <div className="triptych-card">
        <span className="teach-badge mint">① 교육적 요구사항</span>
        <h3>차시 목표와 필수 수행 행동</h3>
        <ul className="triptych-list">
          <li>
            <strong>이번 목표:</strong> {lessonOverview.objective}
          </li>
          <li>
            <strong>선수학습:</strong> {lessonOverview.prerequisite}
          </li>
          <li>
            <strong>직접 수행 행동:</strong> 장비 상태 확인 → 라우팅 테이블 비교 → 설정 수정 → 양방향 검증 및 이유 기록
          </li>
          <li>
            <strong>AI 활용·평가:</strong> {a.mode} (개입 {a.intervention}) · 평가 기준 {a.criteria.length}개 항목
          </li>
        </ul>
      </div>
      <div className="triptych-card">
        <span className="teach-badge lavender">② 근거자료 연결</span>
        <h3>교육과정 · 교안 · 선택적 NCS</h3>
        <ul className="triptych-list">
          <li>
            <strong>국가 교육과정:</strong> {lessonOverview.curriculumBasis}
          </li>
          <li>
            <strong>교수자 자료:</strong> {course.documents.map(d => d.name).join(' · ') || '수업계획서 · 교안'}
          </li>
        </ul>
        <label className="ncs-optional-toggle">
          <input
            type="checkbox"
            checked={ncsLinked}
            onChange={e => onUpdate('ncsLinked', e.target.checked)}
          />
          <span>{lessonOverview.optionalNcsBasis}</span>
        </label>
        <small className="micro-note">
          {ncsLinked
            ? `적용 중: ${course.ncs.join(' · ')} (과제 요구사항·학생 안내에 반영)`
            : '미적용: 국가 교육과정 성취기준만 기본 근거로 사용합니다.'}
        </small>
      </div>
      <div className="triptych-card proposal-card">
        <span className="teach-badge yellow">③ AI의 과제 제안</span>
        <h3>과제 제안: {dynamicProposal.title}</h3>
        <small className="proposal-condition-tag">{dynamicProposal.conditionBadge}</small>
        <p>{dynamicProposal.description}</p>
        <small className="micro-note">{dynamicProposal.teacherOnlyNote}</small>
        <div className="proposal-card-actions">
          <button
            type="button"
            className="button secondary"
            onClick={() => onApplyProposal(dynamicProposal)}
          >
            AI 제안 과제 적용
          </button>
        </div>
      </div>
    </section>
  )
}
