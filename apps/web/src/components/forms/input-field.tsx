'use client';

import { FieldError } from 'react-hook-form';

interface InputFieldProps {
  label: string;
  type?: string;
  register: any;
  name: string;
  defaultValue?: string;
  error?: FieldError;
  hidden?: boolean;
  placeholder?: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

export function InputField({
  label,
  type = 'text',
  register,
  name,
  defaultValue,
  error,
  hidden,
  placeholder,
  inputProps,
}: InputFieldProps) {
  return (
    <div className={hidden ? 'hidden' : 'flex flex-col gap-2 w-full md:w-1/4'}>
      <label className="text-xs text-gray-500">{label}</label>
      <input
        type={type}
        {...register(name)}
        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full focus:ring-primary-500 focus:outline-none"
        defaultValue={defaultValue}
        placeholder={placeholder}
        {...inputProps}
      />
      {error?.message && (
        <p className="text-xs text-red-400">{error.message}</p>
      )}
    </div>
  );
}

export default InputField;
