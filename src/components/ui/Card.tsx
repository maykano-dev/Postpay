import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { hovered?: boolean }
>(({ className, hovered = true, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-3xl border border-border-dim bg-surface p-6 transition-all duration-300",
      hovered && "hover:border-honey-border hover:bg-card-hover",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("syne text-xl font-bold tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-secondary font-light leading-relaxed", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

export { Card, CardTitle, CardDescription }
