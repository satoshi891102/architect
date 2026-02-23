import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

const fieldStyle = {
  fontFamily: "var(--font-body)",
  fontSize: "var(--text-sm)",
  color: "#f1f2f4",
  backgroundColor: "#141414",
  border: "1px solid #2e3040",
  borderRadius: "var(--radius-lg)",
  padding: "10px 14px",
  width: "100%",
  outline: "none",
  transition: "border-color 150ms ease",
};

export function Input({ label, error, hint, id, ...props }: InputProps) {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={fieldId}
        style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", fontWeight: 500, color: "#f1f2f4" }}
      >
        {label}
      </label>
      <input
        id={fieldId}
        style={{ ...fieldStyle, borderColor: error ? "#f87171" : "#2e3040" }}
        onFocus={(e) => (e.target.style.borderColor = "#5E6AD2")}
        onBlur={(e) => (e.target.style.borderColor = error ? "#f87171" : "#2e3040")}
        {...props}
      />
      {error && <span style={{ fontSize: "var(--text-xs)", color: "#f87171" }}>{error}</span>}
      {hint && !error && <span style={{ fontSize: "var(--text-xs)", color: "#6b6f76" }}>{hint}</span>}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function Textarea({ label, error, id, ...props }: TextareaProps) {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", fontWeight: 500, color: "#f1f2f4" }}>
        {label}
      </label>
      <textarea
        id={fieldId}
        rows={4}
        style={{ ...fieldStyle, resize: "vertical", borderColor: error ? "#f87171" : "#2e3040" }}
        onFocus={(e) => (e.target.style.borderColor = "#5E6AD2")}
        onBlur={(e) => (e.target.style.borderColor = error ? "#f87171" : "#2e3040")}
        {...props}
      />
      {error && <span style={{ fontSize: "var(--text-xs)", color: "#f87171" }}>{error}</span>}
    </div>
  );
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
}

export function SelectField({ label, options, id, ...props }: SelectFieldProps) {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", fontWeight: 500, color: "#f1f2f4" }}>
        {label}
      </label>
      <select id={fieldId} style={fieldStyle} {...props}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
