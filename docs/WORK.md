# 인증 계정 연결 정책 작업

## 배경

Google과 GitHub OAuth 계정의 이메일이 같은 경우, Auth.js는 기본적으로 자동 계정 연결을 막고 `OAuthAccountNotLinked` 오류를 반환한다.

현재 Google provider에만 `allowDangerousEmailAccountLinking: true`가 설정되어 있으면 로그인 순서에 따라 동작이 달라진다.

- GitHub로 먼저 가입한 뒤 Google로 로그인하면 자동 연결된다.
- Google로 먼저 가입한 뒤 GitHub로 로그인하면 실패한다.

이 비대칭 동작은 사용자 경험과 보안 정책을 모두 애매하게 만든다.

## 처리 방향

자동 이메일 기반 계정 연결은 사용하지 않는다.

- `GoogleProvider`의 `allowDangerousEmailAccountLinking: true`를 제거한다.
- `GithubProvider`에도 `allowDangerousEmailAccountLinking`을 추가하지 않는다.
- 같은 이메일의 다른 OAuth provider 로그인이 들어오면 `OAuthAccountNotLinked` 오류를 유지한다.
- 로그인 화면에서 해당 오류를 사용자가 이해할 수 있는 메시지로 안내한다.

## 사용자 안내 문구

`/login?error=OAuthAccountNotLinked` 상태에서는 아래 의미의 메시지를 표시한다.

```text
이미 같은 이메일로 가입된 계정이 있습니다. 처음 사용한 로그인 방식으로 로그인해 주세요.
```

문구는 실제 로그인 화면의 톤에 맞춰 조정할 수 있다.

## 향후 계정 연결 기능

Google과 GitHub를 모두 로그인 수단으로 허용하려면 자동 연결이 아니라 명시적 연결 흐름을 추가한다.

1. 사용자가 기존 provider로 먼저 로그인한다.
2. 마이페이지 또는 설정 화면에서 다른 provider 연결 버튼을 누른다.
3. 연결 요청임을 일반 로그인 요청과 구분한다.
4. OAuth callback 이후 현재 로그인된 사용자에게 새 provider account를 연결한다.
5. 연결 완료 후 두 provider 모두 같은 사용자 계정으로 로그인할 수 있게 한다.

이 기능을 만들기 전까지는 같은 이메일의 다른 provider 로그인 시 기존 로그인 방식으로 다시 로그인하도록 안내한다.

## 계정 페이지 연동 기능 계획

계정 페이지에서 사용자가 로그인된 상태로 다른 OAuth provider를 직접 연결할 수 있게 한다. 이 기능은 자동 이메일 연결과 별개로, 사용자의 명시적 행동이 있을 때만 `accounts` 컬렉션에 provider 계정을 추가한다.

### 목표 동작

- 사용자는 기존 provider로 먼저 로그인한다.
- `설정 > 계정` 화면에서 Google/GitHub 연동 상태를 확인한다.
- 아직 연결되지 않은 provider는 `연동하기` 버튼을 보여준다.
- 이미 연결된 provider는 `연동됨` 상태를 보여준다.
- 사용자가 `연동하기`를 누르면 해당 provider OAuth를 진행한다.
- OAuth callback 이후 새 provider account는 현재 로그인된 사용자에게 연결된다.
- 이후 사용자는 연결된 provider 중 어느 방식으로든 같은 계정에 로그인할 수 있다.

### 구현상 주의점

- 일반 로그인 flow와 계정 연결 flow를 구분해야 한다.
- 이메일이 같다는 이유만으로 자동 연결하지 않는다.
- 연결 flow는 반드시 현재 세션이 있는 사용자에게만 허용한다.
- 이미 다른 사용자에게 연결된 provider account는 현재 사용자에게 연결하지 않는다.
- 마지막 남은 provider 연결 해제는 허용하지 않는다. 이 작업에서는 해제 기능을 만들지 않는다.

### 구현 방식 후보

Auth.js 기본 OAuth callback은 로그인과 계정 생성을 중심으로 동작한다. 현재 세션이 있는 상태에서 다른 provider로 로그인하면 내부적으로 `linkAccount`가 호출될 수 있지만, 이 동작을 제품 정책으로 쓰려면 일반 로그인 요청과 연결 요청을 명확히 구분하는 장치가 필요하다.

우선 구현은 아래 방식으로 계획한다.

1. 계정 페이지의 `연동하기` 버튼은 일반 로그인 버튼과 분리된 별도 컴포넌트로 만든다.
2. 버튼 클릭 시 `signIn(provider, { callbackUrl: '/setting/account?linked=provider' })`를 호출한다.
3. 연결 시도는 로그인된 사용자에게만 노출한다.
4. Auth callback 이후 `accounts` 컬렉션에 현재 사용자 `_id`로 새 provider account가 추가되었는지 `/api/me` 응답으로 확인한다.
5. 연결 실패 또는 `OAuthAccountNotLinked` 발생 시 계정 페이지 또는 로그인 페이지에서 안내 메시지를 보여준다.

이 방식으로 부족하면 별도 `state` 값이나 callback URL query를 사용해 연결 요청을 식별하고, Auth callback/callbacks 레벨에서 허용 조건을 더 엄격하게 검증한다.

### 계정 페이지 연동 버튼 추가

대상 파일:

- `app/(protected)/setting/account/page.tsx`
- `components/account/provider-link-button.tsx`

작업 내용:

- `providers`에 없는 provider는 `연동 필요` 상태 대신 `연동하기` 버튼을 표시한다.
- 버튼은 클라이언트 컴포넌트로 만들고 `next-auth/react`의 `signIn`을 호출한다.

예상 UI 구조:

```text
연동된 로그인 방식
Google  연동됨
GitHub  연동하기
```

### 계정 페이지 오류/완료 안내

대상 파일:

- `app/(protected)/setting/account/page.tsx`

작업 내용:

- `searchParams`에서 연결 결과 query를 읽는다.
- `linked=google` 또는 `linked=github`가 있으면 완료 안내를 표시한다.
- 연결 실패 query가 있으면 실패 안내를 표시한다.

완료/실패 안내는 실제 OAuth callback 결과와 `/api/me`의 `providers` 값을 기준으로 보여준다. 단순히 query만 보고 성공 처리하지 않는다.

### 테스트 계획

대상 파일:

- `app/api/me/route.test.ts`
- `app/(protected)/setting/account/page.test.tsx`
- `components/account/provider-link-button.test.tsx`

검증 내용:

- 계정 페이지가 미연결 provider에는 `연동하기` 버튼을 표시한다.
- `연동하기` 클릭 시 올바른 provider로 `signIn`을 호출한다.
- 기존 회원 탈퇴 영역은 유지된다.

## 구현 방법

### 1. Auth provider 설정 변경

대상 파일:

- `auth.config.ts`
- `auth.config.test.ts`

작업 내용:

- `GoogleProvider` 설정에서 `allowDangerousEmailAccountLinking: true`를 제거한다.
- `GithubProvider`에는 `allowDangerousEmailAccountLinking`을 추가하지 않는다.
- Auth 설정 테스트는 두 provider 모두 `allowDangerousEmailAccountLinking` 옵션을 받지 않는지 검증하도록 수정한다.

검증 기준:

- `GoogleProvider` mock 호출 인자에 `allowDangerousEmailAccountLinking`이 없다.
- `GithubProvider` mock 호출 인자에 `allowDangerousEmailAccountLinking`이 없다.

## 검증 기준

- Google과 GitHub provider 모두 `allowDangerousEmailAccountLinking`을 사용하지 않는다.
- 기존 provider로 로그인하는 정상 흐름은 유지된다.
- 계정 페이지에서 연결된 provider와 미연결 provider를 구분해 표시한다.
- 미연결 provider의 `연동하기` 버튼은 올바른 OAuth provider로 연결을 시도한다.

## 검증 명령

변경 후 범위에 맞춰 아래 명령을 실행한다.

```bash
npm.cmd run test:changed
npm.cmd run typecheck
npm.cmd run lint
```
