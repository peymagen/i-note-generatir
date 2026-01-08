import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./api";

export const itemDetail = createApi({
  reducerPath: "itemDetailApi",
  baseQuery: baseQueryWithReauth,

  endpoints: (builder) => ({

    // ------------------------------
    // GET ALL ITEM DETAILS
    // ------------------------------
   getAllItemDetails: builder.query({
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
        url: `/item-detail${queryString.toString() ? `?${queryString}` : ''}`,
        method: "GET",
      };
    },
  }),



    // ------------------------------
    // GET ITEM DETAIL BY ID
    // ------------------------------
    getItemDetailById: builder.query({
      query: (id: string) => ({
        url: `/item-detail/${id}`,
        method: "GET",
      }),
    }),

    // ------------------------------
    // IMPORT ITEM DETAILS (EXCEL)
    // ------------------------------
    importItemDetails: builder.mutation({
      query: (file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        return {
          url: "/item-detail/import",
          method: "POST",
          body: formData,
        };
      },
    }),

    // ------------------------------
    // UPDATE ITEM DETAIL BY ID
    // ------------------------------
    updateItemDetail: builder.mutation({
      query: (body) => ({
        url: `/item-detail/${body.id}`,
        method: "PATCH",
        body: body,
      }),
    }),

    // ------------------------------
    // DELETE ITEM DETAIL BY ID
    // ------------------------------
    deleteItemDetail: builder.mutation({
      query: (id: number) => ({
        url: `/item-detail/${id}`,
        method: "DELETE",
      }),
    }),

    addItemDetail:builder.mutation({
      query: (data) => ({
        url: "/item-detail",
        method: "POST",
        body: data,
      }),
    })
  }),
});



export const {
  useGetAllItemDetailsQuery,
  useGetItemDetailByIdQuery,
  useImportItemDetailsMutation,
  useUpdateItemDetailMutation,
  useDeleteItemDetailMutation,
  useAddItemDetailMutation,
} = itemDetail;

export default itemDetail;
