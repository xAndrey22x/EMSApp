import { useGetUserDevicesQuery } from "../../api/UserRefApi";
import Header from "../Header";
import { Card, Col, FloatButton, notification, Row, Spin, Tooltip } from "antd";
import "../../styles/User.css";
import { DeviceDtoForList } from "../../utils/dtos/deviceDto/DeviceDtoForList";
import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import { useNavigate } from "react-router-dom";
import { CommentOutlined } from "@ant-design/icons";
import { ChatModal } from "../ChatModal";
import { useGetUsersAdminsQuery } from "../../api/UserApi";
import { UserInfoDto } from "../../utils/dtos/userDto/UserInfoDto";
import { MessageDto } from "../../utils/dtos/chatDto/MessageDto";

export default function UserDashboard() {
  const currentUserId = JSON.parse(localStorage.getItem("user") || "{}").id;
  const { data, isLoading: loading } = useGetUserDevicesQuery(currentUserId, {
    refetchOnMountOrArgChange: true,
  });
  const {
    data: initialUsers,
    isLoading,
    error: getUsersError,
  } = useGetUsersAdminsQuery();
  const [devices, setDevices] = useState<DeviceDtoForList[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [isChatModalVisible, setIsChatModalVisibile] = useState(false);
  const [users, setUsers] = useState<UserInfoDto[]>(initialUsers || []);
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [clientChatRef, setClientChatRef] = useState<Client | null>(null);
  const [typingUsers, setTypingUsers] = useState<number[]>([]);
  const typingTimeouts = useRef<Map<number, NodeJS.Timeout>>(new Map());

  const navigate = useNavigate();
  const isChatModalVisibleRef = useRef(isChatModalVisible);
  const user = localStorage.getItem("user");
  const token = user ? JSON.parse(user).token : null;

  useEffect(() => {
    isChatModalVisibleRef.current = isChatModalVisible;
  }, [isChatModalVisible]);

  useEffect(() => {
    if (data) {
      setDevices(data);
    }
  }, [data]);

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

  useEffect(() => {
    if (devices.length === 0) return;

    const client = new Client({
      brokerURL: process.env.REACT_APP_MONITORING_WS_URL
        ? `${process.env.REACT_APP_MONITORING_WS_URL}?token=${token}`
        : `ws://localhost:8082/energymonitoring/ws?token=${token}`,
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      devices.forEach((device) => {
        const topic = `/topic/device/${device.id}`;
        client.subscribe(topic, (message) => {
          const notificationMessage = message.body;
          addNotification(notificationMessage);
          notification.info({
            message: "Device Status",
            description: notificationMessage,
            duration: 5,
          });
        });
      });
    };

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [devices, token]);

  useEffect(() => {
    if (users.length === 0) return;

    const client = new Client({
      brokerURL: process.env.REACT_APP_CHAT_WS_URL
        ? `${process.env.REACT_APP_CHAT_WS_URL}?token=${token}`
        : `ws://localhost:8084/energychat/ws?token=${token}`,
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      users.forEach((user) => {
        const topic = `/topic/chat/${user.id}/${currentUserId}`;
        const topic2 = `/topic/chat/${user.id}/-1`;
        const topic3 = `/topic/seen/${currentUserId}`;
        const topic4 = `/topic/typing/${currentUserId}`;
        client.subscribe(topic, (message) => {
          const parsedMessage: MessageDto = JSON.parse(message.body);
          setMessages((prevMessages) => [...prevMessages, parsedMessage]);
        });
        client.subscribe(topic2, (message) => {
          const parsedMessage: MessageDto = JSON.parse(message.body);
          setMessages((prevMessages) => [...prevMessages, parsedMessage]);
        });
        client.subscribe(topic3, (message) => {
          const receiverIdSeen = JSON.parse(message.body);
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.receiverId === receiverIdSeen ? { ...msg, seen: true } : msg
            )
          );
        });
        client.subscribe(topic4, (message) => {
          const typingUserId = JSON.parse(message.body);
          setTypingUsers((prev) => {
            if (!prev.includes(typingUserId)) {
              return [...prev, typingUserId];
            }
            return prev;
          });

          if (typingTimeouts.current.has(typingUserId)) {
            clearTimeout(typingTimeouts.current.get(typingUserId));
          }

          const timeout = setTimeout(() => {
            setTypingUsers((prev) => prev.filter((id) => id !== typingUserId));
            typingTimeouts.current.delete(typingUserId);
          }, 1000);

          typingTimeouts.current.set(typingUserId, timeout);
        });
      });
    };

    client.activate();
    setClientChatRef(client);

    return () => {
      client.deactivate();
    };
  }, [users, currentUserId, token]);

  const handleSendMessage = (receiverId: number, message: string) => {
    if (clientChatRef && clientChatRef.connected) {
      const messageDto: MessageDto = {
        senderId: currentUserId,
        receiverId: receiverId,
        message,
        seen: false,
      };
      clientChatRef.publish({
        destination: "/app/chat",
        body: JSON.stringify(messageDto),
      });
      setMessages((prevMessages) => [...prevMessages, messageDto]);
    } else {
      notification.error({
        message: "WebSocket Disconnected",
        description: "Unable to send message. Please reconnect.",
      });
    }
  };

  const handleSeenMessage = (senderId: number) => {
    if (clientChatRef && clientChatRef.connected) {
      clientChatRef.publish({
        destination: `/app/seen/${senderId}`,
        body: JSON.stringify(currentUserId),
      });
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.receiverId === currentUserId && msg.senderId === senderId
            ? { ...msg, seen: true }
            : msg
        )
      );
    }
  };

  const sendTypingNotification = (receiverId: number) => {
    if (clientChatRef && clientChatRef.connected) {
      clientChatRef.publish({
        destination: `/app/typing/${receiverId}`,
        body: JSON.stringify(currentUserId),
      });
    }
  };

  const addNotification = (message: string) => {
    setNotifications((prev) => [...prev, message]);
  };

  const deleteNotification = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const handleChatModal = () => {
    setIsChatModalVisibile(true);
  };

  const badgeCount = () => {
    if (!isChatModalVisible)
      return messages.filter(
        (msg) => msg.receiverId === currentUserId && !msg.seen
      ).length;
  };

  return (
    <>
      <Header
        isAdmin={false}
        isNotificationPage={true}
        notifications={notifications}
        deleteNotification={deleteNotification}
        clearAllNotifications={clearAllNotifications}
      />
      <div className="user-dashboard">
        {loading ? (
          <div className="loading-spinner">
            <Spin size="large" />
          </div>
        ) : devices.length > 0 ? (
          <Row gutter={[16, 16]}>
            {devices.map((device) => (
              <Col xs={24} sm={12} md={8} lg={6} key={device.id}>
                <Tooltip title="Show consumption history">
                  <Card
                    title={`ID ${device.id}`}
                    bordered={true}
                    className="device-card"
                    onClick={() => navigate(`/consumption/${device.id}`)}
                  >
                    <p>
                      <strong>Description:</strong> {device.description}
                    </p>
                    <p>
                      <strong>Address:</strong> {device.address}
                    </p>
                    <p>
                      <strong>MHEC:</strong> {device.mhec}
                    </p>
                  </Card>
                </Tooltip>
              </Col>
            ))}
          </Row>
        ) : (
          <p>No devices found.</p>
        )}
        <FloatButton
          tooltip={<div>Chat</div>}
          shape="circle"
          className="chat-button"
          style={{ insetInlineEnd: 45 }}
          icon={
            <CommentOutlined
              style={{
                fontSize: "20px",
                marginLeft: "-1px",
              }}
            />
          }
          onClick={handleChatModal}
          badge={{
            count: badgeCount(),
            overflowCount: 99,
            className: "chat-badge",
          }}
        />
      </div>
      <ChatModal
        open={isChatModalVisible}
        onClose={() => setIsChatModalVisibile(false)}
        users={users}
        messages={messages}
        onSendMessage={handleSendMessage}
        userSide={true}
        loading={isLoading}
        onSeenMessage={handleSeenMessage}
        onTyping={sendTypingNotification}
        typingUsers={typingUsers}
      />
    </>
  );
}
