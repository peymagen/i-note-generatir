import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./api";
import type{FormData} from "../../pages/MoDetail/Mo";

type addMoDetailType = Omit<FormData, "id">

export const moDetailApi = createApi({
  reducerPath: "moDetailApi",
  baseQuery: baseQueryWithReauth,

  endpoints: (builder) => ({

    // GET ALL
    getAllMoDetail: builder.query({
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
        url: `/mo-detail${queryString.toString() ? `?${queryString}` : ''}`,
        method: "GET",
      };
    },
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
      query: ({ id, data }: { id: number; data: FormData }) => ({
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
      query: (data: addMoDetailType) => ({
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
