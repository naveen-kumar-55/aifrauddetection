import React, { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';

export default function DataTable({
  columns = [],
  data = [],
  onRowClick,
  searchable = false,
  searchPlaceholder = 'Search...',
  maxHeight = '400px',
  emptyText = 'No data available',
}) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const filtered = useMemo(() => {
    let rows = [...data];
    if (searchable && search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(row =>
        columns.some(col => String(row[col.key] ?? '').toLowerCase().includes(q))
      );
    }
    if (sortKey) {
      rows.sort((a, b) => {
        const av = a[sortKey], bv = b[sortKey];
        if (av == null) return 1;
        if (bv == null) return -1;
        const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return rows;
  }, [data, search, sortKey, sortDir, columns, searchable]);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div>
      {searchable && (
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="input-dark pl-9 text-xs"
          />
        </div>
      )}
      <div className="rounded-xl border border-white/6 overflow-hidden" style={{ maxHeight, overflowY: 'auto' }}>
        <table className="w-full text-left text-[11px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-white/4 border-b border-white/6">
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`px-3 py-2.5 font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none hover:text-slate-300 transition-colors ${col.align === 'right' ? 'text-right' : ''}`}
                  onClick={() => toggleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key && (
                      sortDir === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/4">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-3 py-8 text-center text-slate-600">{emptyText}</td>
              </tr>
            ) : (
              filtered.map((row, i) => (
                <tr
                  key={row.id || i}
                  className={`hover:bg-white/3 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map(col => (
                    <td key={col.key} className={`px-3 py-2.5 ${col.align === 'right' ? 'text-right' : ''} ${col.className || 'text-slate-300'}`}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
