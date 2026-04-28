import React from 'react'

const WishlistSkeleton = () => {
    return (
        <div className="bg-white rounded-[10px] shadow-1 animate-pulse">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center py-8 px-10 border-b border-gray-100">
                    <div className="min-w-[83px] h-16 bg-gray-200 rounded"></div>
                    <div className="min-w-[387px] ml-4 h-6 bg-gray-200 rounded w-1/2"></div>
                    <div className="min-w-[205px] h-6 bg-gray-200 rounded w-20"></div>
                    <div className="min-w-[265px] h-6 bg-gray-200 rounded w-24"></div>
                </div>
            ))}
        </div>
    )
}

export default WishlistSkeleton