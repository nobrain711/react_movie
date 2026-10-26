import reducer, { loadMovies } from "./moviesSlice";

const initialState = reducer(undefined, { type: "@@INIT" });

test("initial state is loading with no items and no error", () => {
  expect(initialState).toEqual({ items: [], isLoading: true, error: null });
});

test("pending sets isLoading and clears error", () => {
  const prev = { items: [], isLoading: false, error: "old error" };
  const next = reducer(prev, { type: loadMovies.pending.type });
  expect(next.isLoading).toBe(true);
  expect(next.error).toBeNull();
});

test("fulfilled stores payload as items and stops loading", () => {
  const movies = [{ id: 1, title: "Movie One" }];
  const next = reducer(initialState, {
    type: loadMovies.fulfilled.type,
    payload: movies,
  });
  expect(next.items).toEqual(movies);
  expect(next.isLoading).toBe(false);
});

test("rejected stores error message and stops loading", () => {
  const next = reducer(initialState, {
    type: loadMovies.rejected.type,
    error: { message: "Network Error" },
  });
  expect(next.isLoading).toBe(false);
  expect(next.error).toBe("Network Error");
});
