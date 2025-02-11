import { useEffect } from "react";
import { DeviceDto } from "../../../utils/dtos/deviceDto/DeviceDto";
import { Form, Input, InputNumber, Modal } from "antd";

interface UpdateDeviceModalProps {
  open: boolean;
  onClose: () => void;
  onUpdate: (values: DeviceDto) => void;
  deviceData: DeviceDto | null;
  loading: boolean;
}

const UpdateDeviceModal: React.FC<UpdateDeviceModalProps> = ({
  open,
  onClose,
  onUpdate,
  deviceData,
  loading,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (deviceData) {
      form.setFieldsValue(deviceData);
    }
  }, [deviceData, form]);

  const handleFinish = (values: DeviceDto) => {
    onUpdate(values);
  };

  return (
    <Modal
      title="Update Device"
      open={open}
      onCancel={onClose}
      className="custom-logout-modal"
      onOk={() => form.submit()}
      loading={loading}
    >
      <Form
        form={form}
        onFinish={handleFinish}
        layout="vertical"
        initialValues={deviceData || {}}
      >
        <Form.Item
          label="Description"
          name="description"
          rules={[
            {
              required: true,
              message: "Description required",
            },
          ]}
        >
          <Input onPressEnter={() => form.submit()} />
        </Form.Item>
        <Form.Item
          label="Address"
          name="address"
          rules={[
            {
              required: true,
              message: "Address required",
            },
          ]}
        >
          <Input onPressEnter={() => form.submit()} />
        </Form.Item>
        <Form.Item
          label="MHEC"
          name="mhec"
          rules={[
            {
              required: true,
              message: "MHEC required",
            },
          ]}
        >
          <InputNumber onPressEnter={() => form.submit()} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdateDeviceModal;
