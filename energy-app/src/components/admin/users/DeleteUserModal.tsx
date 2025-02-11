import { Modal } from "antd";
import { UserInfoDto } from "../../../utils/dtos/userDto/UserInfoDto";

interface DeleteUserModalProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  userData: UserInfoDto | null;
  loading: boolean;
}

const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
  open,
  onClose,
  onDelete,
  userData,
  loading,
}) => {
  return (
    <Modal
      title="Delete User"
      open={open}
      className="custom-logout-modal"
      onCancel={onClose}
      onOk={onDelete}
      loading={loading}
    >
      <p>Are you sure you want to delete {userData?.name}?</p>
    </Modal>
  );
};

export default DeleteUserModal;
