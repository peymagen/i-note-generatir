import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./api";

export const vendorDetail = createApi({
  reducerPath: "vendorDetailApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Vendor'],

  endpoints: (builder) => ({

    getAllVendor: builder.query({
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
        url: `/vendor-detail${queryString.toString() ? `?${queryString}` : ''}`,
        method: "GET",
      };
    },
  }),

   getByVendorCode: builder.query({  
      query: (vendorCode: string) => ({
        url: `/vendor-detail/vendorCode/${vendorCode}`,
        method: "GET"
      })
    }),

    updateVendor: builder.mutation({
      query: (payload) => ({
        url: `/vendor-detail/${payload.Id}`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ['Vendor'],
    }),

    deleteVendor: builder.mutation({
      query: (id: number) => ({
        url: `/vendor-detail/${id}`,
        method: "DELETE",
      }),
    }),

    addVendor:builder.mutation({
      query: (data) => ({
        url: "/vendor-detail/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['Vendor'],
    })
  }),
});



export const {
  useGetAllVendorQuery,
  useLazyGetByVendorCodeQuery,
  useUpdateVendorMutation,
  useDeleteVendorMutation,
  useAddVendorMutation,
} = vendorDetail;

export default vendorDetail;
