import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./api";

export const final = createApi({
  reducerPath: "final",
  baseQuery: baseQueryWithReauth,

  endpoints: (builder) => ({
    getFinal:builder.query({
    query: (params?: { page?: number; limit?: number; search?: string }) => {
      const queryString = new URLSearchParams();

      if (params?.page !== undefined) {
        queryString.append('page', String(params.page));
      }

      if (params?.limit !== undefined) {
        queryString.append('limit', String(params.limit));
      }

      if (params?.search !== undefined && params.search.trim() !== "") {
        queryString.append('search', params.search.trim());
      }

      return {
        url: `/final-page${queryString.toString() ? `?${queryString}` : ''}`,
        method: "GET",
      };
    },
  }),
  postFinal:builder.mutation({
    query: (data) => ({
      url: `/final-page`,
      method: "POST",
      body: data,
    }),
  }),

  updateFinalPage :builder.mutation({
    query: (body) => ({
      url: `/final-page/${body.id}`,
      method: "PUT",
      body: body,
    }),
  }),
  
  deleteFinalPage :builder.mutation({
    query: (id) => ({
      url: `/final-page/${id}`,
      method: "DELETE",
    }),
  }),

  
  }),


  
}); 

export const {
   useGetFinalQuery,
   usePostFinalMutation,
   useUpdateFinalPageMutation,
   useDeleteFinalPageMutation
    } = final;
  export default final