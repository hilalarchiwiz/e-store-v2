'use client'
import { ReactNode } from 'react'

interface FormProps {
    children: ReactNode
    action: (...args: never[]) => unknown
    id?: number
}

const Form = ({ children, action, id }: FormProps) => {
    return (
        <form action={async (formData) => { await (action as (formData: FormData, id?: number) => unknown)(formData, id); }} className="space-y-5 p-5">
            {children}
        </form>
    )
}

export default Form