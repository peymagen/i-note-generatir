import type { BaseQueryApi, FetchArgs } from "@reduxjs/toolkit/query";
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";
import { resetTokens, setTokens } from "../reducers/authReducers";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_BASE_URL
    ? `${import.meta.env.VITE_BASE_URL}api/`
    : "https://note.peymagen.com/ap/api/",
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.accessToken;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseQueryWithReauth = async (
  args: string | FetchArgs,
  api: BaseQueryApi,
  extra: object,
) => {
  const result = await rawBaseQuery(args, api, extra);

  // Handle 401 → logout
  if (
    result.error?.status === 401 &&
    !(typeof args === "string" && args.includes("login"))
  ) {
    api.dispatch(resetTokens());
  }

  // Save refreshed tokens if backend sends new ones
  const data = result.data as {
    accessToken?: string;
    refreshToken?: string;
    user?: {
      id: string;
      email: string;
      [key: string]: unknown;
    };
  };
  if (data?.accessToken && data?.refreshToken) {
    api.dispatch(
      setTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user!,
      }),
    );
  }

  return result;
};

export default baseQueryWithReauth;
