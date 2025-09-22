import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState as IRootState } from "@/store";

export interface IContact {
  _id: string;
  name: string;
  email: string;
  phone: string; // required in backend
  subject: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

interface ContactResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: IContact | IContact[];
}

export const contactApi = createApi({
  reducerPath: "contact",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8080/v1/api",
  }),
  tagTypes: ["contact"],
  endpoints: (builder) => ({
    createContact: builder.mutation<IContact, Partial<IContact>>({
      query: (body) => ({
        url: "contracts", // fix typo
        method: "POST",
        body, // RTK Query auto stringifies JSON
        headers: {
          "Content-Type": "application/json",
        },
      }),
      transformResponse: (response: ContactResponse) =>
        response.data as IContact,
    }),
  }),
});

export const { useCreateContactMutation } = contactApi;
