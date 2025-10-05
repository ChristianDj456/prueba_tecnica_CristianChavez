
interface SelectOption {
  value: string;
  label: string;
}
interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  options: SelectOption[];
  error?: string;
  onChange?: (value: string) => void;
}
export const Select = ({
  label,
  options,
  error,
  className = '',
  onChange,
  ...props
}: SelectProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };
  return <div className="mb-4">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>}
      <select className={`w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 ${className}`} onChange={handleChange} {...props}>
        <option value="">Seleccione...</option>
        {options.map(option => <option key={option.value} value={option.value}>
            {option.label}
          </option>)}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>;
};