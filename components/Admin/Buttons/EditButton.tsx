import { Pencil } from 'lucide-react'
import Link from 'next/link'

type Props = {
    url: string
}
const EditButton = ({ url }: Props) => {
    return (
        <Link href={url} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
            <Pencil className="w-4 h-4" />
        </Link>
    )
}

export default EditButton