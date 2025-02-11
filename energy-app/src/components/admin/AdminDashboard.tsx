import { useCallback, useEffect, useRef, useState } from "react";
import Header from "../Header";
import "../../styles/Admin.css";
import UsersTable from "./users/UsersTable";
import DevicesTable from "./devices/DevicesTable";
import { FloatButton, notification } from "antd";
import { CommentOutlined } from "@ant-design/icons";
import { ChatModal } from "../ChatModal";
import { UserInfoDto } from "../../utils/dtos/userDto/UserInfoDto";
import { useGetUsersUsersQuery } from "../../api/UserApi";
import { Client } from "@stomp/stompjs";
import { MessageDto } from "../../utils/dtos/chatDto/MessageDto";

export default function AdminDashboard() {
  const currentUserId = JSON.parse(localStorage.getItem("user") || "{}").id;
  const currentUserName = JSON.parse(localStorage.getItem("user") || "{}").name;
  const [selectedItem, setSelectedItem] = useState<string>("Users");
  const [userChanged, setUserChanged] = useState<boolean>(false);
  const {
    data: initialUsers,
    isLoading,
    error: getUsersError,
  } = useGetUsersUsersQuery();
  const [users, setUsers] = useState<UserInfoDto[]>(initialUsers || []);
  const [isChatModalVisible, setIsChatModalVisibile] = useState(false);
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [clientRef, setClientRef] = useState<Client | null>(null);
  const isChatModalVisibleRef = useRef(isChatModalVisible);
  const [typingUsers, setTypingUsers] = useState<number[]>([]);
  const typingTimeouts = useRef<Map<number, NodeJS.Timeout>>(new Map());
  const user = localStorage.getItem("user");
  const token = user ? JSON.parse(user).token : null;

  useEffect(() => {
    isChatModalVisibleRef.current = isChatModalVisible;
  }, [isChatModalVisible]);

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
        const topic2 = `/topic/seen/${currentUserId}`;
        const topic3 = `/topic/typing/${currentUserId}`;

        client.subscribe(topic, (message) => {
          const parsedMessage: MessageDto = JSON.parse(message.body);
          setMessages((prevMessages) => [...prevMessages, parsedMessage]);
        });
        client.subscribe(topic2, (message) => {
          const receiverIdSeen = JSON.parse(message.body);
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.receiverId === receiverIdSeen ? { ...msg, seen: true } : msg
            )
          );
        });
        client.subscribe(topic3, (message) => {
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
    setClientRef(client);

    return () => {
      client.deactivate();
    };
  }, [users, currentUserId, token]);

  const handleSendMessage = (receiverId: number, message: string) => {
    if (clientRef && clientRef.connected) {
      const messageDto: MessageDto = {
        senderId: currentUserId,
        receiverId: receiverId,
        message,
        announcerName: receiverId === -1 ? currentUserName : undefined,
        seen: receiverId === -1 ? true : false,
      };
      clientRef.publish({
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
    if (clientRef && clientRef.connected) {
      clientRef.publish({
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
    if (clientRef && clientRef.connected) {
      clientRef.publish({
        destination: `/app/typing/${receiverId}`,
        body: JSON.stringify(currentUserId),
      });
    }
  };

  const handleUserChange = useCallback((hasChanged: boolean) => {
    setUserChanged(hasChanged);
  }, []);

  const handleMenuSelect = (key: string) => {
    setSelectedItem(key);
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
      <Header isAdmin={true} onMenuSelect={handleMenuSelect} />
      <div className="admin-dashboard">
        {selectedItem === "Users" ? (
          <UsersTable onUserChange={handleUserChange} />
        ) : (
          <DevicesTable
            userChanged={userChanged}
            onUserChange={handleUserChange}
          />
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
          badge={{
            count: badgeCount(),
            overflowCount: 99,
            className: "chat-badge",
          }}
          onClick={handleChatModal}
        />
      </div>
      <ChatModal
        open={isChatModalVisible}
        onClose={() => setIsChatModalVisibile(false)}
        users={users}
        messages={messages}
        onSendMessage={handleSendMessage}
        userSide={false}
        loading={isLoading}
        onSeenMessage={handleSeenMessage}
        onTyping={sendTypingNotification}
        typingUsers={typingUsers}
      />
    </>
  );
}
