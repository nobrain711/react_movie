import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchMovies } from "../api/movies";

export const loadMovies = createAsyncThunk("movies/load", () => fetchMovies());

const initialState = {
  items: [],
  isLoading: true,
  error: null,
};

const moviesSlice = createSlice({
  name: "movies",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadMovies.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadMovies.fulfilled, (state, action) => {
        state.items = action.payload;
        state.isLoading = false;
      })
      .addCase(loadMovies.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export default moviesSlice.reducer;
