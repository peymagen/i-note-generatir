import type { BaseQueryApi, FetchArgs } from "@reduxjs/toolkit/query";
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";
import { resetTokens, setTokens } from "../reducers/authReducers";

console.log('Base URL:', import.meta.env.VITE_BASE_URL);


const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_BASE_URL 
    ? `${import.meta.env.VITE_BASE_URL}api/` 
    : 'http://localhost:3000/api/',
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.accessToken;
     console.log('Current token:', token);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseQueryWithReauth = async (
  args: string | FetchArgs,
  api: BaseQueryApi,
  extra: {}
) => {
  console.log("api",api);
  console.log("args",args)
  
  const result = await rawBaseQuery(args, api, extra);
  console.log("re",result)
  // Handle 401 → logout
  if (result.error?.status === 401 && 
      !(typeof args === 'string' && args.includes('login'))) {
    console.log('Session expired, logging out...');
    api.dispatch(resetTokens());
  }

  // Save refreshed tokens if backend sends new ones
  const data: any = result.data;
  if (data?.accessToken && data?.refreshToken) {
    api.dispatch(
      setTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user,
      })
    );
  }

  return result;
};

export default baseQueryWithReauth;
