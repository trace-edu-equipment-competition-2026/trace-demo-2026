import {test,expect,type Page} from '@playwright/test'
import {scenarios} from '../src/domain/scenarios'
import {supportFor,deliverSupport} from '../src/domain/learningLoop'
async function nav(p:Page,name:string){const b=p.getByRole('button',{name:'수업 메뉴 열기',exact:true});if(await b.isVisible()&&!await p.locator('.sidebar.open').count())await b.click();await p.locator('.sidebar nav').getByRole('button',{name,exact:true}).click()}
async function role(p:Page,student:boolean){const b=p.getByRole('button',{name:'수업 메뉴 열기',exact:true});if(await b.isVisible()&&!await p.locator('.sidebar.open').count())await b.click();await p.getByRole('button',{name:'프로필 전환',exact:true}).click();await p.getByRole('button',{name:student?/유송민 학생/:/강병준 교수자/}).click()}
test('팀 가이던스는 협업·프로젝트 주제와 시나리오를 반영하고 승인 없이 원래 채널에 전달된다',()=>{
 for(const s of Object.values(scenarios)){
  const d=structuredClone(s.project);d.assignment={...structuredClone(s.assignment),mode:'AI 자동'}
  for(const [q,topic] of [['역할을 분담하고 싶어요','역할 분담'],['업무가 한 사람에게 몰려요','업무 배분'],['의견이 달라 갈등이 있어요','갈등 조율']]){
   const p=supportFor(q,d,s,'team')!;expect(p.topic).toBe(topic);expect(p.channel).toBe('team');expect(p.text).toContain('팀이 합의')
   const after=deliverSupport(d,p);expect(after.student.teamMessages.at(-1)?.text).toBe(p.text);expect(after.student.privateMessages).toEqual(d.student.privateMessages)
  }
  d.assignment.mode='교수자 승인형';expect(supportFor('역할 분담',d,s,'team')?.status).toBe('approved')
  d.assignment.mode='교수자 직접';d.assignment.manualGuidance='역할을 함께 검토하세요.';expect(supportFor('갈등',d,s,'team')?.text).toBe('역할을 함께 검토하세요.')
  d.assignment.guidance['교수자 직접']=[];expect(supportFor('갈등',d,s,'team')).toBeNull()
  const old={id:'old',level:1,topic:'확인',text:'개인 힌트',reason:'이유',status:'approved' as const,time:'14:00'}
  expect(deliverSupport(d,old).student.privateMessages.at(-1)?.text).toBe('개인 힌트')
 }
})
test('일반 팀 대화와 승인형 AI 요청, 개인 채팅을 분리하고 새로고침 후 보존한다',async({page})=>{
 await page.goto('/');await role(page,true);await nav(page,'팀 채팅')
 await page.getByLabel('팀 메시지',{exact:true}).fill('일반 대화 확인');await page.getByRole('button',{name:'팀에 보내기',exact:true}).click();await expect(page.locator('.ai-guidance')).toHaveCount(0)
 await page.getByRole('button',{name:'역할 분담을 함께 정하고 싶어요',exact:true}).click();await page.getByRole('button',{name:'AI 가이던스 요청',exact:true}).click();await expect(page.locator('.chat-guidance-state')).toContainText('답변 전달됨');await expect(page.locator('.ai-guidance')).toHaveCount(1)
 await role(page,false);await nav(page,'팀별 모니터링');await page.locator('.stage-map-row').first().click();await expect(page.getByRole('button',{name:'힌트 승인·전달',exact:true})).toHaveCount(0);await expect(page.locator('main')).toContainText('팀 채팅 · 역할 분담')
 await role(page,true);await nav(page,'팀 채팅');await expect(page.locator('.ai-guidance')).toContainText('팀이 합의');await expect(page.locator('.chat-guidance-state')).toContainText('답변 전달됨');await expect(page.getByRole('log')).not.toContainText(/L[1-4]/)
 await nav(page,'개인 AI 지원');await expect(page.getByRole('log')).not.toContainText('역할 분담을 함께');await expect(page.getByRole('log')).not.toContainText('담당자와 일정은 팀이 합의')
 await page.reload();await role(page,true);await nav(page,'팀 채팅');await expect(page.locator('.ai-guidance')).toContainText('팀이 합의')
 for(const [width,height] of [[1440,1080],[1180,820],[820,1180],[390,844]]){
  await page.setViewportSize({width,height});await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>{(document.activeElement as HTMLElement)?.blur();window.scrollTo(0,0);document.querySelector('.student-messages')?.scrollTo(0,99999)});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:`.impeccable/review/team-guidance-${width}.png`,fullPage:true})
 }
})
test('융합 가이던스는 자동형과 승인형 모두 팀 채팅에서 바로 답한다',async({page})=>{
 const s=scenarios.fusion,d=structuredClone(s.project);d.assignment={...structuredClone(s.assignment),mode:'AI 자동'}
 await page.goto('/');await page.evaluate(data=>localStorage.setItem('trace-project-fusion-v2',JSON.stringify(data)),d);await page.reload();await page.getByRole('button',{name:'워크스페이스 전환',exact:true}).click();await page.locator('.dropdown-option').filter({hasText:'융합 팀 프로젝트'}).click();await role(page,true);await nav(page,'팀 채팅')
 await page.getByRole('button',{name:'의견이 달라 갈등을 조율하고 싶어요',exact:true}).click();await page.getByRole('button',{name:'AI 가이던스 요청',exact:true}).click();await expect(page.locator('.ai-guidance')).toContainText('누가 맞는지 정하기 전에')
 await page.getByRole('button',{name:'업무가 한 사람에게 몰렸어요',exact:true}).click();await page.getByRole('button',{name:'AI 가이던스 요청',exact:true}).click();await expect(page.locator('.ai-guidance').last()).toContainText('예상 소요 시간')
 await page.evaluate(()=>{(document.activeElement as HTMLElement)?.blur();window.scrollTo(0,0);document.querySelector('.student-messages')?.scrollTo(0,99999)});await page.screenshot({path:'.impeccable/review/team-guidance-fusion-1440.png',fullPage:true})
 await page.evaluate(()=>{const key='trace-project-fusion-v2',data=JSON.parse(localStorage.getItem(key)!);data.assignment.mode='교수자 승인형';localStorage.setItem(key,JSON.stringify(data))});await page.reload();await role(page,true);await nav(page,'팀 채팅');await page.getByRole('button',{name:'역할 분담을 함께 정하고 싶어요',exact:true}).click();await page.getByRole('button',{name:'AI 가이던스 요청',exact:true}).click()
 await role(page,false);await nav(page,'팀별 모니터링');await page.locator('.stage-map-row').first().click();await expect(page.getByRole('button',{name:'힌트 거절',exact:true})).toHaveCount(0);await role(page,true);await nav(page,'팀 채팅');await expect(page.locator('.chat-guidance-state').last()).toContainText('답변 전달됨')
})
