# agent.md

이 파일은 Claude Code가 이 저장소에서 작업할 때 참고하는 가이드다.

## 프로젝트 개요

- 영화 정보 웹사이트 (React 19 함수 컴포넌트 + Redux Toolkit + react-router-dom v6 기반)
- 영화 목록 데이터는 YTS API(`https://movies-api.accel.li/api/v2/list_movies.json?sort_by=rating`)에서 가져온다 (`src/api/movies.js`).
- GitHub Pages로 배포한다: https://nobrain711.github.io/react_movie/#/
- 2학년 1학기 프론트엔드 프레임워크 수업 과제를 기반으로 한다 (노마드 코더 강의 참고).

## 명령어

- `npm start` : 개발 서버 실행 (`react-scripts start`)
- `npm run build` : 프로덕션 빌드 (`build/` 생성)
- `CI=true npm test -- --watchAll=false` : Jest 테스트 1회 실행 (`npm test`만 쓰면 watch 모드로 대기한다)
- `npm run deploy` : `build/`를 gh-pages 브랜치로 배포 (`predeploy`에서 자동 빌드)

## 구조

```
src/
  index.js            # ReactDOM.createRoot로 App 렌더링 (Redux Provider로 store 주입), reportWebVitals 호출
  App.js              # HashRouter + 라우트 정의 (path="*"는 404 안내)
  api/
    movies.js         # fetchMovies: YTS API 호출 (axios)
  store/
    index.js          # createAppStore(), 기본 store export
    moviesSlice.js    # loadMovies thunk, 상태 items / isLoading / error
  routes/
    Home.js           # "/" : 영화 목록 (함수 컴포넌트, useSelector로 구독, 마운트 시 loadMovies dispatch)
    About.js          # "/about" : 정적 페이지
    Detail.js         # "/movie-detail" : 선택한 영화 상세 (함수 컴포넌트, location.state로 데이터 수신)
  components/
    Movie.js          # 목록의 영화 카드 (Link로 /movie-detail 이동, state에 영화 데이터 전달)
    Navigation.js     # 상단 내비게이션 (Home, about)
  *.test.js           # Jest 테스트 (App, routes/Detail, store/moviesSlice)
  *.css               # 컴포넌트/라우트별 CSS, Detail은 styled-components 사용
```

## 동작 원리 / 주의점

- 라우터는 `HashRouter`를 사용한다. GitHub Pages 배포 경로 때문에 `BrowserRouter`로 바꾸지 않는다.
- 상세 페이지(`/movie-detail`)는 `Link`의 `state`로만 데이터를 받는다. 직접 URL로 접근하면 `Detail`이 `/`로 리다이렉트한다.
- `Movie`에 전달되는 props 중 `id`는 propTypes에 없다. `background`, `trailer`는 Home이 넘기고 Movie는 카드에 표시하지 않고 Link state에 실어 Detail로 전달한다.

## 알려진 문제

- 코드와 대조한 기준으로 현재 확인된 미해결 문제는 없다.

## 작업 규칙

- 코드 주석과 UI 문구는 기존처럼 한국어/영어를 섞어 쓰는 현재 스타일을 따른다.
- 새 라이브러리를 추가하기 전에 이미 있는 의존성(axios, styled-components, react-router-dom)으로 해결 가능한지 먼저 확인한다.
- `Home`, `Detail` 등 함수 컴포넌트 구조를 유지한다. 범위 밖의 리팩터링은 하지 않는다.
