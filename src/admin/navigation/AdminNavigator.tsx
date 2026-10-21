import type { ModuleKey, ResourceModuleKey } from "@/admin/types";
import { DashboardScreen } from "@/admin/screens/dashboard/DashboardScreen";
import { ResourcesScreen } from "@/admin/screens/resources/ResourcesScreen";
import { SystemScreen } from "@/admin/screens/system/SystemScreen";

export function AdminNavigator({ module }: { module: ModuleKey }) {
  if (module === "dashboard") return <DashboardScreen />;
  if (module === "system") return <SystemScreen />;
  return <ResourcesScreen module={module as ResourceModuleKey} />;
}


