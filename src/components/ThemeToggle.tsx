"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

const THEMES = { light: "cupcake", dark: "dim" };

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("gramma-theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = stored || (prefersDark ? "dark" : "light");
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", THEMES[initial]);
  }, []);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("gramma-theme", next);
    document.documentElement.setAttribute("data-theme", THEMES[next]);
  };

  if (!mounted) return <div className="w-10 h-10" />;

  return (
    <button
      onClick={toggle}
      className="btn btn-ghost btn-circle btn-sm"
      title={theme === "light" ? "Modalità scura" : "Modalità chiara"}
    >
      {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
