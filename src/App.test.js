import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import axios from "axios";
import App from "./App";
import { createAppStore } from "./store";

const renderApp = () =>
  render(
    <Provider store={createAppStore()}>
      <App />
    </Provider>
  );

jest.mock("axios", () => ({ get: jest.fn() }));

const movies = [
  {
    id: 1,
    title: "Movie One",
    year: 2020,
    summary: "summary",
    poster: "poster.jpg",
    genres: ["Drama"],
    background: "background.jpg",
    trailer: "trailer",
  },
];

beforeEach(() => {
  axios.get.mockResolvedValue({ data: { data: { movies } } });
  window.location.hash = "#/";
});

test("renders navigation links", async () => {
  renderApp();
  expect(screen.getByText("Home")).toBeInTheDocument();
  expect(screen.getByText("about")).toBeInTheDocument();
  await screen.findByText("Movie One");
});

test("renders movie cards from API response", async () => {
  renderApp();
  expect(await screen.findByText("Movie One")).toBeInTheDocument();
  expect(axios.get).toHaveBeenCalledTimes(1);
});

test("shows error message and no cards when API request fails", async () => {
  axios.get.mockRejectedValue(new Error("Network Error"));
  renderApp();
  expect(
    await screen.findByText("영화 목록을 불러오지 못했습니다.")
  ).toBeInTheDocument();
  expect(screen.queryByText("Movie One")).not.toBeInTheDocument();
});

test("redirects /movie-detail without state to /", async () => {
  window.location.hash = "#/movie-detail";
  renderApp();
  expect(await screen.findByText("Movie One")).toBeInTheDocument();
  expect(window.location.hash).toBe("#/");
});
