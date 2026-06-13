'use client';

import { forwardRef, TextareaHTMLAttributes } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'error' | 'success';
  errorMessage?: string;
  rows?: number;
}

const textareaStyles = {
  base: 'w-full px-4 py-3 text-base rounded-xl border-2 transition-all duration-200 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white resize-none',
  variants: {
    default: 'border-stone-200 bg-white hover:border-stone-300 focus:border-blue-500',
    error: 'border-red-300 bg-red-50 hover:border-red-400 focus:border-red-500',
    success: 'border-green-300 bg-green-50 hover:border-green-400 focus:border-green-500',
  },
  errorMessage: 'text-sm text-red-600 mt-1',
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (({ variant = 'default', errorMessage, rows = 4, className, ...props }, ref) => {
    return (
      <div className="relative">
        <textarea
          ref={ref}
          rows={rows}
          className={cn(textareaStyles.base, textareaStyles.variants[variant], className)}
          {...(props as any)}
        />
        {errorMessage && <p className={textareaStyles.errorMessage}>{errorMessage}</p>}
      </div>
    );
  })
);

Textarea.displayName = 'Textarea';

export const TextareaGroup = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('space-y-1', className)}>{children}</div>
);

export const TextareaLabel = forwardRef<HTMLLabelElement, { children: React.ReactNode; htmlFor: string; className?: string }>
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

TextareaLabel.displayName = 'TextareaLabel';