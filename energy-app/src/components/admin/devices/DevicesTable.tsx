import { useEffect, useState } from "react";
import {
  useAddDeviceMutation,
  useAssignDeviceMutation,
  useDeleteDeviceMutation,
  useGetDevicesQuery,
  useUnAssignDeviceMutation,
  useUpdateDeviceMutation,
} from "../../../api/DeviceApi";
import { DeviceDto } from "../../../utils/dtos/deviceDto/DeviceDto";
import { Button, notification, Table } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  PlusOutlined,
  UserDeleteOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { UserRefDto } from "../../../utils/dtos/deviceDto/UserRefDto";
import "../../../styles/Admin.css";
import "../../../styles/Device.css";
import AddDeviceModal from "./AddDeviceModal";
import UpdateDeviceModal from "./UpdateDeviceModal";
import DeleteDeviceModal from "./DeleteDeviceModal";
import { useGetUserRefsQuery } from "../../../api/UserRefApi";
import AssignUserDevice from "./AssignUserDevice";
import UnAssignUserDevice from "./UnAssignUserDevice";

interface DevicesTableProps {
  userChanged: boolean;
  onUserChange: (hasChanged: boolean) => void;
}

export default function DevicesTable({
  userChanged,
  onUserChange,
}: DevicesTableProps) {
  const {
    data: initialDevices,
    isLoading,
    error: getDevicesError,
    refetch: refetchDevices,
  } = useGetDevicesQuery();

  const { data: initialUsers, refetch: refetchUsers } = useGetUserRefsQuery();
  const [users, setUsers] = useState<UserRefDto[]>(initialUsers || []);
  const [devices, setDevices] = useState<DeviceDto[]>(initialDevices || []);
  const [addDevice, { isLoading: isLoadingAdd }] = useAddDeviceMutation();
  const [updateDevice, { isLoading: isLoadingUpdate }] =
    useUpdateDeviceMutation();
  const [deleteDevice, { isLoading: isLoadingDelete }] =
    useDeleteDeviceMutation();
  const [assignDevice, { isLoading: isLoadingAssign }] =
    useAssignDeviceMutation();
  const [unAssignDevice, { isLoading: isLoadingUnAssign }] =
    useUnAssignDeviceMutation();

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [isUnAssignModalVisible, setIsUnAssignModalVisible] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<DeviceDto | null>(null);

  useEffect(() => {
    if (getDevicesError) {
      notification.error({
        message: "Error Fetching Devices",
        description: "Failed to load device data. Please try again later.",
        duration: 3,
      });
    }
  }, [getDevicesError]);

  useEffect(() => {
    if (initialDevices) {
      setDevices(initialDevices);
    }
  }, [initialDevices]);

  useEffect(() => {
    if (initialUsers) {
      setUsers(initialUsers);
    }
  }, [initialUsers]);

  useEffect(() => {
    if (userChanged) {
      refetchUsers();
      refetchDevices();
      onUserChange(false);
    }
  }, [userChanged, refetchUsers, refetchDevices, onUserChange]);

  const handleCreateDevice = async (values: DeviceDto) => {
    try {
      const response = await addDevice(values).unwrap();
      setDevices((prevDevices) => [...prevDevices, response]);
      notification.success({
        message: "Device Created",
        description: `Device with id ${response.id} has been successfully created.`,
        duration: 3,
      });
      setIsAddModalVisible(false);
    } catch (error: any) {
      notification.error({
        message: "Error Creating Device",
        description: error.error,
        duration: 3,
      });
    }
  };

  const handleUpdateDevice = async (values: DeviceDto) => {
    try {
      const response = await updateDevice({
        id: selectedDevice!.id!,
        updatedDevice: values,
      }).unwrap();
      setDevices((prevDevices) =>
        prevDevices.map((device) =>
          device.id === response.id ? response : device
        )
      );
      notification.success({
        message: "Device Updated",
        description: `Device with id ${response.id} has been successfully updated.`,
        duration: 3,
      });
      setIsUpdateModalVisible(false);
    } catch (error: any) {
      notification.error({
        message: "Error Updating Device",
        description: error.error,
        duration: 3,
      });
    }
  };

  const handleDeleteDevice = async () => {
    try {
      await deleteDevice(selectedDevice!.id!).unwrap();
      setDevices((prevDevices) =>
        prevDevices.filter((device) => device.id !== selectedDevice!.id)
      );
      notification.success({
        message: "Device Deleted",
        description: `Device with id ${selectedDevice?.id} has been successfully deleted.`,
        duration: 3,
      });
      setIsDeleteModalVisible(false);
    } catch (error: any) {
      notification.error({
        message: "Error Deleting Device",
        description: error.data || "Could not delete device. Please try again.",
        duration: 3,
      });
    }
  };

  const handleAssignDevice = async (deviceId?: number, userId?: number) => {
    try {
      if (!deviceId || !userId) {
        notification.error({
          message: "Error Assigning Device",
          description: "Could not assign device. Please try again.",
          duration: 3,
        });
        return;
      }
      const response = await assignDevice({ deviceId, userId }).unwrap();
      setDevices((prevDevices) =>
        prevDevices.map((device) =>
          device.id === response.id ? response : device
        )
      );
      notification.success({
        message: "Device Assigned",
        description: `Device with id ${response.id} has been successfully assigned to user ${response.userRef?.userName}.`,
        duration: 3,
      });
      setIsAssignModalVisible(false);
    } catch (error: any) {
      notification.error({
        message: "Error Assigning Device",
        description: error.error,
        duration: 3,
      });
    }
  };

  const handleUnAssignDevice = async (deviceId?: number) => {
    try {
      if (!deviceId) {
        notification.error({
          message: "Error Assigning Device",
          description: "Could not assign device. Please try again.",
          duration: 3,
        });
        return;
      }
      const response = await unAssignDevice(deviceId).unwrap();
      setDevices((prevDevices) =>
        prevDevices.map((device) =>
          device.id === response.id ? response : device
        )
      );
      notification.success({
        message: "Device Unassigned",
        description: `Device with id ${response.id} has been successfully unassigned.`,
        duration: 3,
      });
      setIsUnAssignModalVisible(false);
    } catch (error: any) {
      notification.error({
        message: "Error Unassigning Device",
        description: error.error,
        duration: 3,
      });
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "MHEC",
      dataIndex: "mhec",
      key: "mhec",
    },
    {
      title: "Owned by",
      dataIndex: "userRef",
      key: "userRef",
      render: (userRef: UserRefDto, record: DeviceDto) => (
        <div className="owned-by">
          {userRef ? (
            <>
              <UserOutlined className="owned-by-icon" />
              <span className="owned-by-name">{userRef.userName}</span>
            </>
          ) : (
            <span className="not-owned">Not owned</span>
          )}
          <Button
            type="link"
            icon={userRef ? <UserDeleteOutlined /> : <UserAddOutlined />}
            className="edit-owner-button"
            loading={
              (isLoadingAssign || isLoadingUnAssign) &&
              selectedDevice?.id === record.id
            }
            disabled={
              (isLoadingAssign || isLoadingUnAssign) &&
              selectedDevice?.id === record.id
            }
            onClick={() => {
              setSelectedDevice(record);
              userRef
                ? setIsUnAssignModalVisible(true)
                : setIsAssignModalVisible(true);
            }}
          />
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      className: "table-column-actions",
      render: (record: DeviceDto) => (
        <div className="action-icons">
          <Button
            type="link"
            icon={<EditOutlined />}
            loading={isLoadingUpdate && selectedDevice?.id === record.id}
            disabled={isLoadingUpdate && selectedDevice?.id === record.id}
            onClick={() => {
              setSelectedDevice(record);
              setIsUpdateModalVisible(true);
            }}
          />
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            loading={isLoadingDelete && selectedDevice?.id === record.id}
            disabled={isLoadingDelete && selectedDevice?.id === record.id}
            onClick={() => {
              setSelectedDevice(record);
              setIsDeleteModalVisible(true);
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setIsAddModalVisible(true)}
        className="create-user-button"
        loading={isLoadingAdd}
        disabled={isLoadingAdd}
      >
        Create Device
      </Button>
      <Table
        columns={columns}
        dataSource={devices}
        loading={isLoading}
        rowKey="id"
        pagination={{
          pageSizeOptions: ["3", "5", "10", "20", "100"],
          showSizeChanger: true,
          defaultPageSize: 5,
        }}
        className="user-table"
      />
      <AddDeviceModal
        open={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onCreate={handleCreateDevice}
        loading={isLoadingAdd}
        users={users}
      />
      {isUpdateModalVisible && (
        <UpdateDeviceModal
          open={isUpdateModalVisible}
          onClose={() => {
            setIsUpdateModalVisible(false);
            setSelectedDevice(null);
          }}
          onUpdate={handleUpdateDevice}
          deviceData={selectedDevice}
          loading={isLoadingUpdate}
        />
      )}
      <DeleteDeviceModal
        open={isDeleteModalVisible}
        onClose={() => setIsDeleteModalVisible(false)}
        onDelete={handleDeleteDevice}
        deviceData={selectedDevice}
        loading={isLoadingDelete}
      />
      <AssignUserDevice
        open={isAssignModalVisible}
        onClose={() => {
          setIsAssignModalVisible(false);
          setSelectedDevice(null);
        }}
        onAssign={handleAssignDevice}
        deviceData={selectedDevice}
        users={users}
        loading={isLoadingAssign}
      />
      <UnAssignUserDevice
        open={isUnAssignModalVisible}
        onClose={() => {
          setIsUnAssignModalVisible(false);
          setSelectedDevice(null);
        }}
        onUnAssign={handleUnAssignDevice}
        deviceData={selectedDevice}
        loading={isLoadingUnAssign}
      />
    </>
  );
}
