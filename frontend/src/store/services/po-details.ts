import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./api";

export const poDetailApi = createApi({
  reducerPath: "poDetailApi",
  baseQuery: baseQueryWithReauth,

  endpoints: (builder) => ({

    // GET ALL
    getAllPOData: builder.query({
      query: () => ({
        url: "/po-detail",
        method: "GET",
      }),
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
      query: ({ id, data }: { id: number; data: any }) => ({
        url: `/po-detail/${id}`,
        method: "PATCH",
        body: data,
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
      query: (data: any) => ({
        url: "/po-detail",
        method: "POST",
        body: data,
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
