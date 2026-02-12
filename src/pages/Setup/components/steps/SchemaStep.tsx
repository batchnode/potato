import React from 'react';
import { Braces, CheckCircle2 } from 'lucide-react';
import { cn } from '../../../../utils/cn';
import type { SetupFormData } from '../../hooks/useSetupLogic';

interface SchemaStepProps {
  formData: SetupFormData;
  setFormData: (data: SetupFormData) => void;
}

const SchemaStep: React.FC<SchemaStepProps> = ({ formData, setFormData }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
          <Braces size={24} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Content Schema</h1>
      </header>
      <div className="flex gap-4">
        <button
          onClick={() => setFormData({ ...formData, schemaType: 'default' })}
          className={cn(
            "flex-1 p-8 rounded-[2rem] text-left border-4 transition duration-300",
            formData.schemaType === 'default'
              ? 'bg-indigo-600 text-white border-indigo-100 shadow-xl shadow-indigo-500/20'
              : 'bg-white border-slate-100 text-slate-600'
          )}
        >
          <CheckCircle2 className="mb-4" />
          <p className="font-bold">Default Schema</p>
        </button>
        <button
          onClick={() => setFormData({ ...formData, schemaType: 'custom' })}
          className={cn(
            "flex-1 p-8 rounded-[2rem] text-left border-2 transition duration-300",
            formData.schemaType === 'custom'
              ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-md'
              : 'bg-white border-slate-100 text-slate-600'
          )}
        >
          <Braces className="mb-4" />
          <p className="font-bold">Custom Schema</p>
        </button>
      </div>
    </div>
  );
};

export default SchemaStep;
