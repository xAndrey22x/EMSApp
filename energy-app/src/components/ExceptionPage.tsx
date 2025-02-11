import { Result, Button } from "antd";
import { useNavigate } from "react-router-dom";

export default function ExceptionPage() {
  const navigate = useNavigate();
  localStorage.clear();
  return (
    <Result
      status="403"
      title="403"
      subTitle="Sorry, you are not authorized to access this page."
      extra={
        <Button
          className="logout-button"
          type="primary"
          onClick={() => navigate("/login")}
        >
          Back to Login
        </Button>
      }
    />
  );
}
