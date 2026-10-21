"use client";

import { useCallback, useEffect, useState } from "react";
import { request } from "@/admin/api/client";
import { resourceEndpoints } from "@/admin/api/resources";
import type { AnyRow, ResourceModuleKey } from "@/admin/types";
import { adminMessage as message } from "@/admin/utils/message";

export function useResource(module: ResourceModuleKey) {
  const [data, setData] = useState<AnyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    const query = (module === "users" || module === "invitations") && search ? `?search=${encodeURIComponent(search)}` : "";
    request(resourceEndpoints[module] + query).then(result => setData(Array.isArray(result) ? result : result.items || [])).catch(error => message.error(error.message)).finally(() => setLoading(false));
  }, [module, search]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const mutate = async (path: string, body: AnyRow) => {
    try { await request(path, { method: "PATCH", body: JSON.stringify(body) }); message.success("Đã cập nhật"); load(); }
    catch (error) { message.error((error as Error).message); }
  };

  const remove = async (record: AnyRow) => {
    const prefix = module === "templates" || module === "components" ? `/${module}` : `/admin/${module}`;
    try { await request(`${prefix}/${record.id}`, { method: "DELETE" }); message.success("Đã xóa dữ liệu"); load(); }
    catch (error) { message.error((error as Error).message); }
  };

  return { data, loading, load, mutate, remove, setSearch };
}
