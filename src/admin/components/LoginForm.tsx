import { Avatar, Card, Form, Input, Typography } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { ActionButton } from "@/admin/components/ActionButton";
import { adminStyles as styles } from "@/admin/theme/theme";

export type LoginValues = { email: string; password: string };

export function LoginForm({ loading, onSubmit }: { loading: boolean; onSubmit: (values: LoginValues) => void }) {
  return <section className={styles.loginCardWrap}><Card className={styles.loginCard} styles={{ body: { padding: 36 } }}><div className="mb-7"><Avatar size={48} icon={<LockOutlined />} className="mb-[18px] !bg-[#fff0f3] !text-[#f25f7c]" /><Typography.Title level={2} className="!m-0">Chào mừng trở lại</Typography.Title><Typography.Text type="secondary">Đăng nhập bằng tài khoản quản trị Wedify</Typography.Text></div><Form<LoginValues> layout="vertical" size="large" onFinish={onSubmit}><Form.Item label="Email" name="email" rules={[{ required: true, type: "email" }]}><Input prefix={<UserOutlined />} placeholder="admin@wedify.vn" /></Form.Item><Form.Item label="Mật khẩu" name="password" rules={[{ required: true }]}><Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu" /></Form.Item><ActionButton block type="primary" htmlType="submit" loading={loading} className="mt-2 !h-12">Đăng nhập quản trị</ActionButton></Form></Card></section>;
}


