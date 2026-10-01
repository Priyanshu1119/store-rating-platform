import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { loginRequest, signupRequest } from '../../services/authApi';
import { clearSession, loadSession, saveSession } from '../../utils/storage';
import { getErrorPayload } from '../../utils/format';

const session = loadSession();

const initialState = {
  token: session.token,
  user: session.user,
  loading: false,
  error: null,
  fieldErrors: {},
};

const authThunk = (type, request) =>
  createAsyncThunk(type, async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await request(credentials);
      saveSession(data.token, data.user);
      return data;
    } catch (err) {
      return rejectWithValue(getErrorPayload(err));
    }
  });

export const login = authThunk('auth/login', loginRequest);
export const signup = authThunk('auth/signup', signupRequest);

export const logoutUser = () => (dispatch) => {
  clearSession();
  dispatch(authSlice.actions.logout());
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      state.error = null;
      state.fieldErrors = {};
    },
    clearAuthError(state) {
      state.error = null;
      state.fieldErrors = {};
    },
  },
  extraReducers: (builder) => {
    [login, signup].forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state) => {
          state.loading = true;
          state.error = null;
          state.fieldErrors = {};
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.loading = false;
          state.token = action.payload.token;
          state.user = action.payload.user;
        })
        .addCase(thunk.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload ? action.payload.message : action.error.message;
          state.fieldErrors = action.payload ? action.payload.errors : {};
        });
    });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
