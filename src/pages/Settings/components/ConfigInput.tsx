import React from 'react';

interface ConfigInputProps {
  label: string;
  value: string | undefined;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}

const ConfigInput: React.FC<ConfigInputProps> = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest block ml-1">{label}</label>
    <input 
      type={type} 
      value={value || ''} 
      onChange={e => onChange(e.target.value)} 
      placeholder={placeholder} 
      className="w-full px-5 py-3.5 bg-input-bg border border-border rounded-2xl text-sm opacity-90 text-foreground outline-none focus:ring-2 focus:ring-indigo-500/10 transition font-mono placeholder:opacity-40" 
    />
  </div>
);

export default ConfigInput;
