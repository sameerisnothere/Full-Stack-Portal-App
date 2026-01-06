import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axiosInstance";

const extractError = (err, fallback) =>
  err.response?.data?.error || err.response?.data?.message || fallback;

export const fetchStudents = createAsyncThunk(
  "students/fetch",
  async ({ token }, { rejectWithValue }) => {
    try {
      const res = await api.get("/read/api/get-data?tableName=student", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data || [];
    } catch (err) {
      return rejectWithValue(extractError(err, "Failed to fetch students"));
    }
  }
);

export const addStudent = createAsyncThunk(
  "students/add",
  async ({ token, user, payload }, { dispatch, rejectWithValue }) => {
    try {
      await api.post(
        "/create/api/insert",
        { payload },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-user": JSON.stringify(user),
          },
        }
      );

      dispatch(fetchStudents({ token }));
      return "Student added successfully";
    } catch (err) {
      return rejectWithValue(extractError(err, "Insert failed"));
    }
  }
);

export const deleteStudent = createAsyncThunk(
  "students/delete",
  async ({ id, token, user }, { dispatch, rejectWithValue }) => {
    try {
      await api.delete(`/delete/api/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-user": JSON.stringify(user),
        },
        data: { type: "student" },
      });

      dispatch(fetchStudents({ token }));
      return "Student successfully deleted and set to inactive!";
    } catch (err) {
      return rejectWithValue(extractError(err, "Delete failed"));
    }
  }
);

export const updateStudentStatus = createAsyncThunk(
  "students/status",
  async ({ student, token, user }, { dispatch, rejectWithValue }) => {
    if (student.isDeleted) {
      return rejectWithValue("Cannot change status of deleted student");
    }
    try {
      await api.put(
        `/update/api/update-one/${student.id}`,
        {
          type: "student",
          data: {
            status: student.status === "active" ? "inactive" : "active",
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-user": JSON.stringify(user),
          },
        }
      );

      dispatch(fetchStudents({ token }));
      return "Student status successfully changed";
    } catch (err) {
      return rejectWithValue(extractError(err, "Status change failed"));
    }
  }
);
