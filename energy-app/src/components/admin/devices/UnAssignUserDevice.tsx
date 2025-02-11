import { Modal } from "antd";
import { DeviceDto } from "../../../utils/dtos/deviceDto/DeviceDto";

interface UnAssignUserDeviceProps {
  open: boolean;
  onClose: () => void;
  onUnAssign: (deviceId?: number) => void;
  deviceData: DeviceDto | null;
  loading: boolean;
}

const UnAssignUserDevice: React.FC<UnAssignUserDeviceProps> = ({
  open,
  onClose,
  onUnAssign,
  deviceData,
  loading,
}) => {
  return (
    <Modal
      title="Unassign User from Device"
      open={open}
      className="custom-logout-modal"
      onCancel={onClose}
      onOk={() => onUnAssign(deviceData?.id)}
      loading={loading}
    >
      <p>
        Are you sure you want to unassign the user from device id{" "}
        {deviceData?.id}?
      </p>
    </Modal>
  );
};

export default UnAssignUserDevice;
