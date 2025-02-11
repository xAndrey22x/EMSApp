import { UserLoginDto } from "../utils/dtos/userDto/UserLoginDto";
import { userApiSlice } from "./slices/UserApiSlice";

export const loginApi = userApiSlice.injectEndpoints({
    endpoints: (builder) => ({
      loginUser: builder.mutation<{token: string}, UserLoginDto>({
        query: (credentials) => ({
          url: '/login',
          method: 'POST',
          body: credentials,
        }),
      }),
    }),
  });
  
  export const { useLoginUserMutation } = loginApi;