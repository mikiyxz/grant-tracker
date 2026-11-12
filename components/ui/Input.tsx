import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export default function Input({ label, error, id, name, ...props }: Props) {
  const inputId = id ?? name;
  return (
    <div>
      <label htmlFor={inputId} className="block text-base font-medium text-gray-800 mb-1">
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        className={`w-full rounded-md border px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-green-600 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
