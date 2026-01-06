import { createSlice } from "@reduxjs/toolkit";
import {
  fetchStudents,
  addStudent,
  deleteStudent,
  updateStudentStatus,
} from "./studentsThunks";

const studentsSlice = createSlice({
  name: "students",
  initialState: {
    list: [],
    fetching: false,
    loading: false,
    message: null,
    error: null,
  },
  reducers: {
    clearMessage: (state) => {
      state.message = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudents.pending, (state) => {
        state.fetching = true;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.fetching = false;
        state.list = action.payload;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.fetching = false;
        state.error = action.payload;
      })

      .addCase(addStudent.pending, (state) => {
        state.loading = true;
      })
      .addCase(addStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload;
      })
      .addCase(addStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.message = action.payload;
      })

      .addCase(deleteStudent.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(updateStudentStatus.fulfilled, (state, action) => {
        state.message = action.payload;
      })

      .addCase(updateStudentStatus.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearMessage } = studentsSlice.actions;
export default studentsSlice.reducer;
