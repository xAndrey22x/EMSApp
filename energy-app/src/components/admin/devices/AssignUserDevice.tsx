import React, { useState } from "react";
import { Modal, Select, Form } from "antd";
import { DeviceDto } from "../../../utils/dtos/deviceDto/DeviceDto";
import { UserRefDto } from "../../../utils/dtos/deviceDto/UserRefDto";

interface AssignUserDeviceProps {
  open: boolean;
  onClose: () => void;
  onAssign: (deviceId?: number, userId?: number) => void;
  deviceData: DeviceDto | null;
  users: UserRefDto[];
  loading: boolean;
}

const AssignUserDevice: React.FC<AssignUserDeviceProps> = ({
  open,
  onClose,
  onAssign,
  deviceData,
  users,
  loading,
}) => {
  const [form] = Form.useForm();
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const handleAssign = () => {
    if (deviceData && selectedUserId !== null) {
      onAssign(deviceData?.id, selectedUserId);
      form.resetFields();
      setSelectedUserId(null);
    }
  };

  return (
    <Modal
      title="Assign User to Device"
      open={open}
      className="custom-logout-modal"
      onCancel={() => {
        form.resetFields();
        onClose();
        setSelectedUserId(null);
      }}
      loading={loading}
      onOk={() => form.submit()}
    >
      <Form form={form} layout="vertical" onFinish={handleAssign}>
        <Form.Item label="Select User" required>
          <Select
            showSearch
            placeholder="Select or search for a user"
            allowClear
            filterOption={false}
            value={selectedUserId || null}
            onSearch={(input) => setSearch(input)}
            onChange={(userId) => setSelectedUserId(userId as number)}
            options={users
              .filter((user) =>
                user.userName.toLowerCase().includes(search.toLowerCase())
              )
              .slice(0, 5)
              .map((user) => ({
                value: user.userId,
                label: user.userName,
              }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AssignUserDevice;
