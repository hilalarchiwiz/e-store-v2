import React from 'react'

type Props = {
    title: string
}
const SubTitle = ({ title }: Props) => {
    return (
        <p className="text-gray-600">{title}</p>
    )
}

export default SubTitle