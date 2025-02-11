import { DeviceDtoForList } from "../utils/dtos/deviceDto/DeviceDtoForList";
import { UserRefDto } from "../utils/dtos/deviceDto/UserRefDto";
import { deviceApiSlice } from "./slices/DeviceApiSlice";

export const UserRefApi = deviceApiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getUserRefs: builder.query<UserRefDto[], void>({
            query: () => ({
                url: '/userRef',
                method: 'GET',
            }),
        }),
        getUserDevices: builder.query<DeviceDtoForList[], number>({
            query: (userId:number) => ({
                url: `/userRef/${userId}`,
                method: 'GET',
            }),
        }),
    })
});

export const { useGetUserRefsQuery, useGetUserDevicesQuery } = UserRefApi;