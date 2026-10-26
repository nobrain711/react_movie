import axios from "axios";

const MOVIES_URL = "https://movies-api.accel.li/api/v2/list_movies.json?sort_by=rating";

export async function fetchMovies() {
  const {
    data: {
      data: { movies },
    },
  } = await axios.get(MOVIES_URL);
  return movies;
}
