import RichTextEditor from './RichTextEditor';

interface AdditionalInfoProps {
    defaultValue?: string | null;
    title?: string | null;
    name?: string;
    onChange?: (content: string) => void; // Add this
}

const AdditionalInfo = ({ defaultValue, title = "Additional Information", name = "additional_information", onChange }: AdditionalInfoProps) => {
    return (
        <div className=" py-6">
            <h2 className="text-sm font-semibold text-gray-800 mb-6">{title}</h2>

            <div className="">
                <RichTextEditor
                    name={name}
                    defaultValue={defaultValue}
                    onChange={onChange} // Pass it down
                    placeholder="Describe technical details, shipping info, or return policies..."
                />
            </div>
        </div>
    );
}

export default AdditionalInfo;