
type Col<T> = { key: keyof T | string; header: string; render?: (row: T) => React.ReactNode }

export default function Table<T extends { id: string }>({ columns, rows }: { columns: Col<T>[]; rows: T[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            {columns.map((c) => (
              <th
                key={String(c.key)}
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700"
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-4 text-center text-sm text-gray-500">
                No hay datos disponibles
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={(r as any).id} className="hover:bg-gray-50">
                {columns.map((c) => (
                  <td key={String(c.key)} className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {c.render ? c.render(r) : (r as any)[c.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
