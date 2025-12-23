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
      query: () => ({
        url: "/item-detail",
        method: "GET",
      }),
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
      query: ({ id, data }: { id: number; data: any }) => ({
        url: `/item-detail/${id}`,
        method: "PATCH",
        body: data,
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
      query: (data: any) => ({
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
