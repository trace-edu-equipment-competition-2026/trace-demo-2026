import {test,expect} from '@playwright/test'
import {studentEvidence,criterionEstimate,isPerformedEvidence} from '../src/evidence'
import {summarizeObservation} from '../src/observations'

test('계획과 자기 설명은 실제 수정·검증 집계 및 추정 점수와 구분한다',()=>{
 const pending=studentEvidence('이서연','네트워크 설정·검증',2,false).evidence
 const completed=studentEvidence('박도윤','네트워크 설정·검증',3,false).evidence
 expect(pending.filter(e=>isPerformedEvidence(e)&&e.stage===2).map(e=>e.id)).toEqual(['E03'])
 expect(completed.filter(e=>isPerformedEvidence(e)&&e.stage===3).map(e=>e.id)).toEqual(['E04'])
 const proposal=studentEvidence('김민준','장애 원인 분석',1,false).evidence
 expect(criterionEstimate('해결 과정',30,proposal).score).toBeNull()
 const rows=[{name:'이서연',task:'current',taskTitle:'과제',records:pending},{name:'박도윤',task:'current',taskTitle:'과제',records:completed}]
 expect(summarizeObservation('검증',rows)).toMatchObject({observed:1,total:2,missing:1,rate:50})
 expect(summarizeObservation('새로운 기준',rows).rate).toBeNull()
})

test('평가 설명과 보조 기록, 실제 학생 요청을 구분해 보여준다',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'학생별 평가 지원',exact:true}).click()
 await page.getByText('충족 근거와 남은 조건',{exact:true}).click()
 await expect(page.locator('.estimate-explanation')).toContainText('남은 확인')
 await expect(page.locator('.estimate-explanation')).toContainText('배점 30점 중 24점')
 await page.getByRole('button',{name:'수정 1',exact:true}).click()
 await expect(page.locator('.evidence-list')).not.toContainText('E05')
 await page.getByRole('button',{name:'계획·자기 설명 1',exact:true}).click()
 await expect(page.locator('.evidence-list')).toContainText('E05')
 await expect(page.locator('.evidence-kind')).toHaveText('계획')
 await page.getByRole('button',{name:'팀별 모니터링',exact:true}).click()
 const request=page.locator('.detail-section').filter({has:page.getByRole('heading',{name:'학생의 지도 요청',exact:true})})
 await expect(request).toContainText('아직 남긴 요청이 없습니다.')
})

test('역량 수치는 집계 대상과 연결 근거를 공개하고 필터에 따라 재계산된다',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'수업 대시보드',exact:true}).click()
 await expect(page.locator('.project-support .chart-fill-1').first()).toHaveCSS('color','rgb(16, 28, 23)')
 await page.getByLabel('프로젝트',{exact:true}).selectOption('current')
 await page.getByRole('button',{name:'학생별',exact:true}).click()
 await page.getByLabel('역량 조회 대상').selectOption('이서연')
 await page.locator('.competence-bars').getByRole('button',{name:/검증/}).click()
 await page.getByText('집계 기준과 학생 근거',{exact:false}).click()
 await expect(page.locator('.observation-details')).toContainText('0건 ÷ 1건 × 100 = 0%')
 await expect(page.locator('.observation-records')).toContainText('근거 미확인')
 await page.getByLabel('역량 조회 대상').selectOption('김민준')
 await page.getByText('집계 기준과 학생 근거',{exact:false}).click()
 await expect(page.locator('.observation-details')).toContainText('1건 ÷ 1건 × 100 = 100%')
 await page.locator('.observation-details').screenshot({path:'.impeccable/review/observation-detail-1440.png'})
 await page.locator('.observation-records button').click()
 await expect(page.getByLabel('학생 선택')).toHaveValue('김민준')
})
