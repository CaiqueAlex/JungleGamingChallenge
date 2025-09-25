import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"

interface CardProps {
  children: React.ReactNode
  gradient?: boolean
  hover?: boolean
  className?: string
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ')
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, gradient = false, hover = true }, ref) => {
    const MotionDiv = motion.div as React.ForwardRefExoticComponent<HTMLMotionProps<"div"> & React.RefAttributes<HTMLDivElement>>

    return (
      <MotionDiv
        ref={ref}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        whileHover={hover ? { y: -5, scale: 1.02 } : {}}
        className={cn(
          "bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl",
          gradient && "bg-gradient-to-br from-white/15 to-white/5",
          hover && "transition-all duration-300 hover:shadow-green-500/20 hover:border-white/30",
          className
        )}
      >
        {children}
      </MotionDiv>
    )
  }
)

const CardHeader = React.forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string }>(
  ({ className, children }, ref) => (
    <div ref={ref} className={cn("p-6 pb-3", className)}>
      {children}
    </div>
  )
)

const CardContent = React.forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string }>(
  ({ className, children }, ref) => (
    <div ref={ref} className={cn("p-6 pt-3", className)}>
      {children}
    </div>
  )
)

const CardTitle = React.forwardRef<HTMLHeadingElement, { children: React.ReactNode; className?: string }>(
  ({ className, children }, ref) => (
    <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)}>
      {children}
    </h3>
  )
)

const CardDescription = React.forwardRef<HTMLParagraphElement, { children: React.ReactNode; className?: string }>(
  ({ className, children }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)}>
      {children}
    </p>
  )
)

Card.displayName = "Card"
CardHeader.displayName = "CardHeader"
CardContent.displayName = "CardContent"
CardTitle.displayName = "CardTitle"
CardDescription.displayName = "CardDescription"

export { Card, CardHeader, CardContent, CardTitle, CardDescription }