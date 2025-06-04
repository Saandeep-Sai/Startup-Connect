import * as React from 'react';
import { cn } from '@/lib/utils';
import sanitizeHtml from 'sanitize-html';

interface InputProps extends React.ComponentProps<'input'> {
  as?: 'input';
  variant?: 'default' | 'outline' | 'filled';
}

interface TextareaProps extends React.ComponentProps<'textarea'> {
  as: 'textarea';
  variant?: 'default' | 'outline' | 'filled';
}

type CombinedProps = InputProps | TextareaProps;

const Input = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  CombinedProps
>(({ as = 'input', className, variant = 'default', value, onChange, ...props }, ref) => {
  const variantStyles = {
    default: 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800',
    outline: 'border-2 border-blue-500 dark:border-blue-400 bg-transparent',
    filled: 'border-none bg-gray-100 dark:bg-gray-700'
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (onChange) {
      const sanitizedValue = sanitizeHtml(e.target.value, { allowedTags: [] });
      onChange({ ...e, target: { ...e.target, value: sanitizedValue } } as never);
    }
  };

  const commonStyles = cn(
    'flex w-full rounded-lg px-4 py-2 text-base',
    'transition-all duration-200',
    'text-gray-900 dark:text-gray-100',
    'placeholder:text-gray-500 dark:placeholder:text-gray-400',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900',
    'disabled:cursor-not-allowed disabled:opacity-50',
    as === 'textarea' && 'resize-y h-24',
    as === 'input' && 'h-11',
    variantStyles[variant],
    className
  );

  return as === 'textarea' ? (
    <textarea
      ref={ref as React.Ref<HTMLTextAreaElement>}
      className={commonStyles}
      value={value}
      onChange={handleChange}
      {...(props as React.ComponentProps<'textarea'>)}
    />
  ) : (
    <input
      ref={ref as React.Ref<HTMLInputElement>}
      className={commonStyles}
      value={value}
      onChange={handleChange}
      {...(props as React.ComponentProps<'input'>)}
    />
  );
});

Input.displayName = 'Input';

export { Input };