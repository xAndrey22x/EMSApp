import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { MonitorDataDto } from "../../utils/dtos/monitorDto/MonitorDataDto";
import { Button, Calendar, Card, notification, Tooltip } from "antd";
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
  LabelList,
} from "recharts";
import "../../styles/EnergyConsumption.css";
import Header from "../Header";
import { useGetUserDevicesQuery } from "../../api/UserRefApi";
import { Client } from "@stomp/stompjs";

export default function UserEnergyConsumption() {
  const { deviceId } = useParams();
  const [monitorData, setMonitorData] = useState<MonitorDataDto[]>([]);
  const currentUserId = JSON.parse(localStorage.getItem("user") || "{}").id;
  const { data: devicesData } = useGetUserDevicesQuery(currentUserId);
  const clientRef = useRef<Client | null>(null);
  const navigate = useNavigate();
  const user = localStorage.getItem("user");
  const token = user ? JSON.parse(user).token : null;

  useEffect(() => {
    if (
      devicesData?.findIndex((device) => device.id === Number(deviceId)) === -1
    ) {
      navigate("/user");
      return;
    }
    const client = new Client({
      brokerURL: process.env.REACT_APP_MONITORING_WS_URL
        ? `${process.env.REACT_APP_MONITORING_WS_URL}?token=${token}`
        : `ws://localhost:8082/energymonitoring/ws?token=${token}`,
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      client.publish({
        destination: `/app/monitor/connect`,
        body: deviceId?.toString(),
      });
      const topicMonitor = `/topic/monitor/${deviceId}`;
      const topicNotification = `/topic/device/${deviceId}`;
      client.subscribe(topicMonitor, (message) => {
        const monitorDataList: MonitorDataDto[] = JSON.parse(message.body);
        setMonitorData(monitorDataList);
      });
      client.subscribe(topicNotification, () => {
        notification.info({
          message: "Device Status",
          description: "Device has reached his maximum consumption",
          duration: 5,
          placement: "topLeft",
        });
      });
      const gmtPlusTwoMillis = new Date().getTime() + 2 * 60 * 60 * 1000;
      client.publish({
        destination: `/app/monitor/timestamp/${deviceId}`,
        body: gmtPlusTwoMillis.toString(),
      });
    };

    client.activate();
    clientRef.current = client;

    return () => {
      client.publish({
        destination: `/app/monitor/disconnect`,
        body: deviceId?.toString(),
      });
      client.deactivate();
    };
  }, [deviceId, devicesData, navigate, token]);

  const handleDateSelect = (date: any) => {
    const timestamp = new Date(date.format("YYYY-MM-DD")).getTime();
    if (clientRef.current && clientRef.current.connected) {
      clientRef.current.publish({
        destination: `/app/monitor/timestamp/${deviceId}`,
        body: timestamp?.toString(),
      });
    }
  };

  const chartData = monitorData.map((item) => ({
    hour: new Date(item.timestamp).getHours(),
    energy: item.measurementValueHourly,
  }));

  return (
    <>
      <Header isAdmin={false} isNotificationPage={false} deviceId={deviceId} />
      <div className="page-container">
        <div className="content-wrapper">
          <Card title="Select a Day" bordered={true} className="calendar-card">
            <Calendar
              fullscreen={false}
              onSelect={handleDateSelect}
              className="calendar-style"
            />
          </Card>

          <Card
            title="Energy Consumption (kWh)"
            bordered={true}
            className="chart-card"
          >
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="hour"
                  label={{
                    value: "Hour",
                    position: "insideBottom",
                    offset: -5,
                  }}
                />
                <YAxis
                  label={{
                    value: "Energy (kWh)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="energy"
                  stroke="#3b8751"
                  activeDot={{ r: 8 }}
                >
                  <LabelList
                    dataKey="energy"
                    position="top"
                    formatter={(value: number) => value.toFixed(2)}
                  />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
        <div className="redirect-button-container">
          <Button
            type="primary"
            className="logout-button"
            onClick={() => navigate("/user")}
          >
            Go Back
          </Button>
        </div>
      </div>
    </>
  );
}
