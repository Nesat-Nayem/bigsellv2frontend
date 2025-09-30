import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface IGeneralSettings {
  _id: string;
  address: string;
  email: string;
  facebook: string;
  favicon: string; // only string URL
  headerTab: string;
  iframe: string;
  instagram: string;
  linkedIn: string;
  logo: string; // only string URL
  number: string;
  twitter: string;
  youtube: string;
  createdAt: string;
  updatedAt: string;
}

interface GeneralSettingsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: IGeneralSettings; // single object
}
export const generalSettingsApi = createApi({
  reducerPath: "generalSettingsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8080/v1/api",
    // prepareHeaders: (headers, { getState }) => {...} // optional auth
  }),
  tagTypes: ["generalSettings"],
  endpoints: (builder) => ({
    getGeneralSettings: builder.query<IGeneralSettings, void>({
      query: () => "/general-settings",
      transformResponse: (response: GeneralSettingsResponse) => response.data,
      providesTags: ["generalSettings"],
    }),
  }),
});

export const { useGetGeneralSettingsQuery } = generalSettingsApi;
