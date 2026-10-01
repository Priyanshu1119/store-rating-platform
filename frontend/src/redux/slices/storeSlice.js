import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getStores } from '../../services/storeApi';
import { getAdminStores } from '../../services/adminApi';
import { createRating, updateRating } from '../../services/ratingApi';
import { getErrorPayload } from '../../utils/format';

const emptyList = () => ({
  items: [],
  pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
  loading: false,
  error: null,
  requestId: null,
});

const listThunk = (type, request) =>
  createAsyncThunk(type, async (params, { rejectWithValue }) => {
    try {
      const { data } = await request(params);
      return data;
    } catch (err) {
      return rejectWithValue(getErrorPayload(err));
    }
  });

export const fetchStores = listThunk('stores/fetchStores', getStores);
export const fetchAdminStores = listThunk('stores/fetchAdminStores', getAdminStores);

// Creates the rating the first time and edits it afterwards. Returns the refreshed store row.
export const saveRating = createAsyncThunk(
  'stores/saveRating',
  async ({ storeId, rating, isEdit }, { rejectWithValue }) => {
    try {
      const { data } = await (isEdit ? updateRating(storeId, rating) : createRating(storeId, rating));
      return data.data;
    } catch (err) {
      return rejectWithValue(getErrorPayload(err));
    }
  }
);

// Each list ignores responses from older requests, so fast typing cannot show stale results.
const attachList = (builder, thunk, key) => {
  builder
    .addCase(thunk.pending, (state, action) => {
      state[key].loading = true;
      state[key].error = null;
      state[key].requestId = action.meta.requestId;
    })
    .addCase(thunk.fulfilled, (state, action) => {
      if (state[key].requestId !== action.meta.requestId) return;
      state[key].loading = false;
      state[key].items = action.payload.data;
      state[key].pagination = action.payload.pagination;
    })
    .addCase(thunk.rejected, (state, action) => {
      if (state[key].requestId !== action.meta.requestId) return;
      state[key].loading = false;
      state[key].error = action.payload ? action.payload.message : action.error.message;
    });
};

const storeSlice = createSlice({
  name: 'stores',
  initialState: { userList: emptyList(), adminList: emptyList(), saving: false },
  reducers: {},
  extraReducers: (builder) => {
    attachList(builder, fetchStores, 'userList');
    attachList(builder, fetchAdminStores, 'adminList');
    builder
      .addCase(saveRating.pending, (state) => {
        state.saving = true;
      })
      .addCase(saveRating.fulfilled, (state, action) => {
        state.saving = false;
        const index = state.userList.items.findIndex((store) => store.id === action.payload.id);
        if (index !== -1) state.userList.items[index] = action.payload;
      })
      .addCase(saveRating.rejected, (state) => {
        state.saving = false;
      });
  },
});

export default storeSlice.reducer;
