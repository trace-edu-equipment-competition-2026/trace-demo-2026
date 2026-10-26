import {test,expect,type Page} from '@playwright/test'
import {scenarios} from '../src/domain/scenarios'

async function menu(page:Page){const opener=page.getByRole('button',{name:'수업 메뉴 열기',exact:true});if(await opener.isVisible()&&!await page.locator('.sidebar.open').count())await opener.click()}
async function nav(page:Page,name:string){await menu(page);await page.locator('.sidebar nav').getByRole('button',{name,exact:true}).click()}
async function student(page:Page){await menu(page);await page.getByRole('button',{name:'프로필 전환',exact:true}).click();await page.getByRole('button',{name:/유송민 학생/}).click()}
async function workspace(page:Page,id:'network'|'fusion'){await menu(page);await page.getByRole('button',{name:'워크스페이스 전환',exact:true}).click();await page.locator('.dropdown-option').filter({hasText:id==='network'?'2학년 네트워크 실습':'융합 팀 프로젝트'}).click()}
async function stored(page:Page,id:string){return page.evaluate(id=>JSON.parse(localStorage.getItem(`trace-project-${id}-v2`)! ),id)}
async function ask(page:Page,question:string){await page.getByLabel('개인 질문',{exact:true}).fill(question);await page.getByRole('button',{name:'AI에게 질문하기',exact:true}).click();await page.getByRole('button',{name:'수행·판단 기록 열기',exact:true}).last().click()}

for(const id of ['network','fusion'] as const)test(`${id}: 실제 채팅 답변별 폼·예시·저장과 새 대화`,async({page})=>{
 await page.goto('/');await workspace(page,id);await student(page);await nav(page,'개인 AI 지원')
 const before=await stored(page,id)
 await expect(page.locator('.guidance-demo')).not.toHaveAttribute('open')
 await expect(page.getByRole('form',{name:'수행과 판단 기록'})).toHaveCount(0)
 await expect(page.getByRole('heading',{name:'AI 제안에 대한 나의 판단',exact:true})).toHaveCount(0)
 await page.getByRole('button',{name:'새 대화',exact:true}).click()
 await expect(page.getByRole('log')).toContainText('어디에서 막혔나요?')
 await page.getByRole('button',{name:scenarios[id].prompts[0],exact:true}).click()
 await expect(page.getByLabel('개인 질문',{exact:true})).toHaveValue(scenarios[id].prompts[0])
 await page.getByRole('button',{name:'AI에게 질문하기',exact:true}).click()
 const answer=page.getByRole('log').locator('.chat-turn').last()
 await expect(answer.locator('.ai-guidance')).toBeVisible()
 await answer.getByRole('button',{name:'수행·판단 기록 열기',exact:true}).click()
 const form=answer.getByRole('form',{name:'수행과 판단 기록'})
 await expect(form).toBeVisible()
 await expect(page.locator('#chat-record-title')).toBeFocused()
 await form.locator('textarea').first().fill('내가 직접 작성한 관찰 내용')
 await form.getByRole('button',{name:'빈칸 예시 채우기'}).click()
 await expect(form.locator('textarea').first()).toHaveValue('내가 직접 작성한 관찰 내용')
 await form.getByRole('button',{name:'수행 기록 저장',exact:true}).click()
 await expect(form.getByRole('button',{name:'저장됨',exact:true})).toBeDisabled()
 await form.locator('textarea').first().fill('수정해서 저장한 관찰 내용')
 await form.getByRole('button',{name:'수정한 기록 저장',exact:true}).click()
 const after=await stored(page,id)
 expect(after.evidence.length).toBe(before.evidence.length+1)
 expect(after.evidence.at(-1).supportId).toBe(after.supports.at(-1).id)
 expect(after.evidence.at(-1).raw).toBeUndefined()
 expect(after.completed).toEqual(before.completed)
 await form.getByRole('button',{name:'나의 학습 기록 보기'}).click()
 await page.locator('.fusion-evidence-list button').filter({hasText:'수정해서 저장한 관찰 내용'}).click()
 await expect(page.getByRole('dialog')).toContainText('연결된 원자료가 없습니다.')
 await page.getByRole('button',{name:'닫기',exact:true}).click()
 await nav(page,'개인 AI 지원');await page.getByRole('button',{name:'수행·판단 기록 열기',exact:true}).last().click()
 await expect(page.locator('#chat-record textarea').first()).toHaveValue('수정해서 저장한 관찰 내용')
 await page.getByRole('button',{name:'새 대화',exact:true}).click()
 await expect(page.getByRole('log').locator('.student-message')).toHaveCount(0)
 await page.reload();await workspace(page,id);await student(page);await nav(page,'개인 AI 지원')
 await expect(page.getByRole('log').locator('.student-message')).toHaveCount(0)
 expect((await stored(page,id)).evidence).toEqual(after.evidence)
 expect((await stored(page,id)).student.teamMessages).toEqual(before.student.teamMessages)
 await ask(page,'새로운 질문에서 확인할 점은?')
 await expect(page.locator('#chat-record textarea').first()).toBeEmpty()
})

test('응답 단계·작업별 기록 분리와 접을 수 있는 별도 시연',async({page})=>{
 await page.goto('/')
 const data=structuredClone(scenarios.network.project)
 data.assignment={...structuredClone(scenarios.network.assignment),mode:'AI 자동',intervention:'적극',guidance:{...scenarios.network.assignment.guidance,'AI 자동':['확인 질문','탐색 방향 안내','개념 힌트','도구 활용 힌트']}}
 await page.evaluate(data=>localStorage.setItem('trace-project-network-v2',JSON.stringify(data)),data)
 await page.reload();await student(page);await nav(page,'프로젝트 작업실');await page.getByRole('button',{name:'수행 보드',exact:true}).click()
 await page.locator('.fusion-kanban').getByRole('button',{name:/수정 전후 상태 기록/}).click();await page.getByRole('button',{name:'AI 대화에서 기록하기'}).click()
 await ask(page,'어떤 명령어로 경로를 확인하나요?')
 await expect(page.getByLabel('기록할 작업')).toHaveValue('empty')
 await expect(page.getByLabel('선택한 방법과 이유')).toBeVisible()
 await page.getByLabel('선택한 방법과 이유').fill('답변과 작업에 연결한 초안')
 await page.getByLabel('기록할 작업').selectOption('contract');await expect(page.getByLabel('선택한 방법과 이유')).toBeEmpty()
 await page.getByLabel('기록할 작업').selectOption('empty');await expect(page.getByLabel('선택한 방법과 이유')).toHaveValue('답변과 작업에 연결한 초안')
 await ask(page,'관찰한 사실은 무엇인가요?');await expect(page.getByLabel('직접 확인한 사실',{exact:true})).toBeEmpty()
 await page.getByRole('button',{name:'수행·판단 기록 열기',exact:true}).nth(1).click()
 await expect(page.getByLabel('선택한 방법과 이유')).toHaveValue('답변과 작업에 연결한 초안')
 await page.locator('.guidance-demo>summary').click()
 await page.locator('.guidance-demo').getByRole('button',{name:'다음 장면',exact:true}).click()
 await expect(page.locator('.guidance-demo')).toContainText('2 / 3')
 await page.locator('.guidance-demo').getByRole('button',{name:'이전 장면',exact:true}).click()
 await expect(page.locator('.guidance-demo')).toContainText('1 / 3')
 await page.locator('.guidance-demo>summary').click();await expect(page.locator('.guidance-demo')).not.toHaveAttribute('open')
 await workspace(page,'fusion');await page.getByRole('button',{name:'수행·판단 기록 열기',exact:true}).last().click()
 await expect(page.locator('#chat-record textarea').first()).toBeEmpty()
})

test('채팅·보조 패널 정렬과 키보드·데스크톱·태블릿 배치',async({page})=>{
 test.setTimeout(60000)
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())})
 await page.goto('/');await student(page);await nav(page,'개인 AI 지원');await page.emulateMedia({reducedMotion:'reduce'})
 for(const id of ['network','fusion'] as const){
  await workspace(page,id)
  for(const {width,height} of [{width:1440,height:1080},{width:1180,height:820},{width:820,height:1180}]){
   await page.setViewportSize({width,height})
   const toggle=page.getByRole('button',{name:'수행·판단 기록 열기',exact:true}).last()
   await toggle.focus();await page.keyboard.press('Enter')
   await expect(page.locator('#chat-record-title')).toBeFocused()
   const example=page.getByRole('button',{name:'빈칸 예시 채우기'});if(await example.isEnabled())await example.click()
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
   if(width>900){
    const left=await page.locator('.personal-support-layout>.panel').boundingBox(),right=await page.locator('.personal-support-layout .chat-teacher-panel').boundingBox()
    expect(Math.abs(left!.y+left!.height-right!.y-right!.height)).toBeLessThan(2)
   }
   for(const control of await page.locator('#chat-record button,#chat-record select,#chat-record textarea').all())expect((await control.boundingBox())!.height).toBeGreaterThanOrEqual(44)
   await page.getByRole('log').locator('.ai-guidance').last().scrollIntoViewIfNeeded()
   await page.screenshot({path:`.impeccable/review/inline-record-${id}-${width}.png`,fullPage:true})
   await page.getByRole('button',{name:'기록 폼 접기',exact:true}).click()
  }
 }
 expect(errors).toEqual([])
})
