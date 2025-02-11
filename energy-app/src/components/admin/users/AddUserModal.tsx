import { Modal, Form, Input, Checkbox } from "antd";
import { UserDto } from "../../../utils/dtos/userDto/UserDto";

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (values: UserDto) => void;
  loading: boolean;
}

const AddUserModal: React.FC<AddUserModalProps> = ({
  open,
  onClose,
  onCreate,
  loading,
}) => {
  const [form] = Form.useForm();

  const handleFinish = (values: UserDto) => {
    onCreate(values);
    form.resetFields();
  };

  return (
    <Modal
      title="Add User"
      open={open}
      className="custom-logout-modal"
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      loading={loading}
      onOk={() => form.submit()}
    >
      <Form form={form} onFinish={handleFinish} layout="vertical">
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: "Name required" }]}
        >
          <Input onPressEnter={() => form.submit()} />
        </Form.Item>
        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: "Password required" }]}
        >
          <Input.Password onPressEnter={() => form.submit()} />
        </Form.Item>
        <Form.Item name="admin" valuePropName="checked">
          <Checkbox>Admin</Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddUserModal;
