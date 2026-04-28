import React from 'react'

const Card = ({
    children
}: {
    children: React.ReactNode;
}) => {
    return (
        <div className="px-4 py-8">
            {/* Form Container */}
            <div className="w-full bg-white rounded-xl overflow-hidden">
                <div className="py-2">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default Card