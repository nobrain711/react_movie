# CLAUDE.md

이 파일은 Claude Code가 이 저장소에서 작업할 때 참고하는 가이드다.

## 프로젝트 개요

- 영화 정보 웹사이트 (React 클래식 클래스 컴포넌트 + react-router v5 기반)
- 영화 목록 데이터는 YTS API(`https://yts.mx/api/v2/list_movies.json`)에서 가져온다.
- GitHub Pages로 배포한다: https://nobrain711.github.io/react_movie/#/
- 2학년 1학기 프론트엔드 프레임워크 수업 과제를 기반으로 한다 (노마드 코더 강의 참고).

## 명령어

- `npm start` : 개발 서버 실행 (`react-scripts --openssl-legacy-provider start`)
- `npm run build` : 프로덕션 빌드 (`build/` 생성)
- `npm test` : Jest 테스트 실행 (react-scripts test)
- `npm run deploy` : `build/`를 gh-pages 브랜치로 배포 (`predeploy`에서 자동 빌드)

`--openssl-legacy-provider`는 react-scripts 2.x가 최신 Node(17+)에서 동작하도록 하는 옵션이므로 제거하지 않는다.

## 구조

```
src/
  index.js            # ReactDOM.createRoot로 App 렌더링, reportWebVitals 호출
  App.js              # HashRouter + 라우트 정의
  routes/
    Home.js           # "/" : 영화 목록 (class 컴포넌트, componentDidMount에서 API 호출)
    About.js          # "/about" : 정적 페이지
    Detail.js         # "/movie-detail" : 선택한 영화 상세 (location.state로 데이터 수신)
  components/
    Movie.js          # 목록의 영화 카드 (Link로 /movie-detail 이동, state에 영화 데이터 전달)
    Navigation.js     # 상단 내비게이션 (Home, about)
  *.css               # 컴포넌트/라우트별 CSS, Detail은 styled-components 사용
```

## 동작 원리 / 주의점

- 라우터는 `HashRouter`를 사용한다. GitHub Pages 배포 경로 때문에 `BrowserRouter`로 바꾸지 않는다.
- 상세 페이지(`/movie-detail`)는 `Link`의 `state`로만 데이터를 받는다. 직접 URL로 접근하면 `Detail`이 `/`로 리다이렉트한다.
- `Movie`에 전달되는 props 중 `id`는 propTypes에 없다. `background`, `trailer`는 Home이 넘기지만 Movie 카드에서는 사용하지 않는다.
- `Movie.js`는 `prop-types`를 import하지만 `package.json`에 직접 선언되어 있지 않다 (react-scripts 의존성으로 설치됨).

## 알려진 문제 (수정 전 참고)

- `Home.js`의 API URL이 `list_movies.json&order_by=rating`으로 되어 있다. 쿼리 구분자가 `?`여야 하므로 `order_by` 파라미터가 적용되지 않는다.
- `src/App.test.js`는 CRA 기본 템플릿 테스트("learn react" 텍스트 검색)가 그대로라 현재 실패한다.
- `Detail.js`의 `.map()` 내부 `<li>`에 `key`가 없다.
- CSS 클래스명 `moive__detail`, `moive__summary`, `movie__tailer` 등에 오타가 있다. 스타일과 함께 맞춰 수정해야 한다.

## 작업 규칙

- 코드 주석과 UI 문구는 기존처럼 한국어/영어를 섞어 쓰는 현재 스타일을 따른다.
- 새 라이브러리를 추가하기 전에 이미 있는 의존성(axios, styled-components, react-router-dom)으로 해결 가능한지 먼저 확인한다.
- 클래스 컴포넌트(`Home`, `Detail`)는 함수 컴포넌트로 바꾸지 않는다. 범위 밖의 리팩터링은 하지 않는다.
