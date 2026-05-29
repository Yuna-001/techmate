<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## 프로젝트 작업 규칙

### 커밋 컨벤션

커밋 메시지를 작성할 때는 아래 타입을 사용한다.

- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `refactor`: 프로덕션 코드의 동작 변경 없이 구조를 개선하는 경우
  단, 테스트 파일이나 테스트 유틸만 변경하는 리팩토링은 `test`를 사용한다.
- `style`: CSS, Tailwind 클래스 등 사용자 UI 디자인 변경
- `comment`: 코드 주석 추가 및 변경
- `test`: 테스트 파일, 테스트 유틸, fixture, mock, 테스트 설정 등 테스트 관련 코드만 변경하는 경우
  예: 테스트 추가, 수정, 삭제, 테스트 코드 리팩토링, 테스트 이름/변수명/상수명 정리
- `chore`: 위 타입에 해당하지 않는 기타 변경사항  
  예: 빌드 스크립트 수정, 이미지 에셋 변경, 패키지 매니저 관련 변경
- `rename`: 파일 또는 폴더명을 수정하거나 옮기는 경우
- `remove`: 코드나 파일을 삭제하는 작업만 수행하는 경우
- `docs`: 문서 수정

커밋 메시지는 아래 형식을 따른다.

```text
type: 변경 내용 요약

- 세부 변경 사항
- 세부 변경 사항
```

- 커밋 타입은 영어 키워드를 사용하고, 제목과 본문 설명은 한글로 작성한다.
- 제목과 본문의 문장은 가능한 한 명사형으로 끝낸다.
- 본문은 변경 사항이 여러 개이거나 의도를 설명할 필요가 있을 때 작성한다.
- 커밋 본문 bullet은 별도의 `-m`으로 나누지 않고, 하나의 메시지 블록으로 작성한다.
- 필요하다면 작업 단위에 따라 커밋을 여러 개로 나눈다.

예시:

```text
fix: 정적 이미지 요청 프록시 제외

- 헤더 로고를 public 정적 경로로 참조하도록 변경
- 확장자가 있는 정적 파일 요청이 인증 프록시를 타지 않도록 matcher 수정
```

### PR 작성 규칙

PR 제목은 prefix 없이 변경 내용을 간결하게 작성한다.

개인 프로젝트이므로 별도 요청이 없으면 PR은 draft가 아닌 ready for review 상태로 생성한다.

- 좋은 예: `홈 페이지 질문 목록 UI 개선`
- 나쁜 예: `feat: 홈 페이지 질문 목록 UI 개선`

PR 설명은 반드시 아래 형식을 따른다.

```md
## 어떤 기능인가요?

## 작업 상세 내용

## 참고 자료
```

각 항목에는 다음 내용을 작성한다.

- `어떤 기능인가요?`: 사용자 관점에서 변경된 기능이나 화면을 요약
- `작업 상세 내용`: 구현한 변경 사항, 테스트 및 검증 내용
- `참고 자료`: 관련 이슈, 디자인, 문서 링크. 없으면 `없음`으로 작성

### 테스트 및 검증

테스트는 현재 코드베이스의 Jest + React Testing Library 패턴을 따른다.

#### 테스트 작성 규칙

- 테스트 파일은 대상 파일과 같은 디렉터리에 `*.test.ts` 또는 `*.test.tsx`로 둔다.
- 순수 함수나 fetch 파서처럼 DOM이 필요 없는 테스트는 파일 상단에 `/** @jest-environment node */`를 선언한다.
- 컴포넌트 테스트는 `@testing-library/react`의 `render`, `screen`, `within`, `waitFor`를 우선 사용한다.
- 사용자 상호작용은 `@testing-library/user-event`의 `userEvent.setup()`을 만들고 `await user.click(...)`, `await user.type(...)`, `await user.clear(...)`처럼 실제 사용자 흐름에 가깝게 검증한다.
- 요소 조회는 가능한 한 `getByRole`, `getByLabelText`처럼 접근성 기반 쿼리를 우선 사용한다.
- 상태 검증은 화면 문구뿐 아니라 `aria-pressed`, `aria-checked`, `aria-invalid`, `aria-busy`, `disabled`, `aria-current` 같은 접근성 속성도 함께 확인한다.
- `clientFetch`, `next/navigation`, `next-auth/react`, `sonner`처럼 외부 의존성이 있는 모듈은 `jest.mock`으로 고립한다.
- fetch 성공/실패 응답은 `@/test/fixtures/fetch`의 `SUCCESS_204`, `FAIL_500` 같은 공통 fixture를 우선 재사용한다.
- `clientFetch` mock 타입은 `@/test/types`의 `MockClientFetch`를 사용한다.
- 로딩 중 상태처럼 Promise가 pending인 순간을 검증해야 하면 `@/test/utils/async`의 `createDeferred()`를 사용한다.
- 여러 입력값에 대해 같은 동작을 검증할 때는 `test.each`를 사용한다.
- 새 테스트는 변경 범위에 따라 정상 흐름뿐 아니라 실패 응답, 네트워크 예외, 로딩 상태, 낙관적 업데이트 롤백처럼 사용자가 체감하는 상태 변화를 함께 검증한다.

#### 검증 명령

테스트와 검증 명령은 아래를 사용한다. `npm` 대신 `npm.cmd`를 사용한다.

- `npm.cmd run test`: 전체 테스트 실행
- `npm.cmd run test:changed`: 변경 파일 관련 테스트 실행
- `npm.cmd run typecheck`: TypeScript 타입 검사
- `npm.cmd run lint`: ESLint 검사
- `npm.cmd run format:check`: Prettier 포맷 검사

변경 후에는 변경 범위에 맞는 테스트와 `typecheck`, `lint` 중 필요한 검증을 실행한다.

### 의존성 관리

- 새 의존성은 명확히 필요한 경우에만 추가한다.
- 사용 가능한 라이브러리나 스크립트를 추정하지 말고 먼저 `package.json`을 확인한다.
- 주요 프레임워크나 라이브러리 버전을 변경한 경우 `package.json`과 함께 `AGENTS.md`의 기술 스택 섹션도 수정한다.

## 기술 스택

이 프로젝트는 Next.js App Router 기반의 TypeScript 웹 애플리케이션이다. 아래 목록은 현재 주요 스택 파악용이며, 정확한 패키지와 버전은 항상 `package.json`을 기준으로 확인한다.

### Core

- Next.js App Router
- React
- TypeScript

### UI

- Tailwind CSS
- Shadcn UI
- Radix UI
- Lucide React
- Sonner
- next-themes

### 인증 및 데이터

- NextAuth
- MongoDB
- Mongoose
- Auth MongoDB Adapter

### AI

- OpenAI SDK

### 테스트 및 품질

- Jest
- React Testing Library
- ESLint
- Prettier
- Husky
- lint-staged

## 코드 스타일

### 네이밍

- 파일: kebab-case (`product-card.tsx`)
- 컴포넌트 함수: PascalCase (`ProductCard`)
- 일반 함수·변수: camelCase (`handleAddToCart`)
- 상수: UPPER_SNAKE_CASE (`MAX_QUANTITY`)

### 컴포넌트

- 컴포넌트는 함수형 컴포넌트만 사용한다.
- 페이지 컴포넌트는 `export default`로 내보낸다.
- 일반 컴포넌트는 named export로 내보낸다.
- props는 구조 분해 할당으로 받는다.
- 기본적으로 Server Component를 우선 사용한다.
- Client Component는 상호작용, hooks, 브라우저 API, 클라이언트 상태가 필요한 경우에만 사용한다.
- `use client`는 필요한 컴포넌트 파일에만 선언한다.
- 기존 UI 컴포넌트, fetch 유틸리티, 모델, 서버 유틸리티를 우선 재사용한다.

### 함수

컴포넌트가 아닌 일반 함수는 기본적으로 화살표 함수로 작성한다.

예외:

- Next.js에서 요구하는 예약 함수나 특수 함수
- 라이브러리/API 규격상 함수 선언문이 필요한 경우
- 호이스팅이 명확히 필요한 경우

### 스타일링

- 유틸리티 클래스를 우선 사용하고, 인라인 style 속성은 사용하지 않는다.
- 클래스가 길어질 경우 줄바꿈으로 가독성을 유지한다.

### 일반 코드

- 주석은 WHY가 비명확한 경우에만 작성하고, WHAT을 설명하는 주석은 작성하지 않는다.
- 불필요한 추상화나 기능을 추가하지 않고, 요구사항 범위 안에서만 구현한다.
- 에러 처리는 사용자 입력, 외부 API 같은 시스템 경계에서만 수행한다.
