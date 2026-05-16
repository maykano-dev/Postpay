import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success"
  size?: "sm" | "md" | "lg" | "icon"
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const variants = {
      primary: "bg-honey text-black hover:bg-honey/90 shadow-[0_0_20px_rgba(245,166,35,0.15)]",
      secondary: "bg-surface text-white border border-border-bright hover:bg-card",
      outline: "bg-transparent border border-border-bright text-white hover:border-white",
      ghost: "bg-transparent text-secondary hover:text-white hover:bg-white/5",
      danger: "bg-red-buzz/10 text-red-buzz border border-red-buzz/20 hover:bg-red-buzz/20",
      success: "bg-green-buzz/10 text-green-buzz border border-green-dim hover:bg-green-buzz/20",
    }

    const sizes = {
      sm: "px-4 py-2 text-xs",
      md: "px-6 py-3 text-sm",
      lg: "px-8 py-4 text-base",
      icon: "p-2",
    }

    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
