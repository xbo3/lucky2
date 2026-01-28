# BiPlay 프로젝트

## 🤝 소사장과 Claude의 규칙
1. **작업 완료 시 CLAUDE.md 업데이트 필수**
   - 소사장 폴더: `C:\Users\woo\Desktop\★커서★\lucky2\CLAUDE.md`
   - 작업한 레포: 각 프로젝트의 `CLAUDE.md`
   - 내용: 날짜, 작업 내용, 커밋 해시, 기술 스택
2. **배포 전 반드시 확인**
   - 테스트 실행 여부
   - 환경 변수 설정
   - Railway/Vercel 배포 상태
3. **커밋 메시지 규칙**
   - feat: 새 기능
   - fix: 버그 수정
   - docs: 문서 업데이트
   - refactor: 리팩토링

## 마지막 작업 (2026-01-29)
- **BiPlay 어드민 대규모 개선 완료**
  - 섹션별 독립적 간격 조절 (marginTop, marginBottom, paddingX)
  - 모든 섹션에 버튼 추가 기능
    - 투명도 조절 (0-100%)
    - 색상 커스터마이징
    - 링크 타입: URL / 텔레그램 / 내부링크
  - 상세페이지 옵션 추가
    - URL 연결
    - 텍스트 콘텐츠
    - 프라그마틱 슬롯 게임 연동
  - 프라그마틱 무료 슬롯 iframe 모달 플레이어
  - 하위호환성 유지 (migrateSection 함수)
  - 커밋: `20f7da4`, `7c60b9c`

- **Part2 백엔드 AI 자동 스크래핑 추가**
  - AI 자동 셀렉터 추출 기능
    - Playwright로 자동 로그인
    - Claude API로 HTML 분석
    - CSS 셀렉터 자동 추출 및 저장
  - 10분마다 자동 스크래핑 스케줄러
    - APScheduler 통합
    - FastAPI lifespan 이벤트 활용
  - 새 엔드포인트:
    - `POST /api/sites/{site_id}/ai-analyze` - AI 분석 실행
    - `GET /api/sites/{site_id}/selectors` - 셀렉터 조회
    - `GET /api/scheduler/status` - 스케줄러 상태
  - Railway 배포 설정 (railway.toml)
  - 커밋: `fe3be29`, `309a41d`

## 이전 작업 (2025-01-27)
- 완전 리셋: 소사장 폴더 템플릿으로 단순화
- 실시간 미리보기 기능 추가 (postMessage 방식)
- 12가지 컬러 프리셋 버튼 + 커스텀 컬러 피커
- 모든 텍스트 개별 컬러 적용 가능
  - 배너: 제목, 헤드라인, 버튼 배경/텍스트
  - 섹션: 제목 색상
  - 버튼: 배경색, 텍스트 색상
- 실시간 타이핑으로 미리보기 즉시 반영
- **드래그 앤 드롭 업로드 지원**
  - 파일을 끌어다 놓기만 하면 업로드
  - 드래그 시 시각적 피드백 (초록색 테두리)
- **이미지 파일 지원 추가**
  - 동영상 + 이미지 모두 업로드 가능
  - 자동으로 파일 타입 감지 및 렌더링
  - 배경과 배너에 모두 적용
- **순차적 간격 조절**
  - 배너 하단 간격 조절 (0-100px)
  - 각 섹션 하단 간격만 조절 (위쪽 간격 제거)
  - 배너 → 섹션1 → 섹션2... 순서대로 배치
- **버튼 크기 조절**
  - VIP 버튼: 글자 크기, 가로/세로 여백 조절
  - 배너 버튼: 글자 크기, 가로/세로 여백 조절
  - 조절 중 실시간 크기 표시 (px)

## 현재 상태
- 배포 완료: commit 7c60b9c (2026-01-29)
- Railway 자동 배포 중
- 실시간 미리보기 작동 중
- 드래그 앤 드롭 업로드 작동 중
- 섹션별 간격/버튼/상세페이지 조절 작동 중
- 프라그마틱 슬롯 게임 연동 완료

## 다음에 할 것
- 추가 UI/UX 개선 요청 대기
- 사용자 피드백 기반 조정

---

## 📱 BISMS 프로젝트 (2025-01-27)
**레포지토리:** https://github.com/xbo3/bisms

### 최근 작업
- OTP 메시지 형식 통일: "verification otp: {6자리숫자}"
- 내부 OTP API에 전화번호 검증 추가 (validatePhone)
- 잘못된 번호 형식은 발송 전에 차단

### 커밋
- `d298610` - Standardize OTP format and add phone validation

## 파일 구조
```
biplay-simple/
├── index.html          # 프론트엔드 (사용자 페이지)
├── admin.html          # 어드민 페이지 (실시간 미리보기 포함)
├── server.js           # Express 백엔드
├── package.json        # 의존성 (express, multer)
├── data/
│   └── site.json       # 사이트 데이터 저장
└── uploads/            # 업로드된 동영상 파일
```

## 주요 기능
1. **실시간 미리보기**: 수정하면 즉시 왼쪽 화면에 반영
2. **미디어 업로드**: 배경 + 배너에 동영상/이미지 지원
   - 드래그 앤 드롭으로 간편 업로드
   - 클릭해서 파일 선택도 가능
   - 자동 파일 타입 감지
3. **섹션 관리**: 최대 5개 섹션
4. **그리드 레이아웃**: 2x2, 4x1, 1x4, 3x1
5. **컬러 시스템**: 12개 프리셋 + 커스텀
6. **간격 조절**: 배너 + 각 섹션 하단 간격 (순차 배치)
7. **버튼 크기 조절**: VIP 버튼, 배너 버튼 크기 조절

## 도메인
- 프론트: https://vip.luckyviky.eu
- 어드민: https://biplay-production.up.railway.app/admin.html

## 기술 스택
- Frontend: Vanilla JS, HTML, CSS
- Backend: Node.js, Express
- File Upload: Multer
- Deployment: Railway (GitHub 자동 배포)
- Storage: JSON 파일

## 최근 커밋
- `7c60b9c` - feat: 동적 섹션 및 버튼 추가 (2026-01-29)
- `20f7da4` - BiPlay 어드민 대규모 개선 작업 완료 (2026-01-29)
- `c5781ab` - Add spacing controls and button size adjustments
- `7b543a5` - Update CLAUDE.md with drag-and-drop feature
- `fdfc671` - Add drag-and-drop upload and image support

## 참고사항
- 단일 사이트 전용 (멀티사이트 제거)
- 최대 섹션 5개 제한
- 파일 업로드 최대 100MB
- postMessage로 iframe 실시간 통신
