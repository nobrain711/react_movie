# react_movie v0.1 요구사항

- 작성일: 2026-10-22
- 갱신: 2026-10-25 (선행 요구사항 V 그룹 추가)
- 기준: `main` @ 10b5117
- 범위: `src/`, 테스트 설정, 의존성 선언의 현재 문제를 우선순위별로 수정한다.

## 우선순위 정의

- **P0**: 사용자에게 보이는 동작이 깨졌거나 테스트/빌드가 실패하는 문제. 가장 먼저 처리한다.
- **P1**: 동작은 하지만 정확성, 유지보수성, 콘솔 청결도에 영향을 주는 문제.
- **P2**: 구조 및 문서 개선.

같은 우선순위 안에서는 권장 처리 순서대로 나열했다.

## 범위 제외

- 시각 디자인 전면 개편.
- 클래스 컴포넌트(`Home`, `Detail`)의 함수 컴포넌트 전환.
- `react-router-dom`(v5) 등 주요 의존성의 메이저 업그레이드. 별도로 추적한다.
- 단, `react-scripts`(2.x)는 React 19 적용에 필요하므로 V-4에서 예외로 올린다.

## 선행 요구사항: 런타임 및 React 버전 (V 그룹)

P0보다 먼저 처리한다. 버전 값은 2026-10-25 기준이며, 작업 시작 시점에 다시 확인해 확정 버전을 이 문서에 기록한다.

| ID | 대상 | 요구사항 | 완료 조건 |
| --- | --- | --- | --- |
| V-1 | Node.js | 현재 LTS 버전으로 올린다. 2026-10-25 기준 Node 24는 Active LTS 종료 단계이고, Node 26이 2026-10-28에 Active LTS로 전환될 예정이다. 작업 시점에 https://nodejs.org/about/releases 에서 최신 LTS를 확인하고 확정 버전을 기록한다. `package.json`의 `engines.node`에 최소 버전을 명시하고, 로컬 Node 버전도 맞춘다. | `node -v`가 확정한 LTS 메이저와 일치한다. `engines.node`가 명시되어 있다. `npm install`, `npm test`, `npm run build`가 성공한다. |
| V-2 | React | 최신 안정 버전인 React 19.x(2026-10-25 기준 19.3.1)로 올린다. `react`와 `react-dom`을 같은 버전으로 맞춘다. React에는 공식 LTS 개념이 없으므로 "LTS"는 최신 안정(stable) 메이저로 해석한다. | `npm ls react react-dom`이 19.x로 표시된다. 콘솔에 React 경고가 없다. |
| V-3 | React 연동 패키지 | React 19와 peer dependency가 맞도록 올린다. 대상: `@testing-library/react`(13.x는 React 18 전용이므로 16.x 이상), `react-redux`, `react-router-dom`(v5), `styled-components`(v5), `@testing-library/jest-dom`, `@testing-library/user-event`. 호환이 안 되는 패키지는 이 문서에 사유와 대안을 기록한다. | `npm install`에서 peer dependency 오류(ERESOLVE)가 없다. 테스트에서 React 관련 경고가 없다. |
| V-4 | react-scripts | React 19 빌드를 위해 react-scripts를 5.x 이상으로 올린다(2026-10-25 기준 npm latest 5.0.1). react-scripts 5.x는 webpack 5 기반이라 `--openssl-legacy-provider`가 불필요할 수 있다. 제거 가능 여부를 확인하고 결과를 기록한다. | `npm start`, `npm run build`, `npm test`가 성공한다. `--openssl-legacy-provider` 유지 또는 제거 결정이 참고 항목에 기록되어 있다. |
| V-5 | 레거시 모듈 | 버전을 올리는 과정에서 각 의존성의 사용처를 `src/`와 설정 파일에서 확인한다. 사용처가 없고 빌드·테스트 도구도 필요로 하지 않으면 바로 제거한다(`npm uninstall`). 사용처가 있으면 유지 사유 또는 대체 방법을 이 문서에 기록한다. 대상 예: `web-vitals`, `@testing-library/user-event` 13.x, `gh-pages`(호스팅 전환 전까지 유지). | 제거한 패키지와 유지한 패키지의 사유가 기록되어 있다. `npm ls`에 사용되지 않는 직접 의존성이 없다. 빌드와 테스트가 통과한다. |

## P0 요구사항

| ID | 문제 | 위치 | 요구사항 | 완료 조건 |
| --- | --- | --- | --- | --- |
| P0-1 | API URL이 `list_movies.json&order_by=rating`으로 되어 있다. `&`는 `?`여야 하며, `order_by`는 YTS의 정렬 파라미터가 아니다. | `src/routes/Home.js` `getMovies` | URL을 `https://yts.mx/api/v2/list_movies.json?sort_by=rating`으로 수정한다. 파라미터명은 YTS 공식 API 문서로 먼저 확인한다. | 네트워크 탭의 요청 URL이 수정된 값과 일치하고, 목록이 평점순으로 표시된다. |
| P0-2 | API 호출이 실패하면 `isLoading`이 `true`로 남아 로더가 사라지지 않는다. `getMovies`에 에러 처리가 없다. | `src/routes/Home.js` `getMovies` | try/catch로 감싼다. 실패 시 에러 상태를 설정하고 "영화 목록을 불러오지 못했습니다." 같은 메시지를 표시한다. | API를 차단한 상태에서 로더가 멈추고 에러 메시지가 보인다. |
| P0-3 | 상세 페이지 장르 목록의 `<li>`에 `key`가 없다. | `src/routes/Detail.js` `render` | `genres.map`에 `key`를 추가한다. 장르 문자열이 중복될 수 있으면 index를 사용한다. | 상세 페이지에서 브라우저 콘솔에 React key 경고가 없다. |
| P0-4 | `src/App.test.js`가 CRA 기본 템플릿("learn react" 검색)이라 항상 실패한다. | `src/App.test.js` | 실제 동작을 검증하는 테스트로 교체한다. Navigation 렌더링, Home에서 `axios`를 모킹한 뒤 카드 렌더링, state 없이 `/movie-detail` 접근 시 `/`로 리다이렉트를 검증한다. | `npm test`가 전부 통과한다. |

## P1 요구사항

| ID | 문제 | 위치 | 요구사항 | 완료 조건 |
| --- | --- | --- | --- | --- |
| P1-1 | `Movie.js`가 `prop-types`를 import하지만 `package.json`에 선언되어 있지 않다. | `src/components/Movie.js`, `package.json` | `prop-types`를 `dependencies`에 명시적으로 추가한다. | `npm ls prop-types`에서 직접 의존성으로 표시된다. |
| P1-2 | `Movie.propTypes`가 실제 전달되는 props와 맞지 않는다. `id`는 선언되어 있지 않고, `background`와 `trailer`는 필수로 선언되어 있지만 카드에서 쓰이지 않는다. | `src/components/Movie.js`, `src/routes/Home.js` | propTypes를 실제 사용하는 props에 맞춘다. 사용하지 않는 props는 카드에서 제거하거나 선택 항목으로 바꾼다. | 콘솔에 propTypes 경고가 없다. |
| P1-3 | 상세 페이지에 디버그용 `console.log(location.state)`가 남아 있다. | `src/routes/Detail.js` `render` | 삭제한다. | 상세 페이지에서 콘솔 출력이 없다. |
| P1-4 | CSS 클래스명에 오타가 있고 JS 쪽 이름과 맞지 않는다. `moive__detail`, `moive__summary`, `movie__geners`(vs `genres`), `movie__tailer`. | `src/routes/Detail.js` styled-components, `src/components/Movie.css` | styled 블록과 마크업 양쪽의 이름을 바르게 고친다. 레이아웃은 그대로 유지한다. | 상세 페이지 레이아웃이 수정 전과 동일하다(시각 확인). |
| P1-5 | `movie__tailer` div가 비어 있고, `trailer` 데이터는 사용되지 않는다. | `src/routes/Detail.js` | `trailer`로 YouTube 링크(`https://www.youtube.com/watch?v=<code>`)를 렌더링하거나 빈 div를 제거한다. 둘 중 하나를 골라 문서에 기록한다. | 빈 placeholder div가 남지 않거나, 트레일러 링크가 올바른 영상을 연다. |

## P2 요구사항

| ID | 문제 | 위치 | 요구사항 | 완료 조건 |
| --- | --- | --- | --- | --- |
| P2-1 | API 호출이 컴포넌트 안에 있다. | `src/routes/Home.js` | YTS 요청을 `src/api/movies.js` 모듈로 옮기고 URL을 한 곳에서 관리한다. | Home은 API 모듈만 호출하고, 동작은 변하지 않는다. |
| P2-2 | 404 라우트가 없어 알 수 없는 경로에서는 내비게이션만 보인다. | `src/App.js` | "페이지를 찾을 수 없습니다" 메시지와 `/` 링크를 보여주는 fallback 라우트를 추가한다. | 알 수 없는 해시 경로에서 메시지가 표시된다. |
| P2-3 | `Movie.js`의 `Link`에 불필요한 `{" "}`가 있다. Home에 불필요한 `eslint-disable-line no-unused-vars`가 있다. 주석에 오타가 있다("정류"는 줄거리를 뜻함). | `src/components/Movie.js`, `src/routes/Home.js` | 불필요한 텍스트와 disable 주석을 제거하고 주석 오타를 고친다. | `npm run build`에서 새 lint 경고가 없다. |
| P2-4 | `README.md`의 파일 구성이 현재 저장소와 맞지 않는다. React 버전 표기(React5)도 부정확하다. | `README.md` | 파일 트리와 프레임워크 버전 표기를 현재 저장소에 맞게 갱신한다. | README 내용이 저장소와 일치한다. |

## 검증 체크리스트

우선순위 그룹을 끝낼 때마다 실행한다.

0. V 그룹 완료: `node -v`, `npm ls react react-dom` 버전 확인 (V-1, V-2). `npm install`에 peer 오류 없음 (V-3).
1. `npm test` 통과 (P0-4).
2. `npm run build` 성공, 새 경고 없음.
3. `npm start` 후 수동 확인:
   - Home에서 목록이 평점순으로 로드된다 (P0-1).
   - API를 차단(devtools offline)하면 에러 메시지가 보인다 (P0-2).
   - 영화를 클릭하면 상세 페이지가 렌더링되고 콘솔 에러가 없다 (P0-3, P1-2, P1-3).
   - `#/movie-detail`을 직접 열면 `#/`로 리다이렉트된다 (P0-4).
   - 상세 레이아웃이 이전 화면과 같다 (P1-4, P1-5).

## 참고

- 앱은 `HashRouter`를 사용한다. GitHub Pages 배포가 해시 라우팅에 의존하므로 `BrowserRouter`로 바꾸지 않는다.
- 호스팅 결정(2026-10-25): v0.1은 GitHub Pages를 유지한다. Vercel 전환(`vercel.json` rewrite, `homepage` 정리, `BrowserRouter` 검토)은 v0.2 또는 v0.3에서 진행한다.
- V-4 결과(2026-10-25): react-scripts 5.0.1과 Node 26.12.1에서 `--openssl-legacy-provider` 없이 `npm run build`가 성공했다. `start`, `build` 스크립트에서 옵션을 제거했다.
- V-5 결과(2026-10-25): `@testing-library/user-event`는 `src/`에서 사용하지 않아 제거했다. `web-vitals`는 `src/reportWebVitals.js`에서 사용하므로 유지한다. `gh-pages`는 `deploy` 스크립트에서 사용하므로 호스팅 전환 전까지 유지한다.
- V-3 결과(2026-10-25): `react-router-dom`을 `^6.30.6`으로 올렸다. v5의 `mini-create-react-context`가 React 19 peer를 선언하지 않아 `npm ls`가 `ELSPROBLEMS`를 보고하던 문제가 해결되었다. 코드 변경: `App.js`의 `Route component` → `Routes` + `element`, `Detail.js`의 class → 함수 컴포넌트(`useLocation`, `useNavigate`). `npm ls`에 오류 없음, `npm run build` 성공.
- `@babel/core`는 `overrides`로 `^7.28.0`에 고정했다. react-scripts 5.0.1이 고정한 7.20.12가 최신 babel 플러그인과 맞지 않아 테스트 실행이 실패했기 때문이다.
