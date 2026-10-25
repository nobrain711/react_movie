# react_movie v0.1 태스크 목록

- 작성일: 2026-10-25
- 관련 문서: `docs/v0.1/requirements.md`, `docs/v0.1/design.md`
- 상태 표기: `[ ]` 미완료, `[x]` 완료
- 실행 원칙: Wave 순서대로 진행한다. 같은 Wave 안의 태스크는 파일 소유권이 겹치지 않으므로 병렬 실행할 수 있다.

## Wave 0: 선행 (V 그룹)

### [ ] T0 — Node·React·react-scripts 업그레이드, 레거시 점검

- 요구사항: V-1, V-2, V-3, V-4, V-5
- 대상 파일: `package.json`, `package-lock.json`
- 작업:
  - [ ] `engines.node`를 `>=26.12.1`로 명시한다.
  - [ ] `react`, `react-dom`을 19.x로 올린다.
  - [ ] `react-scripts`를 5.x로 올린다.
  - [ ] `--openssl-legacy-provider` 제거 가능 여부를 확인하고 결과를 `requirements.md` 참고 항목에 기록한다.
  - [ ] `@testing-library/react`를 16.x로 올리고 `@testing-library/dom` peer를 추가한다.
  - [ ] `react-redux`, `react-router-dom`(v5), `styled-components`(v5) 호환을 확인한다.
  - [ ] 레거시 점검(V-5): `web-vitals`, `@testing-library/user-event` 13.x, `gh-pages` 등 사용처를 `src/`와 설정 파일에서 grep한다. 사용처가 없으면 `npm uninstall`로 제거하고, 있으면 유지 사유를 기록한다.
- 완료 조건:
  - [ ] `node -v`가 26.12.1 이상이다.
  - [ ] `npm ls react react-dom`이 19.x이다.
  - [ ] `npm install`에 ERESOLVE 오류가 없다.
  - [ ] `npm run build`, `npm test`가 성공한다(기준선).
  - [ ] 사용하지 않는 직접 의존성이 `npm ls`에 없다.

## Wave 1: 병렬 가능

### [ ] T1 — api 모듈과 store

- 요구사항: P2-1, P0-1, P0-2
- 대상 파일: `src/api/movies.js`, `src/store/index.js`, `src/store/moviesSlice.js`
- 작업:
  - [ ] `fetchMovies()`를 만든다. URL은 `https://yts.mx/api/v2/list_movies.json?sort_by=rating`, 반환값은 `data.data.movies`다.
  - [ ] `loadMovies` thunk(`createAsyncThunk`)와 slice(`items`, `isLoading`, `error`)를 만든다.
  - [ ] `createAppStore()`와 `store`를 export한다.
- 제약: `.js` 유지. reducer는 순수 함수. `axios`는 `api/movies.js`에서만 import한다.
- 완료 조건: 빌드 성공. 상태 전이 검증은 T5에서 한다.

### [ ] T2 — Movie 컴포넌트 정리

- 요구사항: P1-2, P2-3, P1-1
- 대상 파일: `src/components/Movie.js`, `src/components/Movie.css`
- 작업:
  - [ ] `propTypes`를 실제 사용 props에 맞춘다. `id`는 추가하지 않는다.
  - [ ] `Link` 안의 `{" "}`를 제거한다.
  - [ ] JSDoc의 "정류"를 "줄거리"로 고치고 `id` 항목을 삭제한다.
- 제약: 클래스명(`movie__genres`, `movie__genre`)과 레이아웃을 바꾸지 않는다.
- 완료 조건: `Movie.propTypes`가 `Home`이 `Link state`로 넘기는 값과 일치한다(리뷰로 확인). React 19에서는 런타임 경고가 나오지 않으므로 콘솔 검사는 하지 않는다.

### [ ] T4 — Detail 함수 컴포넌트 변환

- 요구사항: P0-3, P1-3, P1-4, P1-5
- 대상 파일: `src/routes/Detail.js`
- 작업:
  - [ ] class를 함수 컴포넌트로 바꾼다. `useLocation`, `useHistory`를 쓴다.
  - [ ] `state`가 없으면 `useEffect`에서 `history.replace("/")`를 호출하고 `null`을 렌더한다.
  - [ ] 장르 `<li>`에 `key={index}`를 추가한다.
  - [ ] `console.log(location.state)`를 삭제한다.
  - [ ] styled 블록과 JSX의 클래스명을 정정한다(`moive__detail`→`movie__detail`, `moive__summary`→`movie__summary`, `movie__geners`→`movie__genres`).
  - [ ] `trailer`가 있으면 `<a className="movie__trailer" href="https://www.youtube.com/watch?v=...">`를 렌더하고, 없으면 렌더하지 않는다. 빈 div는 제거한다.
- 제약: 레이아웃 수치(`width`, `margin` 등)는 바꾸지 않는다. 해시 라우팅을 전제로 한다.
- 완료 조건: 상세 레이아웃이 수정 전과 같다(시각 확인). 콘솔 출력이 없다.

## Wave 2

### [ ] T3 — Home 함수 컴포넌트 변환, Provider 연결

- 요구사항: P0-2, P0-3(목록 key 유지)
- 대상 파일: `src/routes/Home.js`, `src/index.js`
- 작업:
  - [ ] class를 함수 컴포넌트로 바꾼다. `useSelector`로 `movies` 상태를 읽고, `useEffect`에서 `dispatch(loadMovies())`를 호출한다.
  - [ ] 렌더 분기: `error`면 `<div className="error">`에 "영화 목록을 불러오지 못했습니다.", `isLoading`이면 기존 로더, 그 외에는 기존 목록.
  - [ ] `src/index.js`에서 `Provider`로 `App`을 감싼다. `index.js`는 이미 `ReactDOM.createRoot`를 쓰므로 그 부분은 바꾸지 않는다.
  - [ ] `eslint-disable-line no-unused-vars` 주석을 제거한다(P2-3).
- 제약: `Home.css` 클래스명을 바꾸지 않는다. `axios`를 직접 import하지 않는다.
- 완료 조건: T5의 App 테스트에서 목록 카드와 에러 메시지가 렌더된다.

## Wave 3

### [ ] T5 — 테스트

- 요구사항: P0-4
- 대상 파일: `src/App.test.js`, `src/routes/Detail.test.js`, `src/store/moviesSlice.test.js`
- 작업:
  - [ ] `App.test.js`: CRA 기본 테스트를 삭제한다. `api/movies`를 모킹하고 `createAppStore()`를 Provider에 넣는다. 검증 항목: Navigation 렌더, 목록 카드 렌더, 에러 메시지, `#/movie-detail` 직접 접근 시 `#/`로 리다이렉트.
  - [ ] `Detail.test.js`: MemoryRouter와 Route로 `state` 렌더, trailer 링크 `href`, `state` 없을 때 `/` 리다이렉트를 검증한다.
  - [ ] `moviesSlice.test.js`: pending, fulfilled, rejected 전이를 reducer에 액션 객체를 넣어 검증한다.
- 제약: 실제 네트워크를 호출하지 않는다. `api/movies`를 모킹해 axios ESM 로드를 피한다.
- 완료 조건: `CI=true npm test -- --watchAll=false`가 전부 통과한다.

### [ ] T6 — 404 라우트

- 요구사항: P2-2
- 대상 파일: `src/App.js`
- 작업:
  - [ ] `Switch`와 fallback `Route`를 추가해 알 수 없는 경로에 "페이지를 찾을 수 없습니다."와 `/` 링크를 표시한다.
  - [ ] 기존 라우트 경로는 그대로 둔다. `HashRouter`를 유지한다.
- 제약: `BrowserRouter`로 바꾸지 않는다.
- 완료 조건: `npm run build`가 성공한다. 404 테스트를 추가하면 `App.test.js`를 함께 수정하므로, 그 수정은 T5 소유로 넘긴다.

## Wave 4

### [ ] T7 — 문서 갱신

- 요구사항: P2-4
- 대상 파일: `agent.md`, `README.md`
- 작업:
  - [ ] `agent.md`: 구조(`api/`, `store/`), 상태 관리 방식, 테스트 명령, 알려진 문제 목록을 갱신한다. 해결된 항목은 제거한다.
  - [ ] `README.md`: 파일 트리와 "React5" 표기를 정정한다. Node 버전 요구(26.12.1 이상)를 적는다.
- 제약: 실행하지 않은 명령을 검증된 것처럼 쓰지 않는다.
- 완료 조건: 파일 트리가 `git ls-files` 결과와 일치한다.

## 최종 검증

- [ ] `npm run build`: 성공, 새 경고 없음.
- [ ] `CI=true npm test -- --watchAll=false`: 전체 통과.
- [ ] `npm start` 수동 확인:
  - [ ] Home에서 목록이 평점순으로 나온다 (P0-1).
  - [ ] devtools offline에서 에러 메시지가 보인다 (P0-2).
  - [ ] 카드 클릭 시 상세 페이지가 나오고 콘솔 에러가 없다 (P0-3, P1-2, P1-3).
  - [ ] `#/movie-detail` 직접 접근 시 `#/`로 간다 (P0-4).
  - [ ] 상세 레이아웃이 수정 전과 같다 (P1-4, P1-5).
  - [ ] 알 수 없는 경로에서 404 메시지가 보인다 (P2-2).
- [ ] `npm ls`에서 직접 의존성 `prop-types`가 표시된다 (P1-1).
- [ ] `requirements.md`의 V 항목 완료 조건을 모두 충족한다.

## 미결정 사항 (실행 전 사용자 확인)

- [ ] Agent 배정: `codex` / `claude`를 태스크별로 배정한다.
- [ ] 커밋 시점: v0.1 전체 완료 후 한 번에 커밋할지, Wave 단위로 나눌지.
- [ ] React 19에서 react-router-dom 5.1.2 호환이 실패하면 v6 이상 업그레이드를 이번 v0.1에 포함할지.
- [ ] YTS 정렬 파라미터명(`sort_by=rating`)을 YTS 공식 문서로 확인한다.
