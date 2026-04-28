'use client'
import { CategoryResponse } from '@/app/(admin)/admin/(admin)/(category)/(actions)/category.action'
import { ReactNode } from 'react'

interface FormProps {
    children: ReactNode
    action: (formData: FormData, id?: number | undefined) => void,
    id?: number
}

const Form = ({ children, action, id }: FormProps) => {
    return (
        <form action={async (formData) => { await action(formData, id); }} className="space-y-5 p-5">
            {children}
        </form>
    )
}

export default Form