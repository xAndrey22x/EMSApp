import { useEffect, useMemo, useRef, useState } from "react";
import { UserInfoDto } from "../utils/dtos/userDto/UserInfoDto";
import { Avatar, Badge, Input, List, Modal, Typography } from "antd";
import { MessageDto } from "../utils/dtos/chatDto/MessageDto";
import "../styles/Chat.css";
import { SendOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
interface ChatModalProps {
  open: boolean;
  onClose: () => void;
  users: UserInfoDto[];
  messages: MessageDto[];
  onSendMessage: (receiverId: number, message: string) => void;
  userSide: boolean;
  loading: boolean;
  onSeenMessage: (senderId: number) => void;
  onTyping: (receiverId: number) => void;
  typingUsers: number[];
}

export const ChatModal: React.FC<ChatModalProps> = ({
  open,
  onClose,
  users,
  messages,
  onSendMessage,
  userSide,
  loading,
  onSeenMessage,
  onTyping,
  typingUsers,
}) => {
  const [activeUser, setActiveUser] = useState<UserInfoDto | null>(null);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [usersList, setUsersList] = useState<UserInfoDto[]>(users);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (users) {
      const updatedUsers = [
        ...users,
        { id: -1, name: "Announcements", admin: false },
      ].sort((a, b) => (a.id > b.id ? 1 : -1));
      setUsersList(updatedUsers);
    }
  }, [users]);

  const handleUserClick = (user: UserInfoDto) => {
    setActiveUser(user);
    onSeenMessage(user.id);
  };

  const handleSend = () => {
    if (activeUser && inputMessage.trim()) {
      onSendMessage(activeUser.id, inputMessage);
      setInputMessage("");
    }
  };

  const filteredMessages = useMemo(() => {
    if (!activeUser) return [];
    return messages.filter(
      (msg) =>
        (msg.senderId === activeUser.id &&
          msg.receiverId !== activeUser.id &&
          msg.receiverId !== -1) ||
        (msg.receiverId === activeUser.id && msg.senderId !== activeUser.id)
    );
  }, [activeUser, messages]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [filteredMessages]);

  useEffect(() => {
    if (open && activeUser) {
      const hasUnseenMessages = messages.some(
        (msg) => msg.senderId === activeUser.id && !msg.seen
      );
      if (hasUnseenMessages) {
        onSeenMessage(activeUser.id);
      }
    }
  }, [open, activeUser, messages, onSeenMessage]);

  const countUnseenMessages = (senderId: number) => {
    return messages.filter((msg) => msg.senderId === senderId && !msg.seen)
      .length;
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={950}
      className="chat-modal"
      loading={loading}
      afterOpenChange={(isOpen) => {
        if (isOpen && chatBoxRef.current) {
          chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
      }}
    >
      <div className="chat-layout">
        <aside className="user-list-container">
          <Typography.Title level={4} className="user-list-title">
            {userSide ? "Administrators" : "Users"}
          </Typography.Title>
          <List
            itemLayout="horizontal"
            dataSource={usersList}
            renderItem={(user) => (
              <List.Item
                className={`user-item ${
                  activeUser?.id === user.id ? "active-user" : ""
                }`}
                onClick={() => handleUserClick(user)}
              >
                <List.Item.Meta
                  avatar={
                    <Badge
                      count={countUnseenMessages(user.id)}
                      size="small"
                      style={{ fontSize: "10px", marginRight: 3, marginTop: 3 }}
                      overflowCount={99}
                    >
                      <Avatar>
                        {user.id === -1 ? <TeamOutlined /> : <UserOutlined />}
                      </Avatar>
                    </Badge>
                  }
                  title={user.name}
                  style={{ marginLeft: 3 }}
                />
              </List.Item>
            )}
          />
        </aside>

        <section className="chat-section-container">
          {activeUser ? (
            <>
              <header className="chat-header">
                <Avatar>
                  {activeUser.id === -1 ? <TeamOutlined /> : <UserOutlined />}
                </Avatar>
                <Typography.Text className="chat-username">
                  {activeUser.name}
                  {typingUsers.includes(activeUser.id) && (
                    <span className="typing-indicator"> is typing...</span>
                  )}
                </Typography.Text>
              </header>

              <div className="chat-box" ref={chatBoxRef}>
                {filteredMessages.length > 0 ? (
                  filteredMessages.map((msg, index) => (
                    <div key={index}>
                      <div
                        className={`chat-message ${
                          msg.senderId === activeUser.id ||
                          msg.receiverId === -1
                            ? "received"
                            : "sent"
                        }`}
                      >
                        <span
                          className={`chat-tag ${
                            msg.senderId === activeUser.id ||
                            msg.receiverId === -1
                              ? "received-tag"
                              : "sent-tag"
                          }`}
                        >
                          {msg.senderId === activeUser.id ||
                          msg.receiverId === -1
                            ? msg.receiverId === -1
                              ? msg.announcerName
                              : activeUser.name
                            : "You"}
                        </span>
                        <span className="chat-text">{msg.message}</span>
                      </div>
                      {msg.seen &&
                        activeUser.id === msg.receiverId &&
                        msg.receiverId !== -1 && (
                          <div className="chat-status-container">
                            <span className="chat-seen-status seen">Seen</span>
                          </div>
                        )}
                    </div>
                  ))
                ) : (
                  <div className="no-messages">No messages yet</div>
                )}
              </div>

              <footer className="message-input-container">
                {!(activeUser.name === "Announcements" && userSide) && (
                  <Input
                    className="message-input"
                    placeholder="Type a message..."
                    value={inputMessage}
                    onChange={(e) => {
                      setInputMessage(e.target.value);
                      if (activeUser) {
                        onTyping(activeUser.id);
                      }
                    }}
                    onPressEnter={handleSend}
                    suffix={
                      <SendOutlined
                        onClick={handleSend}
                        style={{
                          fontSize: 18,
                          color: "#28a745",
                          cursor: "pointer",
                        }}
                      />
                    }
                    disabled={userSide && activeUser.name === "Announcements"}
                  />
                )}
              </footer>
            </>
          ) : (
            <div className="chat-placeholder">
              <Typography.Text>
                {userSide
                  ? "Select an admin to start chatting"
                  : "Select an user to start chatting"}
              </Typography.Text>
            </div>
          )}
        </section>
      </div>
    </Modal>
  );
};
