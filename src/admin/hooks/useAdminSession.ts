"use client";

import { useEffect, useState } from "react";
import { request } from "@/admin/api/client";
import { authStorage } from "@/admin/utils/storage";
import type { AnyRow } from "@/admin/types";

export function useAdminSession() {
  const [ready, setReady] = useState(() => !authStorage.getAccess());
  const [user, setUser] = useState<AnyRow | null>(null);

  useEffect(() => {
    if (!authStorage.getAccess()) return;
    request("/auth/me").then(currentUser => {
      if (currentUser.role !== "ADMIN") throw new Error("Tài khoản không có quyền Admin");
      setUser(currentUser);
    }).catch(() => authStorage.clear()).finally(() => setReady(true));
  }, []);

  const logout = async () => {
    try { await request("/auth/logout", { method: "POST" }); } catch { /* Always clear the local session. */ }
    authStorage.clear();
    setUser(null);
  };

  return { ready, user, setUser, logout };
}
