import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outline" | "success" | "danger" | "honey"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-border-bright text-white",
    outline: "border border-border-bright text-secondary",
    success: "bg-green-dim text-green-buzz border border-green-dim",
    danger: "bg-red-dim text-red-buzz border border-red-dim",
    honey: "bg-honey-dim text-honey border border-honey-border",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
