import { ReactNode } from "react";

interface CardProps {
  title: string;
  description: string;
  icon?: ReactNode;
  children?: ReactNode;
}

export function Card({ title, description, icon, children }: CardProps) {
  return (
    <div
      className="group transition-all hover:translate-y-[-2px]"
      style={{
        backgroundColor: "#141414",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "none",
        borderRadius: "var(--radius-lg)",
        padding: "24px",
      }}
    >
      {icon && (
        <div
          className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: "#f0f1fe", color: "#5E6AD2" }}
        >
          {icon}
        </div>
      )}
      <h3
        className="mb-2 font-semibold"
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-lg)",
          color: "#f1f2f4",
        }}
      >
        {title}
      </h3>
      <p
        className="leading-relaxed"
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-sm)",
          color: "#b4b5c0",
        }}
      >
        {description}
      </p>
      {children}
    </div>
  );
}
