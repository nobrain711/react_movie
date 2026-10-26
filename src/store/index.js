import { configureStore } from "@reduxjs/toolkit";
import moviesReducer from "./moviesSlice";

export function createAppStore() {
  return configureStore({
    reducer: {
      movies: moviesReducer,
    },
  });
}

const store = createAppStore();

export default store;
