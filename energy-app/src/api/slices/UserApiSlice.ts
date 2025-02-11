import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const userApiSlice = createApi({
  reducerPath: 'userApi',
  baseQuery: async (args, api, extraOptions) => {
    const baseQuery = fetchBaseQuery({ 
      baseUrl: process.env.REACT_APP_USER_API_URL || 'http://localhost:8083/energyuser',
      prepareHeaders: (headers, { getState }) => {
        const user = localStorage.getItem("user");
        const token = user ? JSON.parse(user).token : null;

        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }

        return headers;
    },
   });

   const result = await baseQuery(args, api, extraOptions);

   if (result.error && result.error?.status === 403) {
      localStorage.removeItem("user");
      window.location.href = "/login";
   }

   return result;
  },
  tagTypes: ['Users'],
  endpoints: () => ({}),
});
