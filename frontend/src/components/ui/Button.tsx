import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-bold transition-all duration-200 focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none touch-target'
    
    const variants = {
      primary: 'btn-primary-marketplace',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 rounded-xl border-2 border-gray-300',
      outline: 'btn-outline-marketplace'
    }
    
    const sizes = {
      sm: 'h-10 px-4 text-sm min-h-[40px]',
      md: 'h-12 py-3 px-6 text-base min-h-[48px]',
      lg: 'h-14 px-8 text-lg min-h-[56px]'
    }
    
    return (
      <button
        className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button }