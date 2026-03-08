import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface Props {
  to: string;
  icon: ReactNode;
  label: string;
}

export function SidebarLink({ to, icon, label }: Props) {
  const { pathname } = useLocation();
  const active = pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
      )}
    >
      {icon}
      {label && <span>{label}</span>}
    </Link>
  );
}
