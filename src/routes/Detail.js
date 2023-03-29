import React from "react";
import "./Detail.css";

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
        <div
          className="movie_detail"
          style={{
            backgroundImage: `url(${location.state.poster})`,
            backgroundRepeat: `no-repeat`,
            backgroundSize: `cover`,
            backgroundAttachment: `fixed`,
          }}
        >
          <span>{location.state.year}</span>
          <br />
          <span>{location.state.title}</span>
          <br />
          <span>{location.state.summary}</span>
          <br />
          <span>{location.state.poster}</span>
          <br />
          <span>{location.state.genegers}</span>
          <br />
        </div>
      );
    } else {
      return null;
    }
  }
}
export default Detail;
