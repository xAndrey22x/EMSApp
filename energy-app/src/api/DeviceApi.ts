import { DeviceDto } from "../utils/dtos/deviceDto/DeviceDto";
import { deviceApiSlice } from "./slices/DeviceApiSlice";

export const deviceApi = deviceApiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getDevices: builder.query<DeviceDto[], void>({
            query: () => ({
                url: '/devices',
                method: 'GET',
            }),
            providesTags: ['Devices'],
        }),
        addDevice: builder.mutation<DeviceDto, DeviceDto>({
            query: (device) => ({
                url: '/devices',
                method: 'POST',
                body: device,
            }),
            invalidatesTags: ['Devices'],
        }),
        updateDevice: builder.mutation<DeviceDto, {id: number; updatedDevice: DeviceDto}>({
            query: ({id, updatedDevice}) => ({
                url: `/devices/${id}`,
                method: 'PUT',
                body: updatedDevice,
            }),
            invalidatesTags: ['Devices'],
        }),
        deleteDevice: builder.mutation<void, number>({
            query: (id) => ({
                url:`/devices/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Devices'],
        }),
        assignDevice: builder.mutation<DeviceDto, {deviceId: number, userId: number}>({
            query: ({deviceId, userId}) => ({
                url: `/devices/assign/${deviceId}/${userId}`,
                method: 'PUT',
            }),
            invalidatesTags: ['Devices'],
        }),
        unAssignDevice: builder.mutation<DeviceDto, number>({
            query: (deviceId) => ({
                url: `/devices/unassign/${deviceId}`,
                method: 'PUT',
            }),
            invalidatesTags: ['Devices'],
        }),
    }),
});

export const {
    useGetDevicesQuery,
    useAddDeviceMutation,
    useUpdateDeviceMutation,
    useDeleteDeviceMutation,
    useAssignDeviceMutation,
    useUnAssignDeviceMutation,
} = deviceApi;