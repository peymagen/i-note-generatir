import React from "react";
import styles from "./DataTableLayout.module.css";

export interface Column<T> {
  key: keyof T;
  label: string;
  render?: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  title?: string;
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
}

function DataTableLayout<T>({
  title,
  columns,
  data,
  loading = false,
  error = "",
  emptyMessage = "No records found",
}: DataTableProps<T>) {
  return (
    <div className={styles.container}>
      {title && <h2 className={styles.header}>{title}</h2>}

      {error && <p className={styles.error}>{error}</p>}

      {loading ? (
        <div className={styles.loader}>Loading...</div>
      ) : data.length === 0 ? (
        <div className={styles.empty}>{emptyMessage}</div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={String(col.key)}>{col.label}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {data.map((row, index) => (
                <tr key={index}>
                  {columns.map((col) => (
                    <td key={String(col.key)}>
                      {col.render ? col.render(row) : (row[col.key] as any)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DataTableLayout;
