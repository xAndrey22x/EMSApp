import { Layout, Menu, Button, Modal, Dropdown, Badge } from "antd";
import { useNavigate } from "react-router-dom";
import {
  BellFilled,
  BellOutlined,
  CloseOutlined,
  DatabaseOutlined,
  LogoutOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import "../styles/Header.css";
import Title from "antd/es/typography/Title";

const { Header: AntHeader } = Layout;

interface HeaderProps {
  isAdmin: boolean;
  isNotificationPage?: boolean;
  onMenuSelect?: (key: string) => void;
  notifications?: string[];
  deleteNotification?: (index: number) => void;
  clearAllNotifications?: () => void;
  deviceId?: string;
}

export default function Header({
  isAdmin,
  isNotificationPage,
  onMenuSelect,
  notifications,
  deleteNotification,
  clearAllNotifications,
  deviceId,
}: HeaderProps) {
  const navigate = useNavigate();
  const userName = JSON.parse(localStorage.getItem("user") || "{}").name;

  const showLogoutConfirm = () => {
    Modal.confirm({
      title: "Confirm Logout",
      content: "Are you sure you want to log out?",
      okText: "Yes, Logout",
      cancelText: "Cancel",
      className: "custom-logout-modal",
      onOk: () => {
        localStorage.clear();
        navigate("/login");
      },
    });
  };

  const menuItems = [
    {
      label: "Users",
      key: "Users",
      icon: <TeamOutlined />,
    },
    {
      label: "Devices",
      key: "Devices",
      icon: <DatabaseOutlined />,
    },
  ];

  const handleClick = (e: any) => {
    if (onMenuSelect) {
      onMenuSelect(e.key);
    }
  };

  const notificationItems = isNotificationPage
    ? notifications!.length > 0
      ? [
          ...notifications!.map((item, index) => ({
            key: index,
            label: (
              <div>
                <span>{item}</span>
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification!(index);
                  }}
                />
              </div>
            ),
            icon: <BellFilled />,
          })),
          {
            key: "clear-all",
            label: (
              <Button
                type="primary"
                danger
                onClick={clearAllNotifications}
                className="logout-button"
              >
                Clear All
              </Button>
            ),
          },
        ]
      : [
          {
            key: "no-notifications",
            label: <span>No notifications</span>,
            disabled: true,
          },
        ]
    : [];

  return (
    <AntHeader className="custom-header">
      {isAdmin ? (
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={["Users"]}
          items={menuItems}
          onClick={handleClick}
          className="custom-menu"
        />
      ) : isNotificationPage ? (
        <div className="header-content">
          <Badge
            count={notifications?.length}
            overflowCount={99}
            color="#3b8751"
          >
            <Dropdown
              menu={{ items: notificationItems }}
              trigger={["click"]}
              placement="bottomRight"
              overlayClassName="scrollable-dropdown-menu"
            >
              <Button
                type="primary"
                icon={<BellOutlined />}
                className="logout-button"
              >
                Notifications
              </Button>
            </Dropdown>
          </Badge>
          <Title level={3} className="header-title" italic={true}>
            {userName} devices
          </Title>
        </div>
      ) : (
        <Title level={3} className="header-title" italic={true}>
          Device {deviceId}
        </Title>
      )}
      <Button
        type="primary"
        icon={<LogoutOutlined />}
        onClick={showLogoutConfirm}
        className="logout-button"
      >
        Logout
      </Button>
    </AntHeader>
  );
}
