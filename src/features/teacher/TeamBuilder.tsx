import { useState } from 'react'
import { demoStudents, getTeamGroups, type Assignment } from '@/domain/assignment'

export function TeamBuilder({ assignment: a, onChange }: { assignment: Assignment; onChange: (value: Record<string, number>) => void }) {
  const groups = getTeamGroups(a)
  const [editingTeam, setEditingTeam] = useState<number | null>(null)
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  function openPicker(team: number) {
    setEditingTeam(team)
    setSelectedStudents(groups[team - 1].members)
  }
  function applySelection() {
    if (editingTeam === null) return
    const next = { ...a.teamAssignments }
    demoStudents.forEach(student => { if (next[student] === editingTeam) next[student] = 0 })
    selectedStudents.forEach(student => { next[student] = editingTeam })
    onChange(next)
    setEditingTeam(null)
  }
  if (a.teamFormation === '학생 자율 구성') return null

  if (a.teamFormation === '교수자 지정') return <section className="team-builder" aria-labelledby="manual-team-title">
    <div className="team-builder-heading"><div><strong id="manual-team-title">팀별 학생 지정</strong><p>팀을 선택한 뒤 학생을 여러 명 골라 한 번에 배정하세요.</p></div><span>{groups.length}개 팀</span></div>
    <div className="manual-team-cards">{groups.map((group, index) => <article key={group.name}><div><strong>{group.name}</strong><span>{group.members.length} / {a.teamSize}명</span></div><p>{group.members.length ? group.members.join(' · ') : '아직 배정된 학생이 없습니다.'}</p><button type="button" onClick={() => openPicker(index + 1)}>학생 선택</button></article>)}</div>
    {editingTeam !== null && <div className="team-picker-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setEditingTeam(null) }}><section className="team-picker" role="dialog" aria-modal="true" aria-labelledby="team-picker-title"><div className="team-picker-heading"><div><strong id="team-picker-title">{editingTeam}팀 학생 선택</strong><p>복수 선택할 수 있습니다. 다른 팀의 학생을 고르면 이 팀으로 이동합니다.</p></div><button type="button" aria-label="학생 선택 닫기" onClick={() => setEditingTeam(null)}>×</button></div><div className="team-picker-list">{demoStudents.map(student => { const current = a.teamAssignments[student] || 0; return <label key={student}><input type="checkbox" checked={selectedStudents.includes(student)} onChange={() => setSelectedStudents(selectedStudents.includes(student) ? selectedStudents.filter(name => name !== student) : [...selectedStudents, student])} /><span>{student}</span><small>{current ? `${current}팀` : '미배정'}</small></label> })}</div><div className="team-picker-footer"><span>{selectedStudents.length}명 선택</span><button type="button" onClick={() => setEditingTeam(null)}>취소</button><button type="button" className="confirm" onClick={applySelection}>선택 완료</button></div></section></div>}
  </section>

  return <section className="team-builder" aria-labelledby="recommended-team-title">
    <div className="team-builder-heading"><div><strong id="recommended-team-title">AI 추천 팀 구성</strong><p>수강생 24명을 팀 규모에 맞춰 균형 있게 묶은 구성안입니다.</p></div><span>추천 완료</span></div>
    <div className="recommended-teams">{groups.map(group => <article key={group.name}><strong>{group.name}</strong><span>{group.members.length}명</span><p>{group.members.join(' · ')}</p></article>)}</div>
  </section>
}
