import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger";

const variants: Record<Variant, string> = {
  primary: "bg-green-600 text-white hover:bg-green-700",
  secondary: "bg-white text-gray-800 border border-gray-300 hover:bg-gray-50",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

export const buttonBase =
  "inline-flex items-center justify-center rounded-md px-4 py-2.5 text-base font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

// class string so links can look like buttons too
export function buttonClass(variant: Variant = "primary", extra = "") {
  return `${buttonBase} ${variants[variant]} ${extra}`.trim();
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant };

export default function Button({
  variant = "primary",
  className = "",
  ...props
}: Props) {
  return <button className={buttonClass(variant, className)} {...props} />;
}
