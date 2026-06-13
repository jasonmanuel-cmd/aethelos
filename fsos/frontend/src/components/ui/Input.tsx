'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'error' | 'success';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  errorMessage?: string;
}

const inputStyles = {
  base: 'w-full px-4 py-3 text-base rounded-xl border-2 transition-all duration-200 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white',
  variants: {
    default: 'border-stone-200 bg-white hover:border-stone-300 focus:border-blue-500',
    error: 'border-red-300 bg-red-50 hover:border-red-400 focus:border-red-500',
    success: 'border-green-300 bg-green-50 hover:border-green-400 focus:border-green-500',
  },
  icons: {
    left: 'left-3',
    right: 'right-3',
  },
  input: 'w-full bg-transparent',
  wrapper: 'relative',
  errorMessage: 'text-sm text-red-600 mt-1',
  icon: 'absolute top-1/2 transform -translate-y-1/2 text-stone-500',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (({ type = 'text', variant = 'default', leftIcon, rightIcon, errorMessage, className, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={cn(inputStyles.wrapper, className)}>
        {leftIcon && (
          <div className={cn(inputStyles.icon, inputStyles.icons.left)}>
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          id={inputId}
          className={cn(inputStyles.input, inputStyles.variants[variant])}
          {...(props as any)}
        />
        {rightIcon && (
          <div className={cn(inputStyles.icon, inputStyles.icons.right)}>
            {rightIcon}
          </div>
        )}
        {errorMessage && <p className={inputStyles.errorMessage}>{errorMessage}</p>}
      </div>
    );
  })
);

Input.displayName = 'Input';

export const InputGroup = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('space-y-1', className)}>{children}</div>
);

export const InputLabel = forwardRef<HTMLLabelElement, { children: React.ReactNode; htmlFor: string; className?: string }>
  (({ children, htmlFor, className, ...props }, ref) => (
    <label
      ref={ref}
      htmlFor={htmlFor}
      className={cn('block text-sm font-medium text-stone-700 mb-2', className)}
      {...(props as any)}
    >
      {children}
    </label>
  ));

InputLabel.displayName = 'InputLabel';