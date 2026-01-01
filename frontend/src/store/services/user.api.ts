import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./api";
import { setTokens } from "../reducers/authReducers";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({

     getUser: builder.query({
      query: () => ({ url: "/users", method: "GET" }),
    }),

    loginUser: builder.mutation({
      query: (body) => ({
        url: "users/login",
        method: "POST",
        body,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.accessToken && data?.refreshToken) {
            localStorage.setItem('accessToken', data.accessToken);
            console.log("accessToken", data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            console.log("refreshToken", data.refreshToken);
            localStorage.setItem('user', JSON.stringify(data.user));
            console.log("user", data.user);
            
            // Update Redux state
            dispatch(setTokens({
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              user: data.user
            }));
          }
        } catch (error) {
          console.error('Login failed:', error);
        }
      },
    }),
    

    registerUser: builder.mutation({
      query: (body) => ({ url: "/users/createUser", method: "POST", body }),
    }),

    changePassword: builder.mutation({
      query: (payload: { id: number; currentPassword: string; newPassword: string }) => ({
        url: `/users/change-password/${payload.id}`,
        method: "PUT",
        body: {
          currentPassword: payload.currentPassword,
          newPassword: payload.newPassword,
          confirmPassword: payload.newPassword, 
        },
      }),
    }),

    toggleUserStatus: builder.mutation({
      query: (id: string) => ({
        url: `/users/${id}`,
        method: "PATCH",
      }),
    }),


    deleteUser: builder.mutation({
      query: (id: string) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});


export const {
  useGetUserQuery,
  useRegisterUserMutation,
  useLoginUserMutation,
  useChangePasswordMutation,
  useToggleUserStatusMutation,
  useDeleteUserMutation,
} = userApi;

export default userApi;
