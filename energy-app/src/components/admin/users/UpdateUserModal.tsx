import { Modal, Form, Input, Checkbox } from "antd";
import { UserDto } from "../../../utils/dtos/userDto/UserDto";
import { useEffect } from "react";
import { UserInfoDto } from "../../../utils/dtos/userDto/UserInfoDto";

interface UpdateUserModalProps {
  open: boolean;
  onClose: () => void;
  onUpdate: (values: UserDto) => void;
  userData: UserInfoDto | null;
  loading: boolean;
}

const UpdateUserModal: React.FC<UpdateUserModalProps> = ({
  open,
  onClose,
  onUpdate,
  userData,
  loading,
}) => {
  const currentUserId = JSON.parse(localStorage.getItem("user") || "{}").id;
  const [form] = Form.useForm();

  useEffect(() => {
    if (userData) {
      form.setFieldsValue({ ...userData, password: "" });
    }
  }, [userData, form]);

  const handleFinish = (values: UserDto) => {
    onUpdate(values);
    form.setFieldsValue({ password: "" });
  };

  return (
    <Modal
      title="Update User"
      open={open}
      className="custom-logout-modal"
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      onOk={() => form.submit()}
      loading={loading}
    >
      <Form
        form={form}
        onFinish={handleFinish}
        layout="vertical"
        initialValues={userData || {}}
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: "Name required" }]}
        >
          <Input onPressEnter={() => form.submit()} />
        </Form.Item>
        <Form.Item label="Password" name="password">
          <Input.Password onPressEnter={() => form.submit()} />
        </Form.Item>
        <Form.Item name="admin" valuePropName="checked">
          <Checkbox disabled={userData?.id === currentUserId}>Admin</Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdateUserModal;
