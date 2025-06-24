import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  variant?: 'default' | 'gaming' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  showValue?: boolean
  label?: string
  glow?: boolean
}

const progressVariants = {
  default: 'bg-primary-500',
  gaming: 'bg-gradient-to-r from-accent-yellow via-primary-orange to-accent-red',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  error: 'bg-error-500'
}

const progressSizes = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4'
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({
    className,
    value,
    max = 100,
    variant = 'default',
    size = 'md',
    animated = true,
    showValue = false,
    label,
    glow = false,
    ...props
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    const trackClasses = cn(
      'relative w-full bg-neutral-light-gray rounded-full overflow-hidden',
      progressSizes[size],
      className
    )

    const fillClasses = cn(
      'h-full rounded-full transition-all duration-500 ease-out',
      progressVariants[variant],
      glow && variant === 'gaming' && 'shadow-lg shadow-primary-orange-glow/50'
    )

    return (
      <div ref={ref} className="w-full space-y-2" {...props}>
        {(label || showValue) && (
          <div className="flex justify-between items-center text-sm">
            {label && <span className="font-medium text-neutral-darker">{label}</span>}
            {showValue && (
              <span className="text-neutral-gray">
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        )}
        
        <div className={trackClasses}>
          {animated ? (
            <motion.div
              className={fillClasses}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {variant === 'gaming' && glow && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                  animate={{
                    x: ['-100%', '100%']
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                />
              )}
            </motion.div>
          ) : (
            <div
              className={fillClasses}
              style={{ width: `${percentage}%` }}
            />
          )}
        </div>
      </div>
    )
  }
)

Progress.displayName = 'Progress'

export { Progress }
