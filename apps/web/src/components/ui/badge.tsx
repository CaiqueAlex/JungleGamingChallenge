import * as React from "react"

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ')
}

const badgeVariants = {
  default: "border-transparent bg-green-500/80 text-white hover:bg-green-600/80",
  secondary: "border-transparent bg-blue-500/80 text-white hover:bg-blue-600/80",
  destructive: "border-transparent bg-red-500/80 text-white hover:bg-red-600/80",
  outline: "text-white border-white/20 bg-white/5 hover:bg-white/10",
}

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof badgeVariants
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div 
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        badgeVariants[variant],
        className
      )} 
      {...props} 
    />
  )
}

export { Badge }