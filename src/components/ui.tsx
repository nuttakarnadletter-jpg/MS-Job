import type { ReactNode } from "react";

export function Section({
  title,
  help,
  children,
}: {
  title: string;
  help?: string;
  children: ReactNode;
}) {
  return (
    <div className="section">
      <h3>{title}</h3>
      {help ? <p className="help">{help}</p> : null}
      {children}
    </div>
  );
}

export function SwitchRow({
  label,
  impact,
  on,
  onToggle,
}: {
  label: string;
  impact: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="row">
      <div className="row-text">
        <label>{label}</label>
        <div className="impact">บนหน้าบ้าน: {impact}</div>
      </div>
      <button
        type="button"
        className={`switch${on ? " on" : ""}`}
        aria-pressed={on}
        onClick={onToggle}
      />
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
    </div>
  );
}
