import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./api";

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
      query: (body) => ({
        url: `/mo-detail/${body.id}`,
        method: "PATCH",
        body: body,
      }),
    }),
    deleteMoDetail: builder.mutation({
      query: (id: number) => ({
        url: `/mo-detail/${id}`,
        method: "DELETE",
      }),
    }),
    addMoDetail: builder.mutation({
      query: (data) => ({
        url: "/mo-detail",
        method: "POST",
        body: data,
      }),
    }),
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
