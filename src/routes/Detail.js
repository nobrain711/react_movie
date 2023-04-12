import React from "react";
import styled from "styled-components";

const BG = styled.div`
  width: 100%;
  height: 100vh;
  margin: auto;
  position: relative;
  .poster {
    position: absolute;
    margin-top: 2.5%;
    margin-left: 7%;
    width: 30%;
    height: 90%;
  }
  .moive__detail {
    position: absolute;
    margin-left: 40%;
    margin-top: 2.5%;
    width: 55%;
    height: auto;
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.6);
    .movie__title {
      text-align: center;
      color: white;
      font-size: 30px;
      font-weight: bold;
      font-style: italic;
      margin-top: 10px;
    }
    .movie__year,
    .movie__geners {
      color: #bebebe;
      text-align: right;
      margin-right: 7.5%;
      font-size: 25px;
    }
    .movie__geners {
      margin-top: 0px;
      list-style: none;
    }
    .movie__geners li {
      float: right;
      font-size: 25px;
      color: #bebebe;
      margin-left: 15px;
      margin-top: 0px;
    }
    .moive__summary {
      margin: 40px 10px 10px 10px;
      color: #aaaaaa;
      font-size: 30px;
    }
  }
`;

class Detail extends React.Component {
  componentDidMount() {
    const { location, history } = this.props;

    if (location.state === undefined) {
      history.push("/");
    }
  }
  render() {
    const { location } = this.props;
    if (location.state) {
      console.log(location.state);
      return (
        <BG
          className="movie_detail"
          style={{
            backgroundImage: `url(${location.state.background})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
          }}
        >
          <img
            className="poster"
            src={location.state.poster}
            alt={location.state.title}
            title={location.state.title}
          />
          <div className="moive__detail">
            <div className="movie__title">{location.state.title}</div>
            <div className="movie__year">{location.state.year}</div>
            <ul className="movie__geners">
              {location.state.genres.map((i) => (
                <li>{i}</li>
              ))}
            </ul>
            <div className="moive__summary">
              {location.state.summary.slice(0, 420)}
            </div>
            <div className="movie__tailer"></div>
          </div>
        </BG>
      );
    } else {
      return null;
    }
  }
}
export default Detail;
