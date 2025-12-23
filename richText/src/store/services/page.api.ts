import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./api";

export const pageApi = createApi({
  reducerPath: "pageApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getPage: builder.query({
      query: () => ({ url: "/pages", method: "GET" }),
    }),

    getPageById: builder.query({
      query: (id: string) => ({ url: `/pages/${id}`, method: "GET" }),
    }),

    createPage: builder.mutation({
      query: (data: { title: string; content: string }) => ({
        url: `/pages/create`,
        method: "POST",
        body: data,
      }),
    }),

    updatePage: builder.mutation({
      query: (payload: { id: string; data: { title?: string; content?: string } }) => ({
        url: `/pages/${payload.id}`,
        method: "PUT",
        body: payload.data,
      }),
    }),
    deletePage:builder.mutation({
      query: (payload: { id: string }) => ({
        url: `/pages/${payload.id}`,
        method: "DELETE",
      }),
    })
  }),
});


export const {
  useGetPageQuery,
  useGetPageByIdQuery,
  useCreatePageMutation,
  useUpdatePageMutation,
  useDeletePageMutation,
} = pageApi;

// These 2 exports keep browser download behavior (they are NOT RTK calls)
// export const exportPdf = (id: string, query = "") => {
//   window.open(`/pages/${id}/export/pdf${query}`, "_blank");
// };

// export const exportDocx = (id: string, query = "") => {
//   window.open(`/pages/${id}/export/docx${query}`, "_blank");
// };

export default pageApi;
