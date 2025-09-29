import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState as IRootState } from "@/store";

export interface IFaq {
  _id: string;
  question: string;
  answer: string;
  createdAt: string;
  updatedAt: string;
}

interface FaqResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: IFaq[]; // array of FAQs
}

export const faqApi = createApi({
  reducerPath: "faqApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8080/v1/api",
    // optional: add headers if needed
    // prepareHeaders: (headers, { getState }) => {...}
  }),
  tagTypes: ["faqApi"],
  endpoints: (builder) => ({
    getFaq: builder.query<IFaq[], void>({
      // return array of IFaq
      query: () => "/faqs",
      transformResponse: (response: FaqResponse) => response.data,
      providesTags: ["faqApi"],
    }),
  }),
});

export const { useGetFaqQuery } = faqApi;
