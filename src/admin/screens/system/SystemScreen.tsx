"use client";

import { useEffect, useState } from "react";
import { Card, Col, Descriptions, Row, Space, Spin, Tag, Typography } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import { adminStyles as styles } from "@/admin/theme/theme";
import { request } from "@/admin/api/client";
import { adminMessage as message } from "@/admin/utils/message";
import type { AnyRow } from "@/admin/types";
import { formatDateTime as date } from "@/admin/utils/format";
export function SystemScreen() { const [data, setData] = useState<AnyRow | null>(null); useEffect(() => { request("/admin/system/health").then(setData).catch(e => message.error(e.message)) }, []); return <Row gutter={[18, 18]}><Col xs={24} lg={15}><Card className={styles.panel} title="Trạng thái dịch vụ">{data ? <Descriptions bordered column={1} items={[{ key: "status", label: "API", children: <Space><span className={styles.statusDot} /><b>{data.status}</b></Space> }, { key: "db", label: "Cơ sở dữ liệu", children: data.database }, { key: "latency", label: "Độ trễ DB", children: `${data.databaseLatencyMs} ms` }, { key: "uptime", label: "Uptime", children: `${data.uptimeSeconds} giây` }, { key: "node", label: "Node.js", children: data.nodeVersion }, { key: "time", label: "Kiểm tra lúc", children: date(data.timestamp) }]} /> : <Spin />}</Card></Col><Col xs={24} lg={9}><Card className={styles.panel} title="Bảo mật"><Space orientation="vertical" size={14}><Tag icon={<CheckCircleOutlined />} color="success">JWT session validation</Tag><Tag icon={<CheckCircleOutlined />} color="success">Role-based access control</Tag><Tag icon={<CheckCircleOutlined />} color="success">Refresh token rotation</Tag><Typography.Text type="secondary">Các API quản trị yêu cầu tài khoản ADMIN và Bearer token hợp lệ.</Typography.Text></Space></Card></Col></Row> }


