import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface User {
  id: string;
  email: string;
}

// Define a type for the slice state
interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const getStoredUser = (): User | null => {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Failed to parse user from localStorage", error);
    return null;
  }
};

// Define the initial state using that type
// const initialState: AuthState = {
//   accessToken: localStorage.getItem("accessToken") || "",
//   refreshToken: localStorage.getItem("refreshToken") || "",
//   user: localStorage.getItem("user")
//     ? JSON.parse(localStorage.getItem("user") as string)
//     : null,
//   isAuthenticated: localStorage.getItem("accessToken") ? true : false,
//   loading: false,
//   error: null,
// };



const initialState: AuthState = {
  accessToken: localStorage.getItem("accessToken") || " ",
  refreshToken: localStorage.getItem("refreshToken")|| " ",
  user: getStoredUser(),
  isAuthenticated: !!localStorage.getItem("accessToken"),
  loading: false,
  error: null,
};


// export const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     setLoading: (state, action: PayloadAction<{ loading: boolean }>) => {
//       state.loading = action.payload.loading;
//     },

//     setTokens: (
//       state,
//       action: PayloadAction<{
//         accessToken: string;
//         refreshToken: string;
//         user: User;
//       }>
//     ) => {
//       state.accessToken = action.payload.accessToken;
//       state.refreshToken = action.payload.refreshToken;
//       state.user = action.payload.user;
//       state.isAuthenticated = true;
//       state.loading = false;
//       localStorage.setItem("accessToken", action.payload.accessToken);
//       localStorage.setItem("refreshToken", action.payload.refreshToken);
//       localStorage.setItem("user", JSON.stringify(action.payload.user));
//     },
//     resetTokens: (state) => {
//       state.accessToken = "";
//       state.refreshToken = "";
//       state.user = null;
//       state.isAuthenticated = false;
//       localStorage.setItem("accessToken", "");
//       localStorage.setItem("refreshToken", "");
//       localStorage.setItem("user", "");
//     },
//   },
// });

// export const { setLoading, setTokens, resetTokens } = authSlice.actions;

// export default authSlice.reducer;


export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setTokens: (
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken: string;
        user: User;
      }>
    ) => {
      const { accessToken, refreshToken, user } = action.payload;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.user = user;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;

      try {
        localStorage.setItem("accessToken", accessToken);
        console.log("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        console.log("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));
      } 
      catch (error) {
        console.error("Failed to save auth data to localStorage", error);
      }
    },
    resetTokens: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    },
  },
});

export const { setLoading, setTokens, resetTokens, setError } = authSlice.actions;
export default authSlice.reducer;