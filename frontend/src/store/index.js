import { configureStore } from "@reduxjs/toolkit";
import studentsReducer from "./students/studentsSlice";

export const store = configureStore({
  reducer: {
    students: studentsReducer,
  },
});
