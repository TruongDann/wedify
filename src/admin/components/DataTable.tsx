import { Table, type TableProps } from "antd";

export function DataTable<T extends object>(props: TableProps<T>) {
  return <Table<T> rowKey="id" {...props} />;
}


