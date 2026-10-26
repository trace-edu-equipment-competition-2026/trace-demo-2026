import { Check, Menu, X } from 'lucide-react'
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { type Assignment as AssignmentType, modes, readDraft, storageKey } from '@/domain/assignment'
import { readCourse, type TeachingTarget } from '@/domain/course'
import { applyPolicy, assessSituation } from '@/domain/learningLoop'
import { scenarios, readProject, workspaceKey, type WorkspaceId, type ProjectData } from '@/domain/scenarios'
import { WorkspaceContext, WorkspaceUiContext, useWorkspaceUi, useWorkspace } from '@/components/layout/WorkspaceContext'
import { WorkspaceSidebar } from '@/components/layout/WorkspaceSidebar'
import { AssignmentBuilder } from '@/features/teacher/AssignmentBuilder'
import { CourseDashboard } from '@/features/teacher/CourseDashboard'
import { CourseSettings } from '@/features/teacher/CourseSettings'
import { TeachingWorkspace, type TeachingView } from '@/features/teacher/TeachingWorkspace'
import { StudentWorkspace } from '@/features/student/StudentWorkspace'
import '@/styles/app.css'
import '@/styles/course.css'
import '@/styles/workspace.css'

type TeacherView = 'assignment' | 'dashboard' | 'settings' | TeachingView

function TeacherApp({
  studentRole,
  onRole,
  view,
  setView,
  studentView,
  setStudentView,
}: {
  studentRole: boolean
  onRole: () => void
  view: TeacherView
  setView: (v: TeacherView) => void
  studentView: string
  setStudentView: (v: string) => void
}) {
  const { scenario, data, setData } = useWorkspace()
  const { setStep } = useWorkspaceUi()
  const initialAssignment = scenario.assignment
  const key = (k: string) => workspaceKey(scenario.id, k)

  const [a, setA] = useState(() => readDraft(key(storageKey), initialAssignment))
  const [course, setCourse] = useState(() => readCourse(key('trace-course-v1'), scenario.course))
  const [courseDraft, setCourseDraft] = useState(() => readCourse(key('trace-course-v1'), scenario.course))
  const [teachingAssignment, setTeachingAssignment] = useState<AssignmentType | null>(() => {
    try {
      return JSON.parse(localStorage.getItem(key('trace-teaching-assignment')) || 'null')
    } catch {
      return null
    }
  })
  const [teachingTarget, setTeachingTarget] = useState<TeachingTarget>({})
  const [teachingKey, setTeachingKey] = useState(0)
  const [decisions, setDecisions] = useState<Record<string, string>>({})

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [created, setCreated] = useState(false)

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(''), 4200)
    return () => clearTimeout(timer)
  }, [message])

  function openTeaching(next: TeachingView | 'assignment', target: TeachingTarget = {}) {
    if (next === 'assignment') {
      setStep(1)
      setError('')
      setView('assignment')
      window.scrollTo(0, 0)
      return
    }
    setTeachingTarget(target)
    setTeachingKey(k => k + 1)
    setView(next)
    window.scrollTo(0, 0)
  }

  function newProject() {
    if (!teachingAssignment) {
      setTeachingAssignment(structuredClone(a))
      try {
        localStorage.setItem(key('trace-teaching-assignment'), JSON.stringify(a))
      } catch {
        /* 현재 세션의 스냅샷 유지. */
      }
    }
    setA({
      ...structuredClone(initialAssignment),
      title: '',
      description: '',
      goals: [...course.goals],
      criteria: structuredClone(course.criteria),
      mode: course.mode,
      intervention: course.intervention,
      guidance: Object.fromEntries(modes.map(m => [m, [...course.guidance]])) as AssignmentType['guidance'],
      directAnswers: course.directAnswers,
    })
    setView('assignment')
    setStep(1)
    setSaved(false)
    setCreated(false)
    setError('')
    window.scrollTo(0, 0)
    setMessage('저장된 과목 기준으로 새 프로젝트 초안을 시작합니다.')
  }

  function switchRole() {
    setSidebarOpen(false)
    setSidebarCollapsed(false)
    onRole()
    window.scrollTo(0, 0)
  }

  if (studentRole) {
    return <StudentWorkspace onInstructor={switchRole} view={studentView} onView={setStudentView} />
  }

  return (
    <div className={`app-shell student-shell unified-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <a className="skip-link" href="#main">
        본문으로 이동
      </a>
      {sidebarOpen && <button className="sidebar-backdrop" aria-label="메뉴 닫기" onClick={() => setSidebarOpen(false)} />}
      <WorkspaceSidebar
        student={false}
        view={view}
        courseName={course.name}
        open={sidebarOpen}
        onClose={() => {
          setSidebarOpen(false)
          setSidebarCollapsed(true)
        }}
        onRole={switchRole}
        onNavigate={id => {
          setSidebarOpen(false)
          setView(id as TeacherView)
          window.scrollTo(0, 0)
          if (id === 'assignment') {
            setStep(1)
            setError('')
          }
        }}
      />
      <main id="main" className="main">
        {view !== 'assignment' ? (
          <>
            <header className="page-header">
              <div className="title-row">
                <button
                  className="mobile-menu icon-button"
                  aria-label="수업 메뉴 열기"
                  onClick={() => {
                    setSidebarOpen(true)
                    setSidebarCollapsed(false)
                  }}
                >
                  <Menu size={20} strokeWidth={1.8} className="trace-icon" aria-hidden="true" />
                </button>
                <h1>
                  {view === 'dashboard'
                    ? '수업 대시보드'
                    : view === 'settings'
                      ? '과목 설정'
                      : view === 'monitoring'
                        ? '팀별 모니터링'
                        : '학생별 평가 지원'}
                </h1>
              </div>
              <p>
                {view === 'dashboard'
                  ? '수업의 흐름을 보고, 필요한 지원을 연결하세요.'
                  : view === 'settings'
                    ? '교육과정과 평가 기준을 확인하고 다음 과제에 재사용하세요.'
                    : view === 'monitoring'
                      ? '팀의 진행 흐름을 살피고, 지금 필요한 개입을 결정하세요.'
                      : '학생의 수행과 이해를 과정증거로 확인하고 평가를 기록하세요.'}
              </p>
            </header>
            {view === 'dashboard' ? (
              <CourseDashboard
                course={course}
                assignment={teachingAssignment ?? a}
                decisions={decisions}
                onOpen={openTeaching}
                onDesignAssignment={() => {
                  setView('assignment')
                  setStep(1)
                  setError('')
                  window.scrollTo(0, 0)
                }}
              />
            ) : view === 'settings' ? (
              <CourseSettings
                course={course}
                initialDraft={courseDraft}
                onDraftChange={setCourseDraft}
                onSave={setCourse}
                onCreate={newProject}
              />
            ) : (
              <TeachingWorkspace
                key={teachingKey}
                initialTarget={teachingTarget}
                decisions={decisions}
                onDecisions={setDecisions}
                view={view}
                assignment={teachingAssignment ?? a}
                onNavigate={setView}
              />
            )}
          </>
        ) : (
          <AssignmentBuilder
            assignment={a}
            setAssignment={setA}
            course={course}
            saved={saved}
            setSaved={setSaved}
            created={created}
            setCreated={setCreated}
            error={error}
            setError={setError}
            sidebarOpen={sidebarOpen}
            onOpenSidebar={() => {
              setSidebarOpen(true)
              setSidebarCollapsed(false)
            }}
            onMessage={setMessage}
            onPublish={next => {
              localStorage.setItem(key('trace-teaching-assignment'), JSON.stringify(next))
              setTeachingAssignment(structuredClone(next))
              setData(applyPolicy(data, next))
            }}
          />
        )}
      </main>
      {message && (
        <div className="toast" role="status">
          <Check size={20} strokeWidth={1.8} className="trace-icon" aria-hidden="true" />
          <span>{message}</span>
          <button className="icon-button" aria-label="알림 닫기" onClick={() => setMessage('')}>
            <X size={20} strokeWidth={1.8} className="trace-icon" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  )
}

function WorkspaceRuntime({
  id,
  onWorkspace,
  studentRole,
  onRole,
  view,
  setView,
  studentView,
  setStudentView,
}: {
  id: WorkspaceId
  onWorkspace: (id: WorkspaceId) => void
  studentRole: boolean
  onRole: () => void
  view: TeacherView
  setView: (v: TeacherView) => void
  studentView: string
  setStudentView: (v: string) => void
}) {
  const [data, setStoredData] = useState(() => assessSituation(readProject(id), scenarios[id], scenarios[id].project))
  const [storageError, setStorageError] = useState('')
  const setData: Dispatch<SetStateAction<ProjectData>> = change =>
    setStoredData(previous => assessSituation(typeof change === 'function' ? change(previous) : change, scenarios[id], previous))

  useEffect(() => {
    try {
      localStorage.setItem(`trace-project-${id}-v2`, JSON.stringify(data))
      queueMicrotask(() => setStorageError(''))
    } catch {
      queueMicrotask(() => setStorageError('저장 공간이 부족해 변경사항이 현재 화면에만 유지됩니다. 첨부 크기를 줄여 주세요.'))
    }
  }, [data, id])

  return (
    <WorkspaceContext.Provider value={{ scenario: scenarios[id], data, setData, onWorkspace }}>
      {storageError && (
        <p role="alert" className="workspace-storage-error">
          {storageError}
        </p>
      )}
      <TeacherApp
        studentRole={studentRole}
        onRole={onRole}
        view={view}
        setView={setView}
        studentView={studentView}
        setStudentView={setStudentView}
      />
    </WorkspaceContext.Provider>
  )
}

function App() {
  const [id, setId] = useState<WorkspaceId>('network')
  const [studentRole, setStudentRole] = useState(false)
  const [view, setView] = useState<TeacherView>('dashboard')
  const [studentView, setStudentView] = useState('team')
  const [step, setStep] = useState(1)
  const [category, setCategory] = useState(0)
  const [tab, setTab] = useState('기획·기술 선택')

  return (
    <WorkspaceUiContext.Provider value={{ step, setStep, category, setCategory, tab, setTab }}>
      <WorkspaceRuntime
        key={id}
        id={id}
        onWorkspace={setId}
        studentRole={studentRole}
        onRole={() => setStudentRole(!studentRole)}
        view={view}
        setView={setView}
        studentView={studentView}
        setStudentView={setStudentView}
      />
    </WorkspaceUiContext.Provider>
  )
}

export default App
