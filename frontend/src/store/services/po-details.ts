import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./api";

export const poDetailApi = createApi({
  reducerPath: "poDetailApi",
  baseQuery: baseQueryWithReauth,

  endpoints: (builder) => ({

    // GET ALL
   

    getAllPOData: builder.query({
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
        url: `/po-detail${queryString.toString() ? `?${queryString}` : ''}`,
        method: "GET",
      };
    },
  }),

    // GET BY ID
    getPODataById: builder.query({
      query: (id: string) => ({
        url: `/po-detail/${id}`,
        method: "GET",
      }),
    }),

    // IMPORT EXCEL
    importPOData: builder.mutation({
      query: (file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        return {
          url: "/po-detail/import",
          method: "POST",
          body: formData,
        };
      },
    }),

    // UPDATE BY ID
    updatePOData: builder.mutation({
      query: (body) => ({
        url: `/po-detail/${body.id}`,
        method: "PATCH",
        body: body,
      }),
    }),
    deletePoDetail: builder.mutation({
      query: (id: number) => ({
        url: `/po-detail/${id}`,
        method: "DELETE",
      }),
    }),
        
    getByIndent: builder.query({ 
      query: (indentNo: string) => ({
        url: `/po-detail/getByIndent/${indentNo}`,
        method: "GET",
      }),
    }),

    addPoDetail:builder.mutation({
      query: (body) => ({
        url: "/po-detail",
        method: "POST",
        body: body,
      }),
    })
  }),
});

export const {
  useGetAllPODataQuery,
  useGetPODataByIdQuery,
  useImportPODataMutation,
  useUpdatePODataMutation,
  useAddPoDetailMutation,
  useDeletePoDetailMutation,
  useLazyGetByIndentQuery,
} = poDetailApi;

export default poDetailApi;
