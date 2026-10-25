import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Detail from "./Detail";

const movieState = {
  year: 2020,
  title: "Movie One",
  summary: "summary",
  poster: "poster.jpg",
  genres: ["Drama", "Action"],
  background: "background.jpg",
  trailer: "trailer",
};

const renderDetail = (entry) =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/" element={<div>home page</div>} />
        <Route path="/movie-detail" element={<Detail />} />
      </Routes>
    </MemoryRouter>
  );

test("renders the movie title when location state is present", () => {
  renderDetail({ pathname: "/movie-detail", state: movieState });
  expect(screen.getByText("Movie One")).toBeInTheDocument();
});

test("redirects to / when location state is missing", () => {
  renderDetail("/movie-detail");
  expect(screen.getByText("home page")).toBeInTheDocument();
});

test("renders a trailer link when trailer code is present", () => {
  renderDetail({ pathname: "/movie-detail", state: movieState });
  const link = screen.getByRole("link", { name: "예고편 보기" });
  expect(link).toHaveAttribute(
    "href",
    "https://www.youtube.com/watch?v=trailer"
  );
});

test("renders no trailer link when trailer code is missing", () => {
  const { trailer, ...noTrailer } = movieState;
  renderDetail({ pathname: "/movie-detail", state: noTrailer });
  expect(screen.queryByRole("link", { name: "예고편 보기" })).toBeNull();
});
