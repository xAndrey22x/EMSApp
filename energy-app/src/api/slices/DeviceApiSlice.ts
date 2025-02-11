import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const deviceApiSlice = createApi({
  reducerPath: 'deviceApi',
  baseQuery: async(args, api, extraOptions) => {
  const baseQuery = fetchBaseQuery({ baseUrl: process.env.REACT_APP_DEVICE_API_URL || 'http://localhost:8081/energydevice',
    prepareHeaders: (headers, { getState }) => {
      const user = localStorage.getItem("user");
      const token = user ? JSON.parse(user).token : null;

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    }
   });

   const result = await baseQuery(args, api, extraOptions);

   if(result.error && result.error?.status === 403) {
     localStorage.removeItem("user");
     window.location.href = "/login";
   }

   return result;
  },
  tagTypes: ['Devices'],
  endpoints: () => ({}),
});