import { Plus } from 'lucide-react'
import Link from 'next/link'

type Props = {
    title: string;
    url: string;
}

const AddButton = ({ title, url }: Props) => {
    return (
        <div className="mb-6 flex justify-end">
            <Link href={url}>
                <button className="bg-emerald-600 cursor-pointer hover:bg-emerald-700 text-white px-6 py-2.5 rounded-md flex items-center gap-2 font-medium transition-colors">
                    + {title}
                </button>
            </Link>
        </div>
    )
}

export default AddButton