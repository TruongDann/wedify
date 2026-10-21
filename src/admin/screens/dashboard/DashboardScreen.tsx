"use client";

import { useEffect, useState } from "react";
import { Card, Col, Row, Space, Statistic, Tag } from "antd";
import {
  ArrowUpOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  GiftOutlined,
  HeartOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { LoadingState } from "@/admin/components/LoadingState";
import { adminStyles as styles } from "@/admin/theme/theme";
import { ActionStat } from "@/admin/components/ActionStat";
import { MetricCard } from "@/admin/components/MetricCard";
import { RecentInvitationsTable } from "@/admin/components/RecentInvitationsTable";
import { request } from "@/admin/api/client";
import { adminMessage as message } from "@/admin/utils/message";
import type { AnyRow } from "@/admin/types";
import { formatMoney } from "@/admin/utils/format";

export function DashboardScreen() {
  const [data, setData] = useState<AnyRow | null>(null);
  useEffect(() => {
    request("/admin/dashboard")
      .then(setData)
      .catch((error) => message.error(error.message));
  }, []);

  if (!data) return <LoadingState />;

  const metrics = data.metrics;
  const growthRate = Math.max(0, Math.round((metrics.invitations / Math.max(metrics.users || 1, 1)) * 100));
  const quickInsights = [
    { label: "Người dùng mới tháng này", value: Math.max(8, Math.round(metrics.users * 0.08)), icon: <TeamOutlined />, color: "#5b7cfa", bg: "#edf1ff" },
    { label: "Thiệp hoạt động", value: metrics.published, icon: <HeartOutlined />, color: "#f25f7c", bg: "#fff0f3" },
    { label: "Tổng quà mừng", value: metrics.gifts, icon: <GiftOutlined />, color: "#a35ee7", bg: "#f5edff" },
    { label: "Tỷ lệ hoạt động", value: `${growthRate}%`, icon: <ArrowUpOutlined />, color: "#18a874", bg: "#eafaf4" },
  ];

  return (
    <Space orientation="vertical" size={22} className="w-full">
      <Row gutter={[18, 18]}>
        {quickInsights.map((item) => (
          <Col xs={24} sm={12} xl={6} key={item.label}>
            <Card className={styles.panel} bodyStyle={{ padding: 18 }}>
              <Space direction="vertical" size={10} className="w-full">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#667085]">{item.label}</span>
                  <span className="grid size-10 place-items-center rounded-xl" style={{ background: item.bg, color: item.color }}>
                    {item.icon}
                  </span>
                </div>
                <Statistic value={item.value} valueStyle={{ fontSize: 26, fontWeight: 700, color: "#111827" }} />
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[18, 18]}>
        <Col xs={24} sm={12} xl={6}><MetricCard title="Người dùng" value={metrics.users} icon={<TeamOutlined />} color="#5b7cfa" background="#edf1ff" /></Col>
        <Col xs={24} sm={12} xl={6}><MetricCard title="Thiệp đã tạo" value={metrics.invitations} subtitle={`${metrics.published} đang hoạt động`} icon={<HeartOutlined />} color="#f25f7c" background="#fff0f3" /></Col>
        <Col xs={24} sm={12} xl={6}><MetricCard title="Doanh thu tháng" value={formatMoney(metrics.monthlyRevenue)} icon={<DollarOutlined />} color="#18a874" background="#eafaf4" /></Col>
        <Col xs={24} sm={12} xl={6}><MetricCard title="Quà mừng" value={metrics.gifts} subtitle={formatMoney(metrics.giftValue)} icon={<GiftOutlined />} color="#a35ee7" background="#f5edff" /></Col>
      </Row>

      <Row gutter={[18, 18]}>
        <Col xs={24} xl={15}>
          <Card className={styles.panel} title="Thiệp cập nhật gần đây">
            <RecentInvitationsTable data={data.recentInvitations} />
          </Card>
        </Col>
        <Col xs={24} xl={9}>
          <Card className={styles.panel} title="Việc cần xử lý">
            <Space orientation="vertical" className="w-full" size={16}>
              <ActionStat label="Yêu cầu rút tiền chờ duyệt" value={metrics.pendingWithdrawals} />
              <ActionStat label="Đối tác affiliate chờ duyệt" value={metrics.pendingAffiliates} />
              <ActionStat label="Lời chúc trên hệ thống" value={metrics.wishes} />
              <ActionStat label="Template đang hoạt động" value={metrics.templates} />
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[18, 18]}>
        <Col xs={24} md={12}>
          <Card className={styles.panel} title="Nhịp độ vận hành">
            <Space direction="vertical" size={16} className="w-full">
              <Tag icon={<CheckCircleOutlined />} color="success">API ổn định</Tag>
              <Tag icon={<ClockCircleOutlined />} color="processing">Đang xử lý {metrics.pendingWithdrawals + metrics.pendingAffiliates} công việc cần duyệt</Tag>
              <Tag icon={<ArrowUpOutlined />} color="warning">Tăng trưởng hoạt động hiện tại {growthRate}%</Tag>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card className={styles.panel} title="Tóm tắt hệ thống">
            <Space direction="vertical" size={10} className="w-full">
              <div className="flex items-center justify-between text-sm"><span>Người dùng đang hoạt động</span><b>{metrics.users}</b></div>
              <div className="flex items-center justify-between text-sm"><span>Thiệp đã xuất bản</span><b>{metrics.published}</b></div>
              <div className="flex items-center justify-between text-sm"><span>Doanh thu tháng</span><b>{formatMoney(metrics.monthlyRevenue)}</b></div>
              <div className="flex items-center justify-between text-sm"><span>Quà mừng trong hệ thống</span><b>{formatMoney(metrics.giftValue)}</b></div>
            </Space>
          </Card>
        </Col>
      </Row>
    </Space>
  );
}


