import { Spin } from "antd";

export function LoadingState({ fullscreen = false }: { fullscreen?: boolean }) {
  return <div className={fullscreen ? "grid min-h-screen place-items-center" : "grid min-h-48 place-items-center"}><Spin size="large" /></div>;
}


