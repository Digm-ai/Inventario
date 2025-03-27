import { InputHTMLAttributes, forwardRef } from 'react';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  id: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    return (
      <div className="mb-4">
        <label htmlFor={id} className="block mb-2 font-medium text-gray-700">
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          className={`w-full px-3 py-2 border rounded-md ${
            error
              ? 'border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500'
              : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  id: string;
}

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    return (
      <div className="mb-4">
        <label htmlFor={id} className="block mb-2 font-medium text-gray-700">
          {label}
        </label>
        <textarea
          ref={ref}
          id={id}
          className={`w-full px-3 py-2 border rounded-md ${
            error
              ? 'border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500'
              : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

TextAreaField.displayName = 'TextAreaField';

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  id: string;
  options: Array<{ value: string; label: string }>;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, error, id, options, className = '', ...props }, ref) => {
    return (
      <div className="mb-4">
        <label htmlFor={id} className="block mb-2 font-medium text-gray-700">
          {label}
        </label>
        <select
          ref={ref}
          id={id}
          className={`w-full px-3 py-2 border rounded-md ${
            error
              ? 'border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500'
              : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
          } ${className}`}
          {...props}
        >
          <option value="">Seleccionar...</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

SelectField.displayName = 'SelectField';
