import React from "react";
import styled from "styled-components";

const Div = styled.div`
  width: 100%;
  height: 100vh;
  margin: auto;
  position: relative;
  .movie {
    position: absolute;
    width: 60%;
    height: auto%;
    border-radius: 10px;
    top: 46%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.6);
    h1 {
      padding-bottom: 20px;
      font-size: 40px;
      font-weight: bold;
      color: white;
    }
    h2 {
      font-size: 30px;
      padding-bottom: 10px;
      color: lightpink;
    }
    h3 {
      font-size: 30px;
      color: gray;
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
        <Div
          className="movie_detail"
          style={{
            backgroundImage: `url(${location.state.background})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
          }}
        >
          <div className="movie">
            <h1>{location.state.title}</h1>
            <h2>
              {location.state.year} {location.state.genres.map((i) => i)}
            </h2>
            <h3>{location.state.summary.slice(0, 400)}</h3>
          </div>
        </Div>
      );
    } else {
      return null;
    }
  }
}
export default Detail;
