import { ReactNode } from "react";

interface HeaderProps {
  title: string;
  children?: ReactNode;
}

export function Header({ title, children }: HeaderProps) {
  return (
    <header className="bg-pokemon-dark border-b border-pokemon-border">
      <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="flex gap-4">
          {children}
        </div>
      </div>
    </header>
  );
}
