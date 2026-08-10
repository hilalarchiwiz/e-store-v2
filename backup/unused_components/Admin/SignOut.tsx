'use client'
import { signOut } from '@/lib/auth-client'
import { logoutUser } from '@/redux/features/user-slice';
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';

const SignOut = () => {
    const router = useRouter();
    const dispatch = useDispatch()
    const handleSignOut = async () => {
        const { error } = await signOut()
        if (error) {
            toast.error(error.message || 'error message')
        } else {
            dispatch(logoutUser())
            router.push("/register")
        }
    }
    return (
        <button onClick={handleSignOut} className="w-full text-left text-sm font-medium flex items-center p-2 rounded-md hover:bg-green-50 transition-colors">
            <LogOut className="w-5 h-5 mr-3" />
            Logout
        </button>
    )
}

export default SignOut