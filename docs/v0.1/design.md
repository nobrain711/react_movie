# react_movie v0.1 설계 문서

- 작성일: 2026-10-22
- 기준: `main` @ 10b5117
- 관련 문서: `docs/v0.1/requirements.md`
- 상태: 설계 단계. 소스 코드는 변경하지 않았다.

## 1. 목표와 범위

v0.1의 목표는 세 가지다.

1. `src/`의 클래스 컴포넌트(`Home`, `Detail`)를 함수 컴포넌트로 바꾼다.
2. 영화 목록 상태를 Redux Toolkit store로 관리한다.
3. `requirements.md`의 P0/P1 항목을 함께 처리한다. P2는 가능한 범위에서 처리한다.

범위 밖은 다음과 같다.

- TypeScript 전환. v0.2에서 진행한다. v0.1에서는 `.js` 파일을 유지한다.
- `react-scripts`, `react-router-dom` 메이저 업그레이드.
- 디자인 변경.

## 2. 현재 상태

- `package.json`과 `package-lock.json`이 변경되어 있다(커밋 전). 추가된 의존성:
  - `@reduxjs/toolkit@^2.13.0`
  - `react-redux@^9.3.0`
  - `prop-types@^15.8.1` (P1-1)
- `node_modules`는 `npm ci`로 설치했다. Node v24.14.1, npm 11.16.0.
- `src/` 파일은 아직 변경되지 않았다. 작성 시도는 사용자 요청으로 중단되었다.
- 설치된 주요 버전: `react` 18.2.0, `react-router-dom` 5.1.2, `react-scripts` 2.x.

## 3. 아키텍처

### 3.1 디렉터리 구조 (목표)

```
src/
  index.js                 # Provider로 App 감싸기
  App.js                   # HashRouter + Route (변경 최소)
  api/
    movies.js              # YTS 요청, URL 단일 관리 (fetchMovies)
  store/
    index.js               # createAppStore(), store
    moviesSlice.js         # 상태, loadMovies thunk, reducer
  routes/
    Home.js                # 함수 컴포넌트, useSelector/useDispatch
    Detail.js              # 함수 컴포넌트, useLocation/useHistory
    About.js               # 변경 없음
  components/
    Movie.js               # propTypes 정리, Link 공백 제거
    Navigation.js          # 변경 없음
  App.test.js              # 앱 통합 테스트 (API 모킹)
  routes/Detail.test.js    # 상세 페이지 테스트 (MemoryRouter)
  store/moviesSlice.test.js# reducer 단위 테스트 (네트워크 없음)
```

### 3.2 상태 설계

Redux slice는 `movies` 하나다.

```js
// initialState
{ items: [], isLoading: true, error: null }
```

| 액션 | 상태 변화 |
| --- | --- |
| `loadMovies.pending` | `isLoading = true`, `error = null` |
| `loadMovies.fulfilled` | `items = payload`, `isLoading = false` |
| `loadMovies.rejected` | `isLoading = false`, `error = action.error.message` |

- `loadMovies`는 `createAsyncThunk("movies/load", () => fetchMovies())`로 만든다.
- 요청 로직은 `api/movies.js`에만 있다. thunk와 컴포넌트는 URL을 모른다.
- 상세 페이지가 쓰는 선택 영화 데이터는 Redux에 넣지 않는다. 기존처럼 `Link`의 `state`로 전달한다. 이유는 사용자가 상세 URL로 직접 접근했을 때 리다이렉트 동작을 유지하기 위해서다.

### 3.3 데이터 흐름

```
Home mount
  → dispatch(loadMovies())
  → thunk: fetchMovies() (api/movies.js)
  → pending / fulfilled | rejected
  → useSelector(state => state.movies)
  → Home 렌더링: error ? 메시지 : isLoading ? 로더 : Movie 목록
Movie 클릭
  → Link to /movie-detail with state
  → Detail: state 있으면 렌더, 없으면 history.replace("/")
```

## 4. 컴포넌트 변환 설계

### 4.1 Home (`src/routes/Home.js`)

- class → function.
- 상태는 `useSelector`로 읽는다. 로컬 state는 두지 않는다.
- `useEffect(() => { dispatch(loadMovies()); }, [dispatch])`로 마운트 시 한 번 요청한다.
- 렌더 분기 순서: `error` → 에러 메시지, `isLoading` → 로더, 그 외 → 목록.
- `key`는 `movie.id` 유지 (P0-3과 무관, 목록 key는 이미 있음).
- `eslint-disable-line` 주석 제거 (P2-3).

### 4.2 Detail (`src/routes/Detail.js`)

- class → function.
- `const location = useLocation(); const history = useHistory();`
- `movie = location.state`. `useEffect`에서 `movie`가 없으면 `history.replace("/")`. 기존 `push`에서 `replace`로 바꾼다. 뒤로 가기 루프를 막기 위해서다.
- `movie`가 없으면 `null`을 반환한다.
- 장르 `<li>`에 `key={index}` 추가 (P0-3).
- `console.log` 삭제 (P1-3).
- CSS 이름 정정 (P1-4): `moive__detail` → `movie__detail`, `moive__summary` → `movie__summary`, `movie__geners` → `movie__genres`. 상세 `ul`의 className도 `movie__genres`로 맞춘다.
- 트레일러 (P1-5): `movie.trailer`가 있으면 `<a className="movie__trailer" href={`https://www.youtube.com/watch?v=${trailer}`} target="_blank" rel="noreferrer">예고편 보기</a>`를 렌더링한다. 없으면 아무것도 렌더링하지 않는다. 빈 div는 제거한다.

### 4.3 Movie (`src/components/Movie.js`)

- 이미 함수 컴포넌트이므로 변환 대상이 아니다.
- propTypes 정정 (P1-2). 정정 전 요구사항 문서의 설명을 바로잡는다. `background`와 `trailer`는 카드에서 직접 그리지 않지만, `Link`의 `state`로 상세 페이지에 전달되므로 필수 유지가 맞다. 실제 문제는 `id`가 propTypes에 없다는 점이고, `id`는 카드에서 사용하지 않으므로 propTypes에 추가하지 않는다. Home에서 넘기는 `id`는 `key` 용도로만 쓰인다.
- `{" "}` 제거 (P2-3).
- JSDoc 정정: `summary`의 "정류"를 "줄거리"로 고친다. `id` 항목은 삭제한다.

### 4.4 App / index

- `App.js`는 변경 최소. P2-2 404 라우트를 추가한다. 나머지 `HashRouter` 구조는 유지한다.
- `index.js`는 `<Provider store={store}><App /></Provider>`로 감싼다. `reportWebVitals()`는 그대로 둔다.

## 5. 파일 소유권

병렬 작업 시 같은 파일을 두 worker가 수정하지 않도록 소유권을 나눈다.

| 파일 | 소유 태스크 |
| --- | --- |
| `package.json`, `package-lock.json` | T0 (완료, 추가 수정 없음) |
| `src/api/movies.js` | T1 |
| `src/store/index.js`, `src/store/moviesSlice.js` | T1 |
| `src/store/moviesSlice.test.js` | T5 |
| `src/components/Movie.js`, `src/components/Movie.css` | T2 |
| `src/routes/Home.js` | T3 |
| `src/routes/Detail.js`, `src/routes/Detail.css`(있으면) | T4 |
| `src/index.js` | T3 |
| `src/App.js` | T6 |
| `src/App.test.js`, `src/routes/Detail.test.js` | T5 |
| `CLAUDE.md`, `README.md` | T7 |

`src/index.js`는 T3가 맡는다. Provider 연결은 Home이 store에 의존하는 시점과 맞춰야 하기 때문이다.

## 6. 태스크 DAG

```
T0 (완료: 의존성 설치)
 ├─ T1 api + store ──┬─ T3 Home + index.js ──┐
 │                   │                       │
 │                   └─ T5 store/app 테스트 ─┤
 ├─ T2 Movie 정리 ─────────────────────────┤
 └─ T4 Detail 변환 ────────────────────────┤
                                            ├─ T6 App.js 404 + 통합 검증
                                            └─ T7 문서 갱신
```

Wave 구성:

| Wave | 태스크 | 병렬 여부 |
| --- | --- | --- |
| 1 | T1, T2, T4 | 병렬. 파일이 겹치지 않는다. |
| 2 | T3 | T1 완료 후 |
| 3 | T5, T6 | T3 완료 후. T5는 T3·T4와 함께 가능. |
| 4 | T7, 최종 검증 | 전부 완료 후 |

T4(Detail)는 store에 의존하지 않으므로 Wave 1에서 시작한다.

## 7. 태스크 명세

Orca `worker-start --spec`에 그대로 넣을 수 있도록 Target, Change, Constraints, Ownership, Observable acceptance 다섯 항목으로 쓴다.

### T1 — api 모듈과 store

- **Target:** `src/api/movies.js`, `src/store/index.js`, `src/store/moviesSlice.js`
- **Change:**
  - `fetchMovies()`: URL `https://yts.mx/api/v2/list_movies.json?sort_by=rating`, `data.data.movies` 반환.
  - `loadMovies` thunk와 slice(`items`, `isLoading`, `error`) 작성.
  - `createAppStore()`와 `store`를 export.
- **Constraints:**
  - 파일은 `.js`로 유지한다 (v0.2에서 TS 전환).
  - reducer는 순수해야 한다. 네트워크 호출은 thunk 안에서만 한다.
  - `axios`는 `api/movies.js`에서만 import한다.
- **Ownership:** 위 세 파일만 수정한다.
- **Observable acceptance:** `store/moviesSlice.test.js`(T5)가 pending/fulfilled/rejected 전이를 검증한다. T1 단독으로는 빌드 확인까지만 한다.

### T2 — Movie 정리

- **Target:** `src/components/Movie.js`, `src/components/Movie.css`
- **Change:**
  - propTypes를 실제 사용 props에 맞춘다. `id`는 추가하지 않는다.
  - `Link` 안의 `{" "}` 제거.
  - JSDoc "정류" → "줄거리", `id` 항목 삭제.
- **Constraints:** 카드 레이아웃과 클래스명(`movie__genres`, `movie__genre`)은 바꾸지 않는다.
- **Ownership:** 위 두 파일만.
- **Observable acceptance:** 콘솔에 propTypes 경고가 없다(T5 테스트 렌더 중 `console.error` 검사).

### T3 — Home 변환과 Provider 연결

- **Target:** `src/routes/Home.js`, `src/index.js`
- **Change:**
  - class → function. `useSelector`로 `movies` 상태를 읽고, `useEffect`에서 `dispatch(loadMovies())`.
  - 렌더 분기: error → `<div className="error">` 메시지 "영화 목록을 불러오지 못했습니다.", isLoading → 기존 로더, 그 외 → 기존 목록.
  - `index.js`에서 `Provider`로 `App` 감싸기.
  - `eslint-disable-line` 제거.
- **Constraints:**
  - `Home.css` 클래스명은 바꾸지 않는다.
  - axios를 직접 import하지 않는다 (T1 모듈 사용).
- **Ownership:** 위 두 파일만.
- **Observable acceptance:** T5의 App 테스트에서 `fetchMovies` 모킹으로 목록 카드 렌더링과 에러 메시지 렌더링을 확인한다.

### T4 — Detail 변환

- **Target:** `src/routes/Detail.js`, 상세 CSS가 있으면 같은 파일
- **Change:**
  - class → function. `useLocation`, `useHistory`(react-router-dom 5.1.2에서 제공).
  - state 없으면 `useEffect`에서 `history.replace("/")`, 렌더는 `null`.
  - 장르 `<li key={index}>`.
  - `console.log` 삭제.
  - styled 블록과 JSX의 클래스명 정정 (`movie__detail`, `movie__summary`, `movie__genres`).
  - `trailer`가 있으면 YouTube 링크 `<a className="movie__trailer">`, 없으면 렌더 안 함.
- **Constraints:**
  - 레이아웃 수치(`width`, `margin` 등)는 바꾸지 않는다. 이름만 정정한다.
  - 해시 라우팅 전제 유지.
- **Ownership:** 위 파일만.
- **Observable acceptance:** T5의 `Detail.test.js`가 MemoryRouter로 state 렌더, trailer 링크 `href`, state 없을 때 `/` 리다이렉트를 검증한다.

### T5 — 테스트

- **Target:** `src/App.test.js`, `src/routes/Detail.test.js`, `src/store/moviesSlice.test.js`
- **Change:**
  - `App.test.js`: CRA 기본 테스트 삭제. `jest.mock("../api/movies")` 같은 경로로 `fetchMovies` 모킹. `createAppStore()`를 Provider에 넣어 목록 렌더, 에러 메시지, 해시 `#/movie-detail` 직접 접근 시 `#/`로 리다이렉트를 검증.
  - `Detail.test.js`: MemoryRouter + Route로 state 렌더와 trailer 링크 검증.
  - `moviesSlice.test.js`: reducer에 액션 객체를 직접 넣어 상태 전이 검증.
- **Constraints:**
  - 테스트에서 실제 네트워크를 호출하지 않는다.
  - `axios`를 import하는 모듈을 테스트에서 실제로 로드하지 않도록 `api/movies`를 모킹한다. Jest 23(react-scripts 2.x)은 axios 1.x의 ESM 진입점을 파싱하지 못할 수 있다.
  - 실행: `CI=true npm test -- --watchAll=false`.
- **Ownership:** 위 세 파일만.
- **Observable acceptance:** `npm test` 전체 통과.

### T6 — 라우트 404와 통합 검증

- **Target:** `src/App.js`
- **Change:** `Switch`와 fallback `Route`로 알 수 없는 경로에 "페이지를 찾을 수 없습니다." 와 `/` 링크 표시 (P2-2). 기존 라우트 경로는 그대로 둔다.
- **Constraints:** `HashRouter` 유지. `BrowserRouter`로 바꾸지 않는다.
- **Ownership:** `src/App.js`만.
- **Observable acceptance:** `npm run build` 성공. T5에 404 케이스 추가 여부는 T6 담당이 판단하되, 추가하면 `App.test.js`를 함께 수정해야 하므로 소유권을 T5에 넘긴다.

### T7 — 문서

- **Target:** `CLAUDE.md`, `README.md`
- **Change:**
  - `CLAUDE.md`: 구조(`api/`, `store/`), 상태 관리 방식, 테스트 명령, 알려진 문제 목록 갱신. 해결된 항목은 제거.
  - `README.md`: 파일 트리와 "React5" 표기 정정 (P2-4).
- **Constraints:** 사실만 쓴다. 실행하지 않은 명령을 검증된 것처럼 쓰지 않는다.
- **Ownership:** 위 두 파일만.
- **Observable acceptance:** 파일 트리가 `git ls-files` 결과와 일치한다.

## 8. Orca 오케스트레이션 실행 계획

이 절은 실행 시점의 절차다. 설계 단계에서는 실행하지 않는다.

### 8.1 Run과 worker 구성

- Run: `run-create --objective "react_movie v0.1: function 전환, Redux store, P0/P1 수정"`
- 같은 작업 트리에서 파일 소유권이 겹치지 않으므로 `--worktree current`를 사용한다. 파일 충돌이 없는 wave에서만 병렬 실행한다.
- Agent 배정은 미정이다. 사용자가 정한다. 설계상 권장: T1·T4는 같은 agent, T3·T5는 별도 agent.

### 8.2 Wave 실행 순서

```
ORCA status --json
ORCA orchestration run-create --objective "<objective>" --json
ORCA orchestration worker-start --spec "<T1 명세>" --worktree current --agent <agent> --json
ORCA orchestration worker-start --spec "<T2 명세>" --worktree current --agent <agent> --json
ORCA orchestration worker-start --spec "<T4 명세>" --worktree current --agent <agent> --json
ORCA orchestration check --wait --types "worker_done,escalation,question" --timeout-ms 900000 --json
```

- 각 `worker_done`은 기대한 Dispatch와 대조한다. 실패 보고(`--outcome failed`)는 재시도 전에 원인을 읽는다.
- 질문(`question`)은 `reply --id <message_id>`로 답한다. 소유권과 무관한 질문은 Run 목적에 맞게 답한다.
- 정산된 worker는 `worker-release --dispatch <dispatch_id>`로 정리한다. 다음 Task가 같은 agent로 이어지면 재사용한다.
- Wave 1 전체가 `worker_done`으로 정산되면 Wave 2(T3)를 `worker-start`한다. 그 전에 `worker-list --run <run_id> --terminal-state reclaimable`이 비어 있는지 확인한다.
- 3회 연속 빈 wait 후에는 `worker-list --include-remote --json`으로 열거한다. `liveness`가 `unverifiable`이면 중지·포기 판단을 하지 않고 대기를 계속한다.

### 8.3 실패 처리 원칙

- `worker-start`가 non-zero로 끝나면 재실행하지 않는다. receipt의 `failedStage`와 `residualResources`를 읽고 `references/recovery-and-cleanup.md`를 따른다.
- 빌드 실패 시 해당 Task만 재시도한다. 다른 Wave는 유지한다.

## 9. 검증 계획

| 단계 | 명령 | 통과 기준 |
| --- | --- | --- |
| 의존성 | `npm ls @reduxjs/toolkit react-redux prop-types` | 세 패키지 모두 직접 의존성으로 표시 |
| 빌드 | `npm run build` | 성공, 신규 경고 없음 |
| 테스트 | `CI=true npm test -- --watchAll=false` | 전체 통과 |
| 수동 | `npm start` | 아래 체크리스트 |

수동 체크리스트:

1. Home에서 목록이 평점순으로 나온다 (P0-1).
2. devtools offline에서 에러 메시지가 보인다 (P0-2).
3. 카드 클릭 시 상세 페이지가 나오고 콘솔 에러가 없다 (P0-3, P1-2, P1-3).
4. `#/movie-detail` 직접 접근 시 `#/`로 간다 (P0-4).
5. 상세 레이아웃이 수정 전과 같다 (P1-4, P1-5).
6. 알 수 없는 경로에서 404 메시지가 보인다 (P2-2).

## 10. 위험 요소

| 위험 | 영향 | 대응 |
| --- | --- | --- |
| react-scripts 2.x(webpack 4)가 RTK 2.x, react-redux 9.x의 현대 번들 형식을 처리하지 못할 수 있음 | 빌드 실패 | T1 완료 직후 `npm run build`로 확인. 실패 시 원인 패키지 버전 조정은 사용자와 상의. |
| Jest 23에서 axios 1.x ESM 로드 실패 | 테스트 실패 | `api/movies` 모킹으로 axios를 로드하지 않음 (T5 Constraints) |
| `useHistory` 등 hook API 가용성 | 런타임 오류 | react-router-dom 5.1.2 확인 완료 (hooks 지원). 변경 없음. |
| 같은 작업 트리에서 병렬 worker 충돌 | 파일 덮어쓰기 | 소유권 표(5절)와 Wave 구성으로 방지 |
| 현재 커밋 안 된 `package.json` 변경 | 다른 작업자와 충돌 | Wave 1 시작 전 사용자가 의존성 변경을 확인하고 커밋 여부를 결정 |

## 11. v0.2 TS 전환을 위한 고려사항 (v0.1에서 할 일 아님)

- 파일 확장자는 v0.1에서 `.js` 유지. v0.2에서 `.ts`/`.tsx`로 일괄 변경.
- store 타입은 v0.2에서 `RootState`, `AppDispatch`를 `configureStore` 결과에서 추론한다. v0.1 구조가 이를 막지 않도록 `createAppStore()` 팩토리 패턴을 유지한다.
- `api/movies.js`의 YTS 응답 타입은 v0.2에서 interface로 정의한다. v0.1에서는 주석이나 타입을 넣지 않는다.

## 12. 미결정 사항 (사용자 확인 필요)

1. Agent 배정: `codex` / `claude` 중 태스크별 배정.
2. 커밋 시점: v0.1 전체 완료 후 한 번에 커밋할지, Wave 단위로 나눌지.
3. P2 항목 처리 범위: P2-4(README)를 이번 v0.1에 포함할지.
4. YTS 정렬 파라미터명(`sort_by=rating`)은 YTS 공식 문서 확인 후 확정.
