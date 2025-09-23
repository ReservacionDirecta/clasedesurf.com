interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]} ${className}`} />
  )
}

export function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="h-48 bg-gray-300"></div>
        <div className="p-6 space-y-4">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-300 rounded w-full"></div>
            <div className="h-3 bg-gray-300 rounded w-5/6"></div>
          </div>
          <div className="flex justify-between items-center">
            <div className="h-6 bg-gray-300 rounded w-20"></div>
            <div className="h-10 bg-gray-300 rounded w-32"></div>
          </div>
        </div>
      </div>
    </div>
  )
}