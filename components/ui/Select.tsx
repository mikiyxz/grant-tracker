import type { SelectHTMLAttributes } from "react";

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: { value: string; label: string }[];
  error?: string;
};

export default function Select({ label, options, error, id, name, ...props }: Props) {
  const selectId = id ?? name;
  return (
    <div>
      <label htmlFor={selectId} className="block text-base font-medium text-gray-800 mb-1">
        {label}
      </label>
      <select
        id={selectId}
        name={name}
        className={`w-full rounded-md border bg-white px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-green-600 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
