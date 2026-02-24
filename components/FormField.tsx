import { ReactNode } from "react";

type FormFieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
  required?: boolean;
};

export default function FormField({ label, htmlFor, error, children, required }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="text-xs uppercase tracking-[0.16em] text-sepia-900/85">
        {label} {required && <span className="text-red-700">*</span>}
      </label>
      {children}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
