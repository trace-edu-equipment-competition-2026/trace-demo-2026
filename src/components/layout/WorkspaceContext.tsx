import { createContext, useContext, type Dispatch, type SetStateAction } from 'react'
import { scenarios, type Scenario, type WorkspaceId, type ProjectData } from '@/domain/scenarios'

export const WorkspaceContext = createContext<{
  scenario: Scenario
  data: ProjectData
  setData: Dispatch<SetStateAction<ProjectData>>
  onWorkspace: (id: WorkspaceId) => void
}>({
  scenario: scenarios.network,
  data: scenarios.network.project,
  setData: () => {},
  onWorkspace: () => {},
})

export const useWorkspace = () => useContext(WorkspaceContext)

export const WorkspaceUiContext = createContext<{
  step: number
  setStep: Dispatch<SetStateAction<number>>
  category: number
  setCategory: Dispatch<SetStateAction<number>>
  tab: string
  setTab: Dispatch<SetStateAction<string>>
}>({
  step: 1,
  setStep: () => {},
  category: 0,
  setCategory: () => {},
  tab: '기획·기술 선택',
  setTab: () => {},
})

export const useWorkspaceUi = () => useContext(WorkspaceUiContext)
