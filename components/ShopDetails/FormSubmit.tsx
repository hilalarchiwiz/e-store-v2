'use client'
import { ReactNode, useActionState, useEffect, useRef } from 'react'
import { SubmitButton } from './SubmitButton'
import toast from 'react-hot-toast'

interface FormProps {
    children: ReactNode
    // Adjusted signature to match useActionState requirements
    action: (prevState: any, formData: FormData) => Promise<any>
    title?: string
}

const FormSubmit = ({ children, action, title = 'Submit' }: FormProps) => {
    const formRef = useRef<HTMLFormElement>(null)

    // 1. Hook into the action state
    const [state, formAction, pending] = useActionState(action, null)
    console.log(state);
    // 2. Monitor state for Success/Error to trigger Toast
    useEffect(() => {
        if (!state) return

        if (state.success) {
            toast.success(state.message || "Success!")
            formRef.current?.reset()
        } else if (state.error) {
            const errorMessage = typeof state.error === 'string'
                ? state.error
                : "Validation failed";

            toast.error(errorMessage)
        } else {
            toast.error(state.message || "Error!")
        }
    }, [state])

    return (
        <form
            ref={formRef}
            action={formAction}
            className="space-y-5 p-5"
        >
            {children}

            {/* Pass pending state to your button for loading spinner */}
            <SubmitButton title={title} />
        </form>
    )
}

export default FormSubmit