"use client";

import { useState } from "react";
import { LoginForm, type LoginValues } from "@/admin/components/LoginForm";
import { LoginHero } from "@/admin/components/LoginHero";
import { adminStyles as styles } from "@/admin/theme/theme";
import { request } from "@/admin/api/client";
import { adminMessage as message } from "@/admin/utils/message";
import { authStorage } from "@/admin/utils/storage";
import type { AnyRow } from "@/admin/types";

export function LoginScreen({ onLogin }: { onLogin: (user: AnyRow) => void }) {
  const [loading, setLoading] = useState(false);
  const submit = async (values: LoginValues) => {
    setLoading(true);
    try {
      const data = await request("/auth/login", { method: "POST", body: JSON.stringify(values) });
      if (data.user.role !== "ADMIN") throw new Error("Tài khoản không có quyền truy cập Admin");
      authStorage.setTokens(data.accessToken, data.refreshToken);
      onLogin(data.user);
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };
  return <div className={styles.login}><LoginHero /><LoginForm loading={loading} onSubmit={submit} /></div>;
}


