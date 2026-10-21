// Admin resources have heterogeneous API payloads; feature-specific models can narrow this base shape.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyRow = Record<string, any>;

export type ModuleKey =
  | "dashboard" | "users" | "invitations" | "templates" | "components" | "plans"
  | "subscriptions" | "withdrawals" | "gifts" | "affiliates" | "wishes" | "system";

export type ResourceModuleKey = Exclude<ModuleKey, "dashboard" | "system">;


