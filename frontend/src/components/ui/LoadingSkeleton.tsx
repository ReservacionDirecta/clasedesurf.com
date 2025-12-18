export function LoadingSkeleton() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm animate-pulse">
      {/* Image Skeleton */}
      <div className="h-64 sm:h-72 bg-gray-200"></div>
      
      <div className="p-5">
        {/* Badges */}
        <div className="flex gap-2 mb-4">
          <div className="h-6 w-24 bg-gray-100 rounded-full"></div>
          <div className="h-6 w-20 bg-gray-100 rounded-full"></div>
        </div>
        
        {/* Title */}
        <div className="h-8 w-3/4 bg-gray-200 rounded-lg mb-3"></div>
        
        {/* Rating/Location */}
        <div className="flex items-center gap-2 mb-4">
           <div className="h-4 w-4 rounded-full bg-gray-100"></div>
           <div className="h-4 w-40 bg-gray-100 rounded"></div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 w-full mb-4"></div>

        {/* Details Rail */}
        <div className="flex justify-between items-center bg-gray-50 rounded-xl p-3 mb-4">
           <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
           <div className="h-10 w-px bg-gray-200"></div>
           <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
           <div className="h-10 w-px bg-gray-200"></div>
           <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
        </div>
        
        {/* Price & Button */}
        <div className="flex items-center justify-between gap-4 mt-6">
           <div className="flex flex-col gap-1">
             <div className="h-3 w-16 bg-gray-100 rounded"></div>
             <div className="h-8 w-28 bg-gray-200 rounded-lg"></div>
           </div>
           <div className="h-12 w-32 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    </div>
  )
}
