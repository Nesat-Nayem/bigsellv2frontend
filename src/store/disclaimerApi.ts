import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState as IRootState } from "@/store";

export interface IDisclaimer {
  _id: string;
  content: string;
  updatedAt: string;
}

interface DisclaimerResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: IDisclaimer;
}

export const DisclaimerResponseApi = createApi({
  reducerPath: "DisclaimerResponseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8080/v1/api",
  }),
  tagTypes: ["DisclaimerResponse"],
  endpoints: (builder) => ({
    // get
    getDisclaimer: builder.query<IDisclaimer, void>({
      query: () => "/disclaimer",
      transformResponse: (response: DisclaimerResponse) => response.data,
      providesTags: ["DisclaimerResponse"],
    }),
  }),
});

export const { useGetDisclaimerQuery } = DisclaimerResponseApi;
