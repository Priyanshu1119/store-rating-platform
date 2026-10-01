import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getUsers } from '../../services/adminApi';
import { getErrorPayload } from '../../utils/format';

export const fetchUsers = createAsyncThunk('users/fetchUsers', async (params, { rejectWithValue }) => {
  try {
    const { data } = await getUsers(params);
    return data;
  } catch (err) {
    return rejectWithValue(getErrorPayload(err));
  }
});

const userSlice = createSlice({
  name: 'users',
  initialState: {
    items: [],
    pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    loading: false,
    error: null,
    requestId: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.requestId = action.meta.requestId;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.loading = false;
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.loading = false;
        state.error = action.payload ? action.payload.message : action.error.message;
      });
  },
});

export default userSlice.reducer;
