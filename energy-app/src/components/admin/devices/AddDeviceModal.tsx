import React, { useState } from "react";
import { DeviceDto } from "../../../utils/dtos/deviceDto/DeviceDto";
import { Form, Input, InputNumber, Modal, Select } from "antd";
import { UserRefDto } from "../../../utils/dtos/deviceDto/UserRefDto";

interface AddDeviceModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (device: DeviceDto) => void;
  loading: boolean;
  users: UserRefDto[];
}

const AddDeviceModal: React.FC<AddDeviceModalProps> = ({
  open,
  onClose,
  onCreate,
  loading,
  users,
}) => {
  const [form] = Form.useForm();
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserRefDto | null>(null);

  const handleFinish = (values: DeviceDto) => {
    onCreate({ ...values, userRef: selectedUser });
    form.resetFields();
    setSelectedUser(null);
  };

  return (
    <Modal
      title="Add Device"
      open={open}
      className="custom-logout-modal"
      onCancel={() => {
        form.resetFields();
        onClose();
        setSelectedUser(null);
      }}
      loading={loading}
      onOk={() => form.submit()}
    >
      <Form form={form} onFinish={handleFinish} layout="vertical">
        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: "Description required" }]}
        >
          <Input onPressEnter={() => form.submit()} />
        </Form.Item>
        <Form.Item
          label="Address"
          name="address"
          rules={[{ required: true, message: "Address required" }]}
        >
          <Input onPressEnter={() => form.submit()} />
        </Form.Item>
        <Form.Item
          label="MHEC"
          name="mhec"
          rules={[{ required: true, message: "MHEC required" }]}
        >
          <InputNumber onPressEnter={() => form.submit()} />
        </Form.Item>
        <div className="select-user">
          <label style={{ marginBottom: 4 }} className="select-label">
            Assign User
          </label>
          <Select
            showSearch
            placeholder="Select or search for a user"
            allowClear
            filterOption={false}
            value={selectedUser?.userId || null}
            onSearch={(input) => setSearch(input)}
            onChange={(userId) => {
              const selectedUser = users.find((user) => user.userId === userId);
              setSelectedUser(selectedUser || null);
            }}
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
        </div>
      </Form>
    </Modal>
  );
};

export default AddDeviceModal;
