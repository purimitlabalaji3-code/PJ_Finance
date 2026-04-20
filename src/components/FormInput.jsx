import React from 'react';
import { useApp } from '../context/AppContext';

const FormInput = ({
  label,
  id,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error,
  required = false,
  options = [],
  className = '',
  hint,
  ...props
}) => {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  const inputClass = `input-field ${isDark
    ? 'bg-dark-muted border-dark-border text-white placeholder-gray-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20'
    : 'bg-white border-light-border text-gray-900 placeholder-gray-400 focus:border-primary-blue focus:ring-2 focus:ring-blue-500/20'
  } ${error ? 'border-accent-red focus:border-accent-red focus:ring-red-500/20' : ''}`;

  const labelClass = `block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={id} className={labelClass}>
          {label} {required && <span className="text-accent-red">*</span>}
        </label>
      )}
      {type === 'select' ? (
        <select
          id={id}
          value={value}
          onChange={onChange}
          className={`${inputClass} cursor-pointer ${isDark ? 'bg-dark-muted' : 'bg-white'}`}
          {...props}
        >
          <option value="">Select {label}</option>
          {options.map(opt => (
            <option key={opt.value ?? opt} value={opt.value ?? opt}>
              {opt.label ?? opt}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${inputClass} resize-none min-h-[80px]`}
          {...props}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={inputClass}
          {...props}
        />
      )}
      {hint && !error && <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{hint}</p>}
      {error && <p className="text-xs text-accent-red mt-1">{error}</p>}
    </div>
  );
};

export default FormInput;
