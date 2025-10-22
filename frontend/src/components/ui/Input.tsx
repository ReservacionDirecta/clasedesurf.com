import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error = false, ...props }, ref) => {
    const baseClasses = 'input-marketplace'
    const errorClasses = error ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : ''
    
    return (
      <input
        className={`${baseClasses} ${errorClasses} ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

export { Input }