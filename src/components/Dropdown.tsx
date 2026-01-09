"use client";

import { useEffect, useRef, useState } from "react";

export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
}

export interface DropdownGroup {
  label: string;
  items: DropdownItem[];
}

interface DropdownProps {
  items: (DropdownItem | DropdownGroup)[];
  trigger: React.ReactNode;
  theme?: "light" | "dark";
}

function isGroup(item: DropdownItem | DropdownGroup): item is DropdownGroup {
  return "items" in item;
}

export function Dropdown({ items, trigger, theme = "dark" }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }

    return undefined;
  }, [isOpen]);

  const isDark = theme === "dark";
  const bgClass = isDark ? "bg-gray-900" : "bg-white";
  const borderClass = isDark ? "border-gray-800" : "border-gray-200";
  const textClass = isDark ? "text-white" : "text-gray-900";
  const hoverClass = isDark ? "hover:bg-gray-800" : "hover:bg-gray-100";
  const groupLabelClass = isDark ? "text-gray-400" : "text-gray-600";

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)}>{trigger}</button>

      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-48 ${bgClass} border ${borderClass} rounded-lg shadow-lg z-50 overflow-hidden`}
        >
          {items.map((item, index) => {
            if (isGroup(item)) {
              return (
                <div key={item.label}>
                  {index > 0 && <div className={`h-px ${borderClass}`} />}
                  <div className={`px-4 py-2 text-xs font-semibold ${groupLabelClass} uppercase tracking-wider border-b ${borderClass}`}>
                    {item.label}
                  </div>
                  {item.items.map((groupItem) => (
                    <button
                      key={groupItem.id}
                      onClick={() => {
                        groupItem.onClick();
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 flex items-center gap-2 text-xs ${textClass} ${hoverClass} transition`}
                    >
                      {groupItem.icon && <span className="w-4 h-4">{groupItem.icon}</span>}
                      <span>{groupItem.label}</span>
                    </button>
                  ))}
                </div>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 flex items-center gap-2 ${textClass} ${hoverClass} transition`}
              >
                {item.icon && <span className="w-4 h-4">{item.icon}</span>}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
