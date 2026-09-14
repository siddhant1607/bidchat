"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTheme, ThemeMode } from "@/context/ThemeContext";
import { Sun, Moon, Laptop } from "lucide-react";

export default function ThemeToggle() {
  const { themeMode, isDark, setThemeMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options: { mode: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { mode: "system", label: "System", icon: <Laptop className="w-4 h-4" /> },
    { mode: "light", label: "Light", icon: <Sun className="w-4 h-4" /> },
    { mode: "dark", label: "Dark", icon: <Moon className="w-4 h-4" /> },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1.5 px-3 py-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#1E1E1E] dark:hover:bg-[#2A2A2A] text-slate-600 dark:text-slate-300 transition-colors"
        title="Theme settings (System / Light / Dark)"
      >
        {themeMode === "system" ? (
          <Laptop className="w-4 h-4" />
        ) : isDark ? (
          <Moon className="w-4 h-4" />
        ) : (
          <Sun className="w-4 h-4" />
        )}
        <span className="hidden sm:inline capitalize text-xs font-medium">
          {themeMode}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-[#1E1E1E] border border-slate-100 dark:border-transparent shadow-lg rounded-[20px] z-50 p-1.5 space-y-0.5 text-sm animate-in fade-in zoom-in-95 origin-top-right">
          {options.map((opt) => (
            <button
              key={opt.mode}
              onClick={() => {
                setThemeMode(opt.mode);
                setIsOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-[14px] text-left transition-colors ${
                themeMode === opt.mode
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300 font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#2A2A2A] hover:text-slate-900 dark:hover:text-white font-medium"
              }`}
            >
              <span className="shrink-0">{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
