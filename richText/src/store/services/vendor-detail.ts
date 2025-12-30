import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./api";

export const vendorDetail = createApi({
  reducerPath: "vendorDetailApi",
  baseQuery: baseQueryWithReauth,

  endpoints: (builder) => ({

    getAllVendor: builder.query({
      query: () => ({
        url: "/vendor-detail",
        method: "GET",
      }),
    }),

   getByVendorCode: builder.query({  
      query: (vendorCode: string) => ({
        url: `/vendor-detail/vendorCode/${vendorCode}`,
        method: "GET"
      })
    }),

    updateVendor: builder.mutation({
      query: ({ id, data }: { id: number; data: any }) => ({
        url: `/vendor-detail/${id}`,
        method: "PUT",
        body: data,
      }),
    }),

    deleteVendor: builder.mutation({
      query: (id: number) => ({
        url: `/vendor-detail/${id}`,
        method: "DELETE",
      }),
    }),

    addVendor:builder.mutation({
      query: (data: any) => ({
        url: "/vendor-detail/create",
        method: "POST",
        body: data,
      }),
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
