import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./api";

export const poHeaderApi = createApi({
  reducerPath: "poHeaderApi",
  baseQuery: baseQueryWithReauth,

  endpoints: (builder) => ({

    // GET ALL
    getAllPOHeader: builder.query({
      query: () => ({
        url: "/po-header",
        method: "GET",
      }),
    }),

    // GET BY ID
    getPOHeaderById: builder.query({
      query: (id: string) => ({
        url: `/po-header/${id}`,
        method: "GET",
      }),
    }),

    // IMPORT EXCEL
    importPOHeader: builder.mutation({
      query: (file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        return {
          url: "/po-header/import",
          method: "POST",
          body: formData,
        };
      },
    }),

    // UPDATE BY ID
    updatePOHeader: builder.mutation({
      query: ({ id, data }: { id: number; data: any }) => ({
        url: `/po-header/${id}`,
        method: "PATCH",
        body: data,
      }),
    }),
    deletePoHeader: builder.mutation({
      query: (id: number) => ({
        url: `/po-header/${id}`,
        method: "DELETE",
      }),
    }),
    addPoHeader: builder.mutation({
      query: (data: any) => ({
        url: "/po-header",
        method: "POST",
        body: data,
      }),
    }),
    getIndentDate: builder.query({
      query: ({ IndentNo, OrderDate }) => ({
        url: `/po-header/search?IndentNo=${IndentNo}&OrderDate=${OrderDate}`,
        method: "GET",
      }),
    })

    
  }),
});

export const {
  useGetAllPOHeaderQuery,
  useGetPOHeaderByIdQuery,
  useImportPOHeaderMutation,
  useUpdatePOHeaderMutation,
  useAddPoHeaderMutation,
  useDeletePoHeaderMutation,
  useLazyGetIndentDateQuery,
  } = poHeaderApi;

export default poHeaderApi;
