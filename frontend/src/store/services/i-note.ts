import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./api";

export const iNote = createApi({
  reducerPath: "iNote",
  baseQuery: baseQueryWithReauth,

  endpoints: (builder) => ({
    getInote:builder.query({
      query: () => ({ url: "/inote", method: "GET" }),
    })
  })    
});

export const { useGetInoteQuery } = iNote;