import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState as IRootState } from "@/store";

const baseUrl = "/api";

export interface IAddress {
  _id?: string;
  userId?: string;
  fullName: string;
  phone: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  addressType: "home" | "work" | "other";
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message?: string;
  data?: T;
}

const normalizeToArray = <T>(payload: T | T[] | undefined): T[] => {
  if (!payload) return [];
  return Array.isArray(payload) ? payload : [payload];
};

export const addressApi = createApi({
  reducerPath: "addressApi",
  baseQuery: fetchBaseQuery({
    credentials: "include",
    baseUrl: `${baseUrl}`,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as IRootState;
      // Prefer Redux token, but fall back to localStorage so first request after refresh is authenticated
      const stateToken = (state as any)?.auth?.token as string | undefined;
      const lsToken = typeof window !== 'undefined' ? (localStorage.getItem('authToken') || undefined) : undefined;
      const token = stateToken || lsToken;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Addresses"],
  endpoints: (builder) => ({
    // Get all addresses for logged-in user
    getMyAddresses: builder.query<IAddress[], void>({
      query: () => "/addresses",
      transformResponse: (response: ApiResponse<IAddress | IAddress[]>) =>
        normalizeToArray(response?.data),
      providesTags: (result) =>
        result && result.length
          ? [
              { type: "Addresses" as const, id: "LIST" },
              ...result.map((r) => ({
                type: "Addresses" as const,
                id: r._id ?? "UNKNOWN",
              })),
            ]
          : [{ type: "Addresses" as const, id: "LIST" }],
    }),

    // Get single address by ID
    getAddressById: builder.query<IAddress | undefined, string>({
      query: (id) => `/addresses/${encodeURIComponent(id)}`,
      transformResponse: (response: ApiResponse<IAddress | IAddress[]>) => {
        const arr = normalizeToArray(response?.data);
        return arr.length ? arr[0] : undefined;
      },
      providesTags: (_result, _error, id) => [{ type: "Addresses", id }],
    }),

    // Create new address
    createAddress: builder.mutation<IAddress, Partial<IAddress>>({
      query: (data) => ({
        url: "/addresses",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<IAddress>) =>
        response?.data as IAddress,
      invalidatesTags: [{ type: "Addresses", id: "LIST" }],
    }),

    // Update address
    updateAddress: builder.mutation<
      IAddress,
      { id: string; data: Partial<IAddress> }
    >({
      query: ({ id, data }) => ({
        url: `/addresses/${encodeURIComponent(id)}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiResponse<IAddress>) =>
        response?.data as IAddress,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Addresses", id },
        { type: "Addresses", id: "LIST" },
      ],
    }),

    // Delete address
    deleteAddress: builder.mutation<void, string>({
      query: (id) => ({
        url: `/addresses/${encodeURIComponent(id)}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Addresses", id },
        { type: "Addresses", id: "LIST" },
      ],
    }),

    // Set address as default
    setDefaultAddress: builder.mutation<IAddress, string>({
      query: (id) => ({
        url: `/addresses/${encodeURIComponent(id)}/set-default`,
        method: "PATCH",
      }),
      transformResponse: (response: ApiResponse<IAddress>) =>
        response?.data as IAddress,
      invalidatesTags: [{ type: "Addresses", id: "LIST" }],
    }),
  }),
});

export const {
  useGetMyAddressesQuery,
  useGetAddressByIdQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
} = addressApi;

export default addressApi;
