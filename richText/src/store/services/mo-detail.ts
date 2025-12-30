import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./api";

export const moDetailApi = createApi({
  reducerPath: "moDetailApi",
  baseQuery: baseQueryWithReauth,

  endpoints: (builder) => ({

    // GET ALL
    getAllMoDetail: builder.query({
      query: () => ({
        url: "/mo-detail",
        method: "GET",
      }),
    }),
    getDatabyCon:builder.query({
      query:(code:string)=>({
          url:`mo-detail/code/${code}`,
          method:"GET",
      }),
    }),

    // GET BY ID
    getMoDetailById: builder.query({
      query: (id: string) => ({
        url: `/mo-detail/${id}`,
        method: "GET",
      }),
    }),

    // IMPORT EXCEL
    importMoDetail: builder.mutation({
      query: (file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        return {
          url: "/mo-detail/import",
          method: "POST",
          body: formData,
        };
      },
    }),

    // UPDATE BY ID
    updateMoDetail: builder.mutation({
      query: ({ id, data }: { id: number; data: any }) => ({
        url: `/mo-detail/${id}`,
        method: "PATCH",
        body: data,
      }),
    }),
    deleteMoDetail: builder.mutation({
      query: (id: number) => ({
        url: `/mo-detail/${id}`,
        method: "DELETE",
      }),
    }),
    addMoDetail: builder.mutation({
      query: (data: any) => ({
        url: "/mo-detail",
        method: "POST",
        body: data,
      }),
    }),
    // getIndentDate: builder.mutation({
    //   query: ({ IndentNo, OrderDate }) => ({
    //     url: `/mo-detail/search?IndentNo=${IndentNo}&OrderDate=${OrderDate}`,
    //     method: "GET",
    //   }),
    // })

    
  }),
});

export const {
  useGetAllMoDetailQuery,
  useGetMoDetailByIdQuery,
  useImportMoDetailMutation,
  useUpdateMoDetailMutation,
  useAddMoDetailMutation,
  useDeleteMoDetailMutation,
  useLazyGetDatabyConQuery,
  } = moDetailApi;

export default moDetailApi;
