import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'gaming'
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  pulse?: boolean
  icon?: React.ReactNode
}

const badgeVariants = {
  default: 'bg-neutral-light-gray text-neutral-darker',
  primary: 'bg-primary-500 text-white',
  secondary: 'bg-secondary-purple text-white',
  success: 'bg-success-500 text-white',
  warning: 'bg-warning-500 text-white',
  error: 'bg-error-500 text-white',
  gaming: 'bg-gradient-to-r from-accent-yellow to-primary-orange text-white shadow-lg border border-primary-orange-glow'
}

const badgeSizes = {
  sm: 'px-2 py-0.5 text-xs font-medium',
  md: 'px-2.5 py-1 text-sm font-medium',
  lg: 'px-3 py-1.5 text-base font-semibold'
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({
    className,
    variant = 'default',
    size = 'md',
    animated = false,
    pulse = false,
    icon,
    children,
    ...props
  }, ref) => {
    const baseClasses = cn(
      'inline-flex items-center gap-1 rounded-full font-medium transition-all duration-200',
      badgeVariants[variant],
      badgeSizes[size],
      pulse && 'animate-pulse',
      className
    )

    const content = (
      <>
        {icon && <span className="flex items-center">{icon}</span>}
        {children}
      </>
    )

    if (animated) {
      return (
        <motion.div
          ref={ref}
          className={baseClasses}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          {...props}
        >
          {content}
        </motion.div>
      )
    }

    return (
      <div ref={ref} className={baseClasses} {...props}>
        {content}
      </div>
    )
  }
)

Badge.displayName = 'Badge'

export { Badge }
