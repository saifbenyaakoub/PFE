import React from "react";

export function Card({ children }) {
  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">{children}</div>
  );
}

export function Label({ children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-zinc-800">
      {children}
    </label>
  );
}

export function Input(props) {
  return (
    <input
      {...props}
      className={[
        "mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none",
        "border-zinc-200 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10",
        props.className || "",
      ].join(" ")}
    />
  );
}

export function Button({ children, loading, variant = "primary", ...props }) {
  const base =
    "w-full rounded-xl px-4 py-3 text-sm font-medium transition active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed";
  const styles =
    variant === "ghost"
      ? "border border-zinc-200 bg-white hover:bg-zinc-50"
      : "bg-zinc-900 text-white hover:bg-zinc-800";
  return (
    <button {...props} className={`${base} ${styles} ${props.className || ""}`}>
      {loading ? "Please wait..." : children}
    </button>
  );
}

export function Hint({ children }) {
  return <div className="mt-2 text-xs text-zinc-500">{children}</div>;
}

export function ErrorText({ children }) {
  if (!children) return null;
  return <div className="mt-2 text-xs text-red-600">{children}</div>;
}

export function Divider({ label }) {
  return (
    <div className="my-6 flex items-center gap-3">
      <div className="h-px flex-1 bg-zinc-200" />
      {label ? <div className="text-xs text-zinc-500">{label}</div> : null}
      <div className="h-px flex-1 bg-zinc-200" />
    </div>
  );
}

export function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700">
      {children}
    </span>
  );
}
