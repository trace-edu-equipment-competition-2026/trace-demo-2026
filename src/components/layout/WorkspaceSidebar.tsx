import { ArrowLeft } from 'lucide-react'
import { teacherNavigation, studentNavigation } from '@/domain/navigation'
import { ProfileSwitch, WorkspaceSwitch } from './ProfileSwitch'
import { useWorkspace } from './WorkspaceContext'

export function WorkspaceSidebar({
  student,
  view,
  onNavigate,
  onRole,
  open,
  onClose,
  courseName,
}: {
  student: boolean
  view: string
  onNavigate: (id: string) => void
  onRole: () => void
  open: boolean
  onClose: () => void
  courseName?: string
}) {
  const { scenario, onWorkspace } = useWorkspace()
  const items = student ? studentNavigation : teacherNavigation

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`} aria-label="워크스페이스 메뉴">
      <div className="brand">
        <span />
        TRACE
      </div>
      <button className="mobile-close icon-button" aria-label="사이드바 닫기" onClick={onClose}>
        <span className="sidebar-collapse-icon">
          <ArrowLeft size={13} />
        </span>
      </button>
      <span className="course-label">현재 워크스페이스</span>
      <WorkspaceSwitch active={scenario.id} student={student} currentName={courseName} onSelect={onWorkspace} />
      <nav>
        {items.map(([id, label, Icon]) => (
          <button
            key={id}
            className={`nav-item ${view === id ? 'active' : ''}`}
            aria-current={view === id ? 'page' : undefined}
            onClick={() => onNavigate(id)}
          >
            <span className="nav-icon">
              <Icon size={19} />
            </span>
            {label}
          </button>
        ))}
      </nav>
      <ProfileSwitch student={student} workspace={scenario.id} onSwitch={onRole} />
    </aside>
  )
}
