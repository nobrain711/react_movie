# react_movie v0.2 요구사항 (TypeScript 전환 및 에러 대응)

- 작성일: 2026-10-22
- 선행 조건: v0.1 완료 (함수 컴포넌트 전환, Redux Toolkit store, P0/P1 수정)
- 상태: 초안. 설계 확정 전.

## 1. 목표

1. 전체 소스를 TypeScript로 전환한다.
2. 런타임 에러, API 에러, 잘못된 데이터에 대한 대응 체계를 만든다.
3. GitHub Pages 배포 상태에서 열린 보안 경고(Dependabot alert)를 줄인다.

## 2. 배경

- 현재 Dependabot open alert는 31건이다 (critical 3, high 11, medium 17).
- 대부분은 `react-scripts` 2.x의 빌드·개발용 transitive 의존성이다. 배포 번들에 직접 들어가는 것은 `axios`뿐이다.
- `react-scripts` 2.x는 최신 빌드 도구와 TS 최신 버전을 지원하지 않는다. 따라서 v0.2에서 빌드 도구를 함께 교체해야 한다.

## 3. TypeScript 전환 요구사항

| ID | 요구사항 | 완료 조건 |
| --- | --- | --- |
| TS-1 | 모든 `src/**/*.js`를 `.ts`/`.tsx`로 변환한다. | `src/`에 `.js` 파일이 없다. |
| TS-2 | `tsconfig.json`에 `strict: true`를 설정한다. | `tsc --noEmit`이 통과한다. |
| TS-3 | `any`를 쓰지 않는다. 불가피하면 `unknown`과 타입 가드를 쓴다. | ESLint `@typescript-eslint/no-explicit-any` 규칙이 통과한다. |
| TS-4 | YTS 응답 타입을 정의한다: `Movie`, `MoviesResponse`. | `api/movies.ts`가 응답 타입을 반환한다. |
| TS-5 | Redux 타입을 정의한다: `RootState`, `AppDispatch`. `useAppSelector`, `useAppDispatch` 훅을 만든다. | 컴포넌트에서 `useSelector`/`useDispatch`를 직접 쓰지 않는다. |
| TS-6 | Detail 라우트의 `location.state` 타입을 정의한다. | 상세 페이지가 `state`를 타입 안전하게 읽는다. |
| TS-7 | Movie props, Detail props 타입을 `propTypes`에서 TS 타입으로 옮긴다. `prop-types`는 제거한다. | `prop-types` 의존성이 없다. |
| TS-8 | 테스트를 TS로 작성한다. | 테스트 파일이 `.ts`/`.tsx`이다. |

### 3.1 빌드 도구

- `react-scripts`를 제거하고 Vite를 권장한다. 대안은 CRA 유지 + TS 설정이지만, Dependabot alert 해소 목표와 충돌하므로 권장하지 않는다.
- GitHub Pages 경로 `/react_movie/`에 맞춰 Vite의 `base`를 설정한다.
- `HashRouter`는 유지한다.
- `gh-pages` 배포 스크립트 경로(`build` → `dist`)를 바꾼다. 출력 디렉터리를 바꾸면 `deploy` 스크립트도 같이 수정한다.

### 3.2 테스트 도구

- Jest 23 기반 CRA 테스트 대신 Vitest를 권장한다. Vite와 설정을 공유한다.
- `@testing-library/react`는 최신 메이저 버전으로 올린다.

## 4. 에러 대응 요구사항

### 4.1 API 에러

| ID | 요구사항 | 완료 조건 |
| --- | --- | --- |
| ERR-1 | API 실패를 세 종류로 분류한다: 네트워크 오류, HTTP 상태 오류, 응답 형식 오류. | 각 분류별 메시지가 다르다. |
| ERR-2 | API 응답을 런타임에 검증한다. 타입만으로는 외부 데이터를 보장할 수 없다. | 형식이 맞지 않으면 "응답 형식 오류"로 처리되고 UI가 깨지지 않는다. |
| ERR-3 | 목록 로드 실패 시 "다시 시도" 버튼을 제공한다. | 버튼 클릭 시 `loadMovies`가 다시 dispatch된다. |
| ERR-4 | 목록이 비어 있으면 "표시할 영화가 없습니다." 상태를 보여준다. | 빈 응답에서 빈 상태 메시지가 보인다. |
| ERR-5 | Redux `rejected` 액션의 `error`를 직렬화 가능한 형태로 저장한다. | store에 `Error` 객체가 들어가지 않는다. |

### 4.2 렌더링 에러

| ID | 요구사항 | 완료 조건 |
| --- | --- | --- |
| ERR-6 | 라우트 단위 Error Boundary를 둔다. 렌더 중 예외가 나면 앱 전체가 흰 화면이 되지 않는다. | 강제로 던진 에러에서 fallback UI가 보인다. |
| ERR-7 | Error Boundary 구현 방식을 결정한다 (4.4 참고). | 결정 내용이 설계 문서에 기록된다. |

### 4.3 라우팅과 잘못된 입력

| ID | 요구사항 | 완료 조건 |
| --- | --- | --- |
| ERR-8 | 알 수 없는 경로는 404 페이지를 보여준다 (v0.1 P2-2 반영). | 해시 경로가 잘못되면 404 메시지와 `/` 링크가 보인다. |
| ERR-9 | 상세 페이지 `state`가 없으면 `/`로 `replace`한다 (v0.1 반영). | 직접 접근 시 리다이렉트된다. |
| ERR-10 | 트레일러 코드는 YouTube ID 형식(`^[A-Za-z0-9_-]{11}$`)일 때만 링크를 만든다. | 형식이 다르면 링크를 렌더링하지 않는다. |
| ERR-11 | 외부 링크는 `target="_blank"`와 `rel="noopener noreferrer"`를 함께 쓴다. | 모든 외부 링크가 두 속성을 가진다. |

### 4.4 Error Boundary 구현 방식 (결정 필요)

Error Boundary는 React에서 클래스 컴포넌트로만 만들 수 있다. v0.1에서 클래스 컴포넌트를 제거하는 방침과 충돌한다.

- 선택 A: `react-error-boundary` 라이브러리 사용. 클래스 코드를 직접 쓰지 않는다. 권장.
- 선택 B: 클래스 Error Boundary 한 개만 예외로 둔다.

## 5. 보안 대응 요구사항

| ID | 요구사항 | 완료 조건 |
| --- | --- | --- |
| SEC-1 | 배포 번들에 들어가는 의존성의 open alert를 0건으로 만든다. | Dependabot에서 production 의존성 alert가 없다. |
| SEC-2 | `axios`를 패치된 최신 버전으로 올린다. | `npm ls axios`가 최신 패치 버전이다. |
| SEC-3 | 빌드·개발 의존성 alert는 빌드 도구 교체 후 재확인한다. | 교체 후 남은 alert를 목록으로 기록하고 사유를 적는다. |
| SEC-4 | CI에 `npm audit --omit=dev`를 추가한다. high 이상이면 실패한다. | PR에서 audit 단계가 돈다. |
| SEC-5 | `npm audit fix --force`는 사용하지 않는다. | 커밋 메시지나 PR에 `--force` 사용 기록이 없다. |
| SEC-6 | `dangerouslySetInnerHTML`을 쓰지 않는다. | 코드 검색에서 해당 문자열이 없다. |
| SEC-7 | Dependabot 설정을 유지하고 major 업데이트는 PR 단위로 검토한다. | `.github/dependabot.yml` 존재 여부 확인. |

## 6. 단계

| 단계 | 내용 | 산출물 |
| --- | --- | --- |
| S1 | 빌드 도구 결정 (Vite 권장) 및 설치 | `package.json`, 설정 파일 |
| S2 | 타입 정의 (`types/`) 및 `tsconfig.json` | 타입 파일 |
| S3 | API 모듈과 store를 TS로 전환, ERR-1·2·5 반영 | `api/movies.ts`, `store/*.ts` |
| S4 | 컴포넌트 TS 전환, ERR-3·4·6·8·9·10·11 반영 | `.tsx` 파일 |
| S5 | 테스트를 Vitest로 전환 | 테스트 파일 |
| S6 | CI audit 단계 추가, Dependabot 확인 | `.github/workflows/*`, alert 재확인 기록 |
| S7 | 배포 확인 (GitHub Pages) | 배포 URL 동작 확인 |

## 7. 완료 기준

- `tsc --noEmit`, `npm run build`, 테스트가 모두 통과한다.
- `src/`에 `.js` 파일과 `any`가 없다.
- 4장의 ERR 항목 전부 완료 조건을 만족한다.
- 5장의 SEC-1, SEC-2, SEC-4가 완료되고, SEC-3의 남은 alert 목록이 기록된다.
- GitHub Pages 배포 URL에서 목록, 상세, 404, 에러 화면이 동작한다.

## 8. 미결정 사항

1. 빌드 도구: Vite 전환 확정 여부.
2. Error Boundary: `react-error-boundary` 사용 여부 (4.4).
3. 런타임 검증 방식: `zod` 등 라이브러리 사용 여부 또는 직접 타입 가드 작성.
4. 테스트 도구: Vitest 확정 여부.
