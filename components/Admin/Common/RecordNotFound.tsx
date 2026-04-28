import { Package } from 'lucide-react'
type Props = {
    search: string,
    message: string

}
const RecordNotFound = ({ message = "Record not found", subMessage = "Get started by creating your first" }) => {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{message}</h3>
            <p className="text-gray-500 text-sm mb-6">{subMessage}</p>
        </div>
    )
}

export default RecordNotFound