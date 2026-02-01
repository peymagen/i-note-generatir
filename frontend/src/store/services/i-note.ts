import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./api";

export const iNote = createApi({
  reducerPath: "iNote",
  baseQuery: baseQueryWithReauth,

  endpoints: (builder) => ({
    getInote:builder.query({
      query: () => ({ url: "/inote", method: "GET" }),
    }),
    getLastInote:builder.query({
      query: () => ({ url: "/inote/current", method: "GET" }),
    }),
    creteUpdateInote:builder.mutation({
      query: (data) => ({
        url: `/inote?id=${data.id}`,
        method: "POST",
        body: data,
      }),
    }),
  }) 

});

export const { 
  useGetInoteQuery,
  useGetLastInoteQuery,
  useCreteUpdateInoteMutation } = iNote;