import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authService from '../services/auth';

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await authService.login(credentials);
    return response.user;
  } catch (err) {
    if (err.response?.data?.errors) {
      return rejectWithValue(err.response.data.errors);
    }
    return rejectWithValue(err.response?.data?.msg || err.response?.data?.message || 'Login failed');
  }
});

export const registerUser = createAsyncThunk('auth/register', async (formData, { rejectWithValue }) => {
  try {
    const response = await authService.registerUser(formData);
    return response.user;
  } catch (err) {
    if (err.response?.data?.errors) {
      return rejectWithValue(err.response.data.errors);
    }
    return rejectWithValue(err.response?.data?.msg || err.response?.data?.message || 'Registration failed');
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authService.logout();
  } catch (err) {
    return rejectWithValue(err.response?.data?.msg || 'Logout failed');
  }
});

export const fetchUser = createAsyncThunk('auth/fetchUser', async (_, { rejectWithValue }) => {
  try {
    const response = await authService.fetchCurrentUser();
    return response.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.msg || 'Fetch user failed');
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (formData, { rejectWithValue }) => {
  try {
    const response = await authService.updateProfile(formData);
    return response.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.msg || 'Update failed');
  }
});

export const deleteUser = createAsyncThunk('auth/deleteUser', async (userId, { rejectWithValue }) => {
  try {
    await authService.deleteUser(userId);
    return userId;
  } catch (err) {
    return rejectWithValue(err.response?.data?.msg || 'Delete failed');
  }
});

export const updateUserByAdmin = createAsyncThunk('auth/updateUserByAdmin', async ({ id, formData }, { rejectWithValue }) => {
  try {
    const response = await authService.updateUserByAdmin(id, formData);
    return response.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.msg || 'Update failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    status: 'loading', // Start with loading to check for session
    error: null,
    registerStatus: 'idle',
    registerError: null,
  },
  reducers: {
    resetAuthError: (state) => {
      state.error = null;
    },
    resetRegisterStatus: (state) => {
      state.registerStatus = 'idle';
      state.registerError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.registerStatus = 'loading';
        state.registerError = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.registerStatus = 'succeeded';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.registerStatus = 'failed';
        state.registerError = action.payload;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.status = 'idle';
      })
      // Fetch User
      .addCase(fetchUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(fetchUser.rejected, (state) => {
        state.status = 'idle';
        state.user = null;
      })
      // Update Profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { resetAuthError, resetRegisterStatus } = authSlice.actions;
export default authSlice.reducer;
