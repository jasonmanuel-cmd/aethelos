'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  magnetic?: boolean;
}

const buttonStyles = {
  base: 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden',
  variants: {
    primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/30 active:from-blue-800 active:to-indigo-800',
    secondary: 'bg-white text-stone-900 border border-stone-200 shadow-sm hover:bg-stone-50 hover:border-stone-300 hover:shadow-md active:bg-stone-100',
    ghost: 'text-stone-600 hover:bg-stone-100 hover:text-stone-900 active:bg-stone-200',
    destructive: 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/25 hover:from-red-700 hover:to-rose-700 hover:shadow-xl hover:shadow-red-500/30 active:from-red-800 active:to-rose-800',
    outline: 'bg-transparent text-stone-700 border-2 border-stone-200 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 active:border-blue-600 active:bg-blue-100',
  },
  sizes: {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
    xl: 'px-8 py-4 text-lg gap-2.5',
  },
  loading: 'relative',
  fullWidth: 'w-full',
  magnetic: 'relative',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      magnetic = false,
      className,
      disabled,
      style,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <motion.button
        ref={ref}
        className={cn(
          buttonStyles.base,
          buttonStyles.variants[variant],
          buttonStyles.sizes[size],
          fullWidth && buttonStyles.fullWidth,
          isLoading && buttonStyles.loading,
          className
        )}
        style={style}
        disabled={isDisabled}
        whileHover={magnetic && !isDisabled ? { scale: 1.02 } : undefined}
        whileTap={!isDisabled ? { scale: 0.98 } : undefined}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        {...(props as any)}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
        <span
          className={cn(
            'absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-150%]',
            isLoading && 'animate-[shimmer_1.5s_infinite]'
          )}
        />
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export const IconButton = forwardRef<HTMLButtonElement, ButtonProps & { 'aria-label': string }>(
  (({ children, variant = 'ghost', size = 'md', className, 'aria-label': ariaLabel, ...props }, ref) => (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn('p-0 aspect-square', className)}
      aria-label={ariaLabel}
      {...(props as any)}
    >
      {children}
    </Button>
  ))
);

IconButton.displayName = 'IconButton';