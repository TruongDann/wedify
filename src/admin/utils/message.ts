import type { MessageInstance } from "antd/es/message/interface";

let instance: MessageInstance | null = null;

export function bindAdminMessage(message: MessageInstance | null) {
  instance = message;
}

export const adminMessage = {
  error(content: string) {
    return instance?.error(content);
  },
  success(content: string) {
    return instance?.success(content);
  },
};


