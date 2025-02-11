import { UserDto } from "../utils/dtos/userDto/UserDto";
import { UserInfoDto } from "../utils/dtos/userDto/UserInfoDto";
import { userApiSlice } from "./slices/UserApiSlice";

export const userApi = userApiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getUsers: builder.query<UserInfoDto[], void>({
            query: () => ({
                url: '/users',
                method: 'GET',
            }),
            providesTags: ['Users'],
        }),
        getUsersUsers: builder.query<UserInfoDto[], void>({
            query: () => ({
                url: '/users/users/all',
                method: 'GET',
            }),
            providesTags: ['Users'],
        }),
        getUsersAdmins: builder.query<UserInfoDto[], void>({
            query: () => ({
                url: '/users/admins/all',
                method: 'GET',
            }),
            providesTags: ['Users'],
        }),
        addUser: builder.mutation<UserInfoDto, UserDto>({
            query: (newUser) => ({
                url: '/users',
                method: 'POST',
                body: newUser,
            }),
            invalidatesTags: ['Users'],
        }),
        
        updateUser: builder.mutation<UserInfoDto, { id: number; updatedUser: UserDto }>({
            query: ({ id, updatedUser }) => ({
                url: `/users/${id}`,
                method: 'PUT',
                body: updatedUser,
            }),
            invalidatesTags: ['Users'],

        }),
        deleteUser: builder.mutation<void, number>({
            query: (id) => ({
                url: `/users/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Users'],

        }),
    }),
});

export const { useGetUsersQuery, useGetUsersUsersQuery, useGetUsersAdminsQuery, useAddUserMutation, useUpdateUserMutation, useDeleteUserMutation } = userApi;