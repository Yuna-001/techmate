# 작업 완료 기록

## 로그인 화면 계정 연결 오류 안내

완료일: 2026-06-16

변경 파일:

- `app/(auth)/login/page.tsx`
- `app/(auth)/login/page.test.tsx`

완료 내용:

- `/login?error=OAuthAccountNotLinked` 상태에서 로그인 카드 안에 `role="alert"` 안내 박스를 표시하도록 변경
- 일반 `/login` 상태에서는 안내 메시지가 표시되지 않도록 조건부 렌더링 적용
- 로그인 페이지 테스트 추가
- Google/GitHub 로그인 버튼이 오류 안내와 함께 계속 렌더링되는지 검증

검증:

- `npm.cmd test -- --runTestsByPath "C:\dev\project\techmate\app\(auth)\login\page.test.tsx"`
- `npm.cmd run typecheck`
- `npm.cmd run lint`
- `curl "http://localhost:3001/login?error=OAuthAccountNotLinked"` 응답에 안내 메시지 포함 확인
- `curl "http://localhost:3001/login"` 응답에 안내 메시지 미포함 확인

비고:

- 인앱 Browser의 `iab` 대상이 제공되지 않아 브라우저 자동 확인은 진행하지 못했고, dev 서버 HTTP 응답으로 서버 렌더링 결과를 확인했다.

## 계정 페이지 provider 연동 상태 표시

완료일: 2026-06-16

변경 파일:

- `types/account.ts`
- `app/api/me/route.ts`
- `app/(protected)/setting/account/page.tsx`
- `app/(protected)/setting/account/page.test.tsx`

완료 내용:

- `AccountResponse`에 연결된 provider 배열인 `providers` 필드 추가
- `GET /api/me`가 현재 사용자에게 연결된 `accounts` 목록을 조회해 유효한 provider 배열을 반환하도록 변경
- 계정 페이지의 단일 `로그인 방식` 표시를 Google/GitHub별 연동 상태 표시로 변경
- 연결된 provider는 `연동됨`, 연결되지 않은 provider는 `연동 필요`로 표시
- 계정 페이지 테스트 추가

검증:

- `npm.cmd test -- --runTestsByPath "C:\dev\project\techmate\app\(protected)\setting\account\page.test.tsx"`
- `npm.cmd run typecheck`
- `npm.cmd run lint`

비고:

- 실제 OAuth 연동 버튼과 callback flow는 다음 작업으로 남겼다.
