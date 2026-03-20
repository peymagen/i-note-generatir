import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./api";


export const exportApi = createApi({
  reducerPath: "exportDoc",
  baseQuery: baseQueryWithReauth,

  endpoints: (builder) => ({
    // Query to export HTML to DOCX
    getExport: builder.mutation({
      query: (payload) => ({
        url: "/export/docx",
        method: "POST",
        body: {
          html: payload.html,
          filename: payload.filename || "document.docx",
        },
      }),
      
    }),
  }),
});

export const { useGetExportMutation } = exportApi;
export default exportApi;