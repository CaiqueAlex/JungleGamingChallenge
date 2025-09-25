  import * as React from "react"

  function cn(...classes: (string | undefined | false)[]) {
    return classes.filter(Boolean).join(' ')
  }

  function Skeleton({
    className,
    ...props
  }: React.HTMLAttributes<HTMLDivElement>) {
    return (
      <div
        className={cn(
          "animate-pulse rounded-md bg-white/10",
          className
        )}
        {...props}
      />
    )
  }

  export { Skeleton }