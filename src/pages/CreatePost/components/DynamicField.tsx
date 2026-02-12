import React from 'react';
import { Type, Calendar, Image as ImageIcon, CheckSquare, Hash } from 'lucide-react';

interface DynamicFieldProps {
  name: string;
  type: string;
  value: unknown;
  onChange: (val: unknown) => void;
}

const formatDate = (val: unknown): string => {
  if (!val) return '';

  // Handle Date objects
  if (val instanceof Date) {
    const year = val.getFullYear();
    const month = String(val.getMonth() + 1).padStart(2, '0');
    const day = String(val.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Handle ISO strings (e.g., "2024-01-15T00:00:00.000Z")
  if (typeof val === 'string' && val.includes('T')) {
    return val.split('T')[0];
  }

  // Handle already formatted dates or strings
  if (typeof val === 'string') {
    // Check if it's already in yyyy-MM-dd format
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      return val;
    }
    // Try to parse and format other date strings
    try {
      const date = new Date(val);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    } catch {
      // If parsing fails, return original value
      return val;
    }
  }

  return String(val);
};

const DynamicField: React.FC<DynamicFieldProps> = ({ name, type, value, onChange }) => {
  const label = name.charAt(0).toUpperCase() + name.slice(1);
  const cleanType = typeof type === 'string' ? type.toLowerCase() : 'string';
  const iconMap: Record<string, React.ReactNode> = {
    string: <Type size={16} />,
    date: <Calendar size={16} />,
    image: <ImageIcon size={16} />,
    boolean: <CheckSquare size={16} />,
    list: <Hash size={16} />
  };
  const currentIcon = iconMap[cleanType] || <Type size={16} />;

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest flex items-center gap-2 ml-1">
        {currentIcon} {label}
      </label>
      {cleanType === 'boolean' ? (
        <select
          value={value === true ? 'true' : 'false'}
          onChange={(event) => onChange(event.target.value === 'true')}
          className="w-full px-5 py-3 bg-input-bg border border-border rounded-2xl text-sm text-foreground outline-none appearance-none focus:ring-2 focus:ring-indigo-500/10 transition"
        >
          <option value="false">False</option>
          <option value="true">True</option>
        </select>
      ) : cleanType === 'date' ? (
        <input
          type="date"
          value={formatDate(value)}
          onChange={(event) => onChange(event.target.value)}
          className="w-full px-5 py-3 bg-input-bg border border-border rounded-2xl text-sm text-foreground outline-none focus:ring-2 focus:ring-indigo-500/10 transition"
        />
      ) : cleanType === 'list' ? (
        <input
          type="text"
          value={Array.isArray(value) ? (value as string[]).join(', ') : String(value || '')}
          onChange={(event) => onChange(event.target.value.split(',').map(s => s.trim()))}
          className="w-full px-5 py-3 bg-input-bg border border-border rounded-2xl text-sm text-foreground outline-none font-mono focus:ring-2 focus:ring-indigo-500/10 transition"
        />
      ) : (
        <input
          type="text"
          value={String(value || '')}
          onChange={(event) => onChange(event.target.value)}
          placeholder={`Enter ${name}...`}
          className="w-full px-5 py-3 bg-input-bg border border-border rounded-2xl text-sm text-foreground outline-none focus:ring-2 focus:ring-indigo-500/10 transition"
        />
      )}
    </div>
  );
};

export default DynamicField;
