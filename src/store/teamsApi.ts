import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface ITeam {
  _id: string;
  name: string;
  designation: string;
  image: string;
  createdAt: string;
  updatedAt: string;
  status?: "Active" | "Inactive";
}

interface TeamsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: ITeam[];
}

interface TeamResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: ITeam;
}

export const teamsApi = createApi({
  reducerPath: "teamsApi",
  baseQuery: fetchBaseQuery({
    credentials: "include",
    baseUrl: "http://localhost:8080/v1/api",
  }),
  tagTypes: ["teams"],
  endpoints: (builder) => ({
    getTeams: builder.query<ITeam[], void>({
      query: () => "/teams",
      transformResponse: (response: TeamsResponse) => response.data,
      providesTags: ["teams"],
    }),
    getTeamById: builder.query<ITeam, string>({
      query: (id) => `/teams/${id}`,
      transformResponse: (response: TeamResponse) => response.data,
      providesTags: ["teams"],
    }),
  }),
});

export const { useGetTeamsQuery, useGetTeamByIdQuery } = teamsApi;
