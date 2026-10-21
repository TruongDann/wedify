import { Tag } from "antd";

export function ActionStat({ label, value }: { label: string; value: number }) {
  return <div className="flex items-center justify-between rounded-[14px] border border-[#edf0f5] p-4"><span>{label}</span><Tag color={value ? "magenta" : "green"}>{value}</Tag></div>;
}


