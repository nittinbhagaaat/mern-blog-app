/* eslint-disable no-unused-vars */
import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "userSlice",
  initialState: JSON.parse(localStorage.getItem("user")) || { token: null },
  reducers: {
    login(state, action) {
      // state.name = action.payload.name;
      // state.email = action.payload.email;
      // state.token = action.payload.token;
      console.log(action.payload);
      localStorage.setItem("user", JSON.stringify(action.payload));
      return action.payload;
    },
    logout(state, action) {
      localStorage.removeItem("user");
      return {
        token: null
      }
    },
  },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
