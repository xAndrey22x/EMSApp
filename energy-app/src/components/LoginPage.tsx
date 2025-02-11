import { Form, Input, Button, notification, Card } from "antd";
import "../styles/LoginPage.css";
import { useLoginUserMutation } from "../api/LoginApi";
import { useNavigate } from "react-router-dom";
import Title from "antd/es/typography/Title";
import { jwtDecode } from "jwt-decode";

export default function LoginPage() {
  const [loginUser, { isLoading }] = useLoginUserMutation();
  const navigate = useNavigate();

  const onFinish = async (values: { name: string; password: string }) => {
    try {
      const response = await loginUser(values).unwrap();
      const token = response.token;

      const decodedToken: any = jwtDecode(token);

      const user = {
        id: decodedToken.id,
        name: decodedToken.sub,
        admin: decodedToken.admin,
        token,
      };

      localStorage.setItem("user", JSON.stringify(user));

      notification.success({
        message: "Login Successful",
        description: `Welcome ${user.name}`,
        duration: 3,
      });
      navigate(user.admin ? "/admin" : "/user");
    } catch (error: any) {
      const errorMessage = error.data;
      notification.error({
        message: "Login Failed",
        description: errorMessage,
        duration: 3,
      });
    }
  };

  return (
    <div className="login-page">
      <Card className="login-form" bordered={true}>
        <Title level={2} className="login-page-title">
          Energy Management System
        </Title>
        <Form name="loginForm" onFinish={onFinish} layout="vertical">
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please input your name!" }]}
          >
            <Input placeholder="Enter your name" />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password placeholder="Enter your password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
