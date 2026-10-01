import type { TeamResource } from './student'
// 작성된 데모 원자료. 실제 학생 업로드·실행 로그 아님.
export const demoSources:Record<'network'|'fusion',TeamResource[]> = {
  "network": [
    {
      "id": "routing-research",
      "name": "정적 경로 조사 노트.txt",
      "kind": "조사 원자료",
      "author": "유송민",
      "updated": "오늘 14:01",
      "version": 1,
      "body": "[시연용 조사 문서 · 1팀 / 유송민 / 14:01]\n조사 질문: 목적지 주소와 다음 홉은 어떻게 다른가?\n참조 자료: 수업 실습 핸드아웃 「정적 라우팅」 3쪽 (가상 자료)\n발췌한 명령 형식: ip route <목적지 네트워크> <서브넷 마스크> <다음 홉>\n\n직접 계산한 연결 대역: 10.0.0.0/30\n네트워크 주소: 10.0.0.0 / 사용 가능: 10.0.0.1, 10.0.0.2 / 브로드캐스트: 10.0.0.3\nR1 연결 주소: 10.0.0.1 / R2 연결 주소: 10.0.0.2\nR2의 10.0.0.9는 이 연결 대역의 인접 주소가 아니다.\n\n적용할 가설: R2에서 본사로 돌아오는 다음 홉을 확인한다.\n미확인: 실제 인터페이스 상태와 양방향 Ping. 조사만으로 복구를 확정하지 않는다.",
      "demo": true
    },
    {
      "id": "route-capture",
      "name": "R1-R2_경로조회_수정전.log",
      "kind": "실행 원자료",
      "author": "유송민",
      "updated": "오늘 14:08",
      "version": 1,
      "body": "[시연용 장비 콘솔 캡처 · 변경 전 / 14:08]\nR1# show ip route\nC 192.168.10.0/24 is directly connected, GigabitEthernet0/0\nC 10.0.0.0/30 is directly connected, GigabitEthernet0/1\nS 192.168.20.0/24 [1/0] via 10.0.0.2\n\nR2# show running-config | include ip route\nip route 192.168.10.0 255.255.255.0 10.0.0.9\nR2# show ip route\nC 192.168.20.0/24 is directly connected, GigabitEthernet0/0\nC 10.0.0.0/30 is directly connected, GigabitEthernet0/1\n192.168.10.0/24: 유효 경로 없음\n\nPC-A> ping 192.168.10.1\nPackets: Sent = 4, Received = 4, Lost = 0 (0% loss)\nPC-A> ping 192.168.20.10\nRequest timed out. (4회)\nPackets: Sent = 4, Received = 0, Lost = 4 (100% loss)",
      "demo": true
    }
  ],
  "fusion": [
    {
      "id": "interview-source",
      "name": "사용자 인터뷰_원기록.csv",
      "kind": "조사 원자료",
      "author": "김민준",
      "updated": "오늘 13:50",
      "version": 1,
      "body": "[시연용 가상 인터뷰 · 익명 참여자 / 13:50]\nid,질문,참여자 답변,관찰\nU01,최근 찾기 어려웠던 정보는?,\"장학 신청 기간을 검색했는데 작년 공지가 먼저 나왔어요\",최신 공지 구분 어려움\nU02,답을 찾은 뒤 무엇을 확인하나요?,\"학과 안내인지 학교 전체 안내인지 원문을 다시 열어요\",출처와 적용 범위 확인\nU03,안내문에 없는 질문이라면?,\"모른다고 하고 어디에 물어볼지 알려주면 좋겠어요\",근거 없는 답변보다 문의 경로 선호\n\n원문 메모: 질문의 편의성만큼 원문 확인 경로가 필요하다.\n팀 결정: 공개 안내문 5개로 시작. 실제 사용자 검증은 이후 별도 수행.",
      "demo": true
    },
    {
      "id": "search-research",
      "name": "검색과 생성_비교 조사.txt",
      "kind": "조사 원자료",
      "author": "유송민",
      "updated": "오늘 13:58",
      "version": 1,
      "body": "[시연용 조사 문서 · 유송민 / 13:58]\n조사 질문: 출처가 없는 답변을 어떻게 구분할까?\n참조: 수업 제공 「검색 기반 안내 프로그램」 예제 (가상 자료)\n읽은 예제: 문서 검색 → 관련 문서 ID 확인 → 답변과 출처 반환\n\n후보 A: 질문을 바로 생성 모델에 전달\n- 장점: 빠르게 답변 화면을 만들 수 있음\n- 확인할 위험: 원문에 없는 내용과 출처를 검증하기 어려움\n후보 B: 공개 문서를 먼저 조회하고 해당 문서로만 답변 구성\n- 장점: source_ids로 원문을 대조 가능\n- 확인할 위험: 관련 문서 판별 기준과 갱신 필요\n\n초기 선택: 후보 B. 실제 API 전에는 고정 응답으로 화면 계약 비교.\n남은 질문: 빈 source_ids인데 answer가 채워진 경우 어떤 상태를 보여줄까?",
      "demo": true
    },
    {
      "id": "api-contract",
      "name": "응답계약_초안.json",
      "kind": "설계 원자료",
      "author": "유송민",
      "updated": "오늘 14:06",
      "version": 1,
      "body": "{\n  \"_demo\": \"시연용 팀 설계 초안 · 14:06\",\n  \"request\": {\"question\": \"도서관은 몇 시에 닫나요?\"},\n  \"registered\": {\"answer\": \"평일 18시입니다.\", \"source_ids\": [\"D01\"], \"status\": \"ok\"},\n  \"unregistered_before_fix\": {\"answer\": \"주말에도 24시간 운영합니다.\", \"source_ids\": [], \"status\": \"ok\"},\n  \"expected_unregistered\": {\"answer\": null, \"source_ids\": [], \"status\": \"not_found\"},\n  \"open_question\": \"빈 출처를 API와 화면 중 어디에서 검사할지 팀 합의 필요\"\n}",
      "demo": true
    },
    {
      "id": "schema-source",
      "name": "documents_schema.sql",
      "kind": "구현 원자료",
      "author": "유송민",
      "updated": "오늘 14:01",
      "version": 1,
      "body": "-- 시연용 팀 작성 코드 · 유송민 / 14:01\nCREATE TABLE documents (\n  id TEXT PRIMARY KEY,\n  title TEXT NOT NULL,\n  body TEXT NOT NULL,\n  source TEXT NOT NULL,\n  updated_at TEXT NOT NULL\n);\nINSERT INTO documents VALUES\n('D01', '도서관 운영 안내', '평일 09:00~18:00', '공개 안내문 D01 (가상)', '2026-09-01');\nSELECT id, title, source, updated_at FROM documents WHERE id = 'D01';\n-- 관찰 결과: D01 | 도서관 운영 안내 | 공개 안내문 D01 (가상) | 2026-09-01\n-- 답변의 source_ids는 documents.id와 연결한다.",
      "demo": true
    },
    {
      "id": "prototype-log",
      "name": "고정응답_화면확인_중간기록.csv",
      "kind": "실행 원자료",
      "author": "윤서준",
      "updated": "오늘 14:10",
      "version": 1,
      "body": "[시연용 중간 실행 기록 · 고정 JSON / React 화면 / v0.2]\ncase,input,source_ids,expected,observed,result\nT01,도서관 운영 시간,[D01],답변과 원문 링크,평일 18시와 D01 링크 표시,PASS\nT02,기숙사 야간 출입 시간,[],자료 없음 안내,24시간이라고 표시됨,FAIL\nT03,빈 질문,미실행,입력 안내,미확인,NOT_RUN\n\nT02 화면 관찰: 출처 영역은 비었는데 답변 영역은 정상 응답 색으로 표시됨.\n관련 자료: 응답계약_초안.json / unregistered_before_fix\n아직 화면 분기 수정 전이며 실제 AI API와 연결하지 않았다.",
      "demo": true
    }
  ]
}
