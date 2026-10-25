import React, { useEffect } from "react";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";

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
  .movie__detail {
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
    .movie__genres {
      color: #bebebe;
      text-align: right;
      margin-right: 7.5%;
      font-size: 25px;
    }
    .movie__genres {
      margin-top: 0px;
      list-style: none;
    }
    .movie__genres li {
      float: right;
      font-size: 25px;
      color: #bebebe;
      margin-left: 15px;
      margin-top: 0px;
    }
    .movie__summary {
      margin: 40px 10px 10px 10px;
      color: #aaaaaa;
      font-size: 30px;
    }
    .movie__trailer {
      color: #bebebe;
    }
  }
`;

function Detail() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!location.state) {
      navigate("/", { replace: true });
    }
  }, [location.state, navigate]);

  if (location.state) {
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
        <div className="movie__detail">
          <div className="movie__title">{location.state.title}</div>
          <div className="movie__year">{location.state.year}</div>
          <ul className="movie__genres">
            {location.state.genres.map((i, index) => (
              <li key={index}>{i}</li>
            ))}
          </ul>
          <div className="movie__summary">
            {location.state.summary.slice(0, 420)}
          </div>
          {location.state.trailer && (
            <a
              className="movie__trailer"
              href={`https://www.youtube.com/watch?v=${location.state.trailer}`}
              target="_blank"
              rel="noreferrer"
            >
              예고편 보기
            </a>
          )}
        </div>
      </BG>
    );
  } else {
    return null;
  }
}

export default Detail;
