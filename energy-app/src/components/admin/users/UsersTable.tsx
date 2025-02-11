import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { notification, Tag, Button, Table } from "antd";
import { useState, useEffect } from "react";
import {
  useGetUsersQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "../../../api/UserApi";
import { UserDto } from "../../../utils/dtos/userDto/UserDto";
import AddUserModal from "./AddUserModal";
import DeleteUserModal from "./DeleteUserModal";
import UpdateUserModal from "./UpdateUserModal";
import "../../../styles/Admin.css";
import { UserInfoDto } from "../../../utils/dtos/userDto/UserInfoDto";

interface UsersTableProps {
  onUserChange: (hasChanged: boolean) => void;
}

export default function UsersTable({ onUserChange }: UsersTableProps) {
  const {
    data: initialUsers,
    isLoading,
    error: getUsersError,
  } = useGetUsersQuery();
  const [users, setUsers] = useState<UserInfoDto[]>(initialUsers || []);

  const [addUser, { isLoading: isLoadingAdd }] = useAddUserMutation();
  const [updateUser, { isLoading: isLoadingUpdate }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isLoadingDelete }] = useDeleteUserMutation();

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserInfoDto | null>(null);

  useEffect(() => {
    if (getUsersError) {
      notification.error({
        message: "Error Fetching Users",
        description: "Failed to load user data. Please try again later.",
        duration: 3,
      });
    }
  }, [getUsersError]);

  useEffect(() => {
    if (initialUsers) {
      setUsers(initialUsers);
    }
  }, [initialUsers]);

  const handleCreateUser = async (values: UserDto) => {
    try {
      const response = await addUser(values).unwrap();
      setUsers((prevUsers) => [...prevUsers, response]);
      notification.success({
        message: "User Created",
        description: `User ${response.name} has been successfully created.`,
        duration: 3,
      });
      onUserChange(true);
      setIsAddModalVisible(false);
    } catch (error: any) {
      notification.error({
        message: "Create User Failed",
        description: error.data || "Could not create user. Please try again.",
        duration: 3,
      });
    }
  };

  const handleUpdateUser = async (values: UserDto) => {
    try {
      const response = await updateUser({
        id: selectedUser!.id!,
        updatedUser: values,
      }).unwrap();
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === response.id ? response : user))
      );
      notification.success({
        message: "User Updated",
        description: `User ${response.name} has been successfully updated.`,
        duration: 3,
      });
      setIsUpdateModalVisible(false);
      setSelectedUser(null);
      onUserChange(true);
    } catch (error: any) {
      notification.error({
        message: "Update User Failed",
        description: error.data || "Could not update user. Please try again.",
        duration: 3,
      });
    }
  };

  const handleDeleteUser = async () => {
    try {
      await deleteUser(selectedUser!.id!).unwrap();
      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.id !== selectedUser!.id)
      );
      notification.success({
        message: "User Deleted",
        description: `User ${selectedUser?.name} has been successfully deleted.`,
        duration: 3,
      });
      setIsDeleteModalVisible(false);
      setSelectedUser(null);
      onUserChange(true);
    } catch (error: any) {
      notification.error({
        message: "Error deleting User",
        description: error.data || "Could not delete user. Please try again.",
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
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Admin",
      dataIndex: "admin",
      key: "admin",
      render: (admin: boolean) =>
        admin ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Admin
          </Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />} color="default">
            User
          </Tag>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      className: "table-column-actions",
      render: (record: UserInfoDto) => (
        <div className="action-icons">
          <Button
            type="link"
            icon={<EditOutlined />}
            loading={isLoadingUpdate && selectedUser?.id === record.id}
            disabled={isLoadingUpdate && selectedUser?.id === record.id}
            onClick={() => {
              setSelectedUser(record);
              setIsUpdateModalVisible(true);
            }}
          />
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            loading={isLoadingDelete && selectedUser?.id === record.id}
            disabled={isLoadingDelete && selectedUser?.id === record.id}
            onClick={() => {
              setSelectedUser(record);
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
        Create User
      </Button>
      <Table
        columns={columns}
        dataSource={users}
        loading={isLoading}
        rowKey="id"
        pagination={{
          pageSizeOptions: ["3", "5", "10", "20", "100"],
          showSizeChanger: true,
          defaultPageSize: 5,
        }}
        className="user-table"
      />
      <AddUserModal
        open={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onCreate={handleCreateUser}
        loading={isLoadingAdd}
      />
      {isUpdateModalVisible && (
        <UpdateUserModal
          open={isUpdateModalVisible}
          onClose={() => {
            setIsUpdateModalVisible(false);
            setSelectedUser(null);
          }}
          onUpdate={handleUpdateUser}
          userData={selectedUser}
          loading={isLoadingUpdate}
        />
      )}
      <DeleteUserModal
        open={isDeleteModalVisible}
        onClose={() => setIsDeleteModalVisible(false)}
        onDelete={handleDeleteUser}
        userData={selectedUser}
        loading={isLoadingDelete}
      />
    </>
  );
}
