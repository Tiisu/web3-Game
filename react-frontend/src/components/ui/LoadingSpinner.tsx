import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'gaming' | 'dots' | 'pulse'
  className?: string
}

const spinnerSizes = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  className
}) => {
  if (variant === 'dots') {
    return (
      <div className={cn('flex space-x-1', className)}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={cn(
              'bg-primary-500 rounded-full',
              size === 'sm' ? 'w-2 h-2' : 
              size === 'md' ? 'w-3 h-3' :
              size === 'lg' ? 'w-4 h-4' : 'w-5 h-5'
            )}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <motion.div
        className={cn(
          'bg-primary-500 rounded-full',
          spinnerSizes[size],
          className
        )}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 1,
          repeat: Infinity
        }}
      />
    )
  }

  if (variant === 'gaming') {
    return (
      <div className={cn('relative', spinnerSizes[size], className)}>
        <motion.div
          className="absolute inset-0 border-4 border-primary-orange rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{
            borderTopColor: 'transparent',
            borderRightColor: 'transparent'
          }}
        />
        <motion.div
          className="absolute inset-1 border-2 border-accent-yellow rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          style={{
            borderBottomColor: 'transparent',
            borderLeftColor: 'transparent'
          }}
        />
      </div>
    )
  }

  // Default spinner
  return (
    <motion.div
      className={cn(
        'border-4 border-gray-200 border-t-primary-500 rounded-full',
        spinnerSizes[size],
        className
      )}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  )
}

export { LoadingSpinner }
