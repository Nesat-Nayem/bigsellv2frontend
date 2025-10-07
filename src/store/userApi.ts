import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState as IRootState } from "@/store";

const baseUrl = "/api";

export interface IUser {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  img?: string;
  role?: "admin" | "vendor" | "user";
  status?: "active" | "pending";
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message?: string;
  data?: T;
  token?: string;
}

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    credentials: "include",
    baseUrl: `${baseUrl}`,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as IRootState;
      const token = (state as any)?.auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Profile"],
  endpoints: (builder) => ({
    // Get current user profile
    getMyProfile: builder.query<IUser, void>({
      query: () => "/auth/profile",
      transformResponse: (response: ApiResponse<IUser>) =>
        response?.data as IUser,
      providesTags: [{ type: "Profile", id: "CURRENT" }],
    }),

    // Update current user profile
    updateMyProfile: builder.mutation<
      { user: IUser; token?: string },
      Partial<IUser>
    >({
      query: (data) => ({
        url: "/auth/profile",
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiResponse<IUser>) => ({
        user: response?.data as IUser,
        token: response?.token,
      }),
      invalidatesTags: [{ type: "Profile", id: "CURRENT" }],
    }),

    // Change password
    changePassword: builder.mutation<
      void,
      { currentPassword: string; newPassword: string }
    >({
      query: (data) => ({
        url: "/auth/change-password",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse) => undefined,
    }),
  }),
});

export const {
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
  useChangePasswordMutation,
} = userApi;

export default userApi;
