import type { ReactNode } from "react";
import { Card, Space, Statistic } from "antd";
import { adminStyles as styles } from "@/admin/theme/theme";

export function MetricCard({ title, value, subtitle, icon, color, background }: { title: string; value: string | number; subtitle?: string; icon: ReactNode; color: string; background: string }) {
  return <Card className={styles.metric}><Space align="start" className="w-full justify-between"><Statistic title={title} value={value} /><span className={styles.metricIcon} style={{ color, background }}>{icon}</span></Space>{subtitle && <div className={styles.muted}>{subtitle}</div>}</Card>;
}


