import { test,expect,type Page } from '@playwright/test'
import {initialAssignment} from '../src/assignment'
async function automatic(page:Page){await page.goto('/');await page.evaluate(assignment=>{const key='trace-project-network-v2',p=JSON.parse(localStorage.getItem(key)!);p.assignment=assignment;localStorage.setItem(key,JSON.stringify(p))},{...initialAssignment,mode:'AI 자동',guidance:{...initialAssignment.guidance,'AI 자동':['확인 질문','탐색 방향 안내','개념 힌트','도구 활용 힌트']}})}
async function student(page:Page){await page.goto('/');await page.getByRole('button',{name:'프로필 전환',exact:true}).click();await page.getByRole('button',{name:/유송민 학생/}).click()}
async function nav(page:Page,name:string){if(await page.getByRole('button',{name:'수업 메뉴 열기',exact:true}).isVisible())await page.getByRole('button',{name:'수업 메뉴 열기',exact:true}).click();await page.getByRole('button',{name,exact:true}).click()}
test('프로필 전환, 팀 자료, 팀·개인 대화가 분리된다',async({page})=>{
 await automatic(page);await student(page);await expect(page.getByRole('heading',{name:'팀 대시보드',exact:true})).toBeVisible()
 await nav(page,'팀 자료');await page.getByRole('button',{name:/장애 진단 미션 과제 안내/}).click();await expect(page.getByRole('dialog')).toContainText('정적 라우팅');await page.getByRole('button',{name:'문서 닫기',exact:true}).click()
 await nav(page,'팀 채팅');await page.getByLabel('팀 메시지').fill('우리 팀만 보는 진행 기록');await page.getByRole('button',{name:'팀에 보내기'}).click();await expect(page.getByRole('log')).toContainText('우리 팀만 보는 진행 기록')
 await nav(page,'개인 AI 지원');await expect(page.getByRole('log')).not.toContainText('우리 팀만 보는 진행 기록');await page.getByLabel('개인 질문').fill('개인적으로 왜 양방향인지 이해하고 싶어요');await page.getByRole('button',{name:'AI에게 질문하기'}).click();await expect(page.getByRole('log')).toContainText('요청과 응답의 두 경로');expect(await page.locator('.student-messages').evaluate(e=>e.scrollHeight-e.scrollTop-e.clientHeight<3)).toBe(true)
 await nav(page,'팀 채팅');await expect(page.getByRole('log')).not.toContainText('개인적으로 왜')
 await page.getByRole('button',{name:'프로필 전환',exact:true}).click();await page.getByRole('button',{name:/강병준 교수자/}).click();await expect(page.getByRole('heading',{name:'수업 대시보드',exact:true})).toBeVisible()
 await page.getByRole('button',{name:'프로필 전환',exact:true}).click();await page.getByRole('button',{name:/유송민 학생/}).click();await nav(page,'개인 AI 지원');await expect(page.getByRole('log')).toContainText('개인적으로 왜')
})
test('공통 작업실에서 네트워크 수정·양방향 검증을 기록한다',async({page})=>{
 await student(page);await nav(page,'프로젝트 작업실');await page.getByRole('button',{name:'실행 및 검증',exact:true}).click()
 await expect(page.getByRole('button',{name:'검증 근거 팀에 공유'})).toBeDisabled()
 await page.getByLabel('수정 전 실패 결과를 비교 기준으로 사용').check();await page.getByLabel('반대 방향의 결과까지 확인').check()
 await page.getByRole('button',{name:'ping 192.168.20.10',exact:true}).click();await expect(page.getByRole('log')).toContainText('100% loss')
 await page.getByLabel('실행 대상',{exact:true}).selectOption('R2');await page.getByRole('button',{name:'show ip route',exact:true}).click();await expect(page.getByRole('log')).toContainText('10.0.0.9')
 await page.getByLabel('명령·요청',{exact:true}).fill('ip route 192.168.10.0 255.255.255.0 10.0.0.1');await page.getByRole('button',{name:'실행',exact:true}).click()
 await page.getByLabel('실행 대상',{exact:true}).selectOption('PC-A');await page.getByRole('button',{name:'ping 192.168.20.10',exact:true}).click()
 await page.getByLabel('실행 대상',{exact:true}).selectOption('PC-B');await page.getByRole('button',{name:'ping 192.168.10.10',exact:true}).click()
 await page.getByLabel('어떤 근거로 판단했고, 무엇을 더 확인해야 하나요?').fill('반환 경로의 인접 주소를 수정하고 양방향 결과를 비교했다.')
 await nav(page,'팀 대시보드');await expect(page.locator('.current-work-result')).toContainText('Reply received · 4/4')
 await page.reload();await page.getByRole('button',{name:'프로필 전환',exact:true}).click();await page.getByRole('button',{name:/유송민 학생/}).click()
 await page.getByRole('button',{name:'작업실 이어가기',exact:true}).click()
 await expect(page.getByLabel('실행 대상',{exact:true})).toHaveValue('PC-B')
 await expect(page.getByLabel('반대 방향의 결과까지 확인')).toBeChecked()
 await expect(page.getByLabel('어떤 근거로 판단했고, 무엇을 더 확인해야 하나요?')).toHaveValue('반환 경로의 인접 주소를 수정하고 양방향 결과를 비교했다.')
 await expect(page.getByRole('button',{name:'검증 근거 팀에 공유'})).toBeEnabled()
 await page.getByRole('button',{name:'검증 근거 팀에 공유'}).click();await expect(page.getByRole('status').filter({hasText:'팀 자료와 나의 학습 기록'})).toBeVisible()
 await nav(page,'나의 학습 기록');await expect(page.locator('.fusion-evidence-list')).toContainText('양방향 복구 검증')
 await nav(page,'팀 자료');await expect(page.locator('.document-table')).toContainText('양방향 복구 검증')
})
test('문서 작성·수정·첨부·검색·채팅 공유와 중앙 팝업',async({page})=>{
 await student(page);await nav(page,'팀 자료')
 await page.getByRole('button',{name:'문서 작성',exact:true}).click();await page.getByLabel('문서 제목').fill('검증 회의 메모');await page.getByLabel('문서 내용').fill('수정 전후 결과를 함께 비교하기로 했다.');await page.getByRole('button',{name:'문서 저장',exact:true}).click()
 const box=await page.getByRole('dialog').boundingBox();expect(box).not.toBeNull();expect(Math.abs(box!.x+box!.width/2-720)).toBeLessThan(2);expect(Math.abs(box!.y+box!.height/2-540)).toBeLessThan(2)
 await page.screenshot({path:'.impeccable/review/student-document-popup.png'})
 await page.getByRole('button',{name:'수정',exact:true}).click();await page.getByLabel('문서 내용').fill('양방향 결과도 함께 비교하기로 했다.');await page.getByRole('button',{name:'문서 저장',exact:true}).click();await expect(page.getByRole('dialog')).toContainText('v2')
 await page.getByRole('button',{name:'팀 채팅에 공유',exact:true}).click();await expect(page.getByRole('heading',{name:'팀 채팅',exact:true})).toBeVisible();await page.getByRole('button',{name:/검증 회의 메모/}).click();await expect(page.getByRole('dialog')).toContainText('양방향 결과도');await page.getByRole('button',{name:'문서 닫기'}).click()
 await nav(page,'팀 자료');await page.locator('input[type=file]').setInputFiles([{name:'실습로그.txt',mimeType:'text/plain',buffer:Buffer.from('team test log')},{name:'회의자료.txt',mimeType:'text/plain',buffer:Buffer.from('meeting record')}]);await page.getByLabel('팀 자료 검색').fill('실습로그');await expect(page.locator('.document-table tbody tr')).toHaveCount(1);await page.getByRole('button',{name:'실습로그.txt 첨부 파일',exact:true}).click();await expect(page.getByRole('link',{name:'다운로드'})).toHaveAttribute('href',/^data:text\/plain;base64,/)
 await page.getByRole('button',{name:'문서 닫기'}).click();await page.reload();await page.getByRole('button',{name:'프로필 전환',exact:true}).click();await page.getByRole('button',{name:/유송민 학생/}).click();await nav(page,'팀 자료');await page.getByLabel('팀 자료 검색').fill('검증 회의 메모');await expect(page.locator('.document-table tbody tr')).toContainText('v2')
})
test('지원 수준은 학생에게 숨기고 자동 분류한 교수자 요약만 제공한다',async({page})=>{
 await automatic(page);await student(page);await nav(page,'개인 AI 지원');await expect(page.locator('main')).not.toContainText(/L[1-4]/);await page.getByLabel('개인 질문').fill('어떤 명령어로 경로를 확인하나요?');await page.getByRole('button',{name:'AI에게 질문하기'}).click();await expect(page.getByRole('log')).toContainText('show ip route');await expect(page.locator('main')).not.toContainText(/L[1-4]/)
 await page.getByRole('button',{name:'프로필 전환',exact:true}).click();await page.getByRole('button',{name:/강병준 교수자/}).click();await page.getByRole('button',{name:'학생별 평가 지원',exact:true}).click();await page.getByLabel('학생 선택').selectOption('유송민');await page.getByRole('button',{name:/가이던스 이력/}).click();await expect(page.locator('.level-legend')).toContainText('도구 활용 힌트');await expect(page.locator('main')).not.toContainText('어떤 명령어로 경로를 확인하나요?')
})
