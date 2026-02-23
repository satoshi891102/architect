interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
}

export function Table<T extends Record<string, unknown>>({ columns, data, onRowClick }: TableProps<T>) {
  return (
    <div
      className="overflow-hidden"
      style={{
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "var(--radius-lg)",
        backgroundColor: "#141414",
      }}
    >
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: "1px solid #2e3040" }}>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="text-left font-medium"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-xs)",
                  color: "#6b6f76",
                  padding: "12px 16px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              onClick={() => onRowClick?.(row)}
              className="transition-colors"
              style={{
                borderBottom: i < data.length - 1 ? "1px solid #2e3040" : "none",
                cursor: onRowClick ? "pointer" : "default",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0f1117")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "var(--text-sm)",
                    color: "#f1f2f4",
                    padding: "14px 16px",
                  }}
                >
                  {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
