import { Modal } from "antd";
import { DeviceDto } from "../../../utils/dtos/deviceDto/DeviceDto";

interface DeleteDeviceModalProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  deviceData: DeviceDto | null;
  loading: boolean;
}

const DeleteDeviceModal: React.FC<DeleteDeviceModalProps> = ({
  open,
  onClose,
  onDelete,
  deviceData,
  loading,
}) => {
  return (
    <Modal
      title="Delete Device"
      open={open}
      className="custom-logout-modal"
      onCancel={onClose}
      onOk={onDelete}
      loading={loading}
    >
      <p>Are you sure you want to delete the device id {deviceData?.id}?</p>
    </Modal>
  );
};

export default DeleteDeviceModal;
