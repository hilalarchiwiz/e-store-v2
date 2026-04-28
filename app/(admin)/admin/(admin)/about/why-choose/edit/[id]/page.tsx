import FormWrapper from '@/components/Admin/Form/FormWrapper'
import FormInput from '@/components/Admin/Form/Input'
import FormTextarea from '@/components/Admin/Form/Textarea'
import IconPicker from '@/components/Admin/Form/IconPicker'
import { getWhatWeDoById, updateWhatWeDo } from '../../../what-we-do/actions/whatwedo.action'

const page = async ({ params }: { params: { id: string } }) => {
    const { id } = await params;
    const { whatwedo } = await getWhatWeDoById(id);
    return (
        <div className="w-full">
            <div className='md:-mt-4 mt-1'>
                <FormWrapper
                    action={updateWhatWeDo.bind(null, whatwedo?.id)}
                    buttonTitle="Update"
                    successMessage="About Why Choose Update successfully"
                    href="/admin/about/why-choose"
                >
                    <IconPicker defaultValue={whatwedo?.icon} />
                    <FormInput
                        label="Enter Title"
                        required
                        name="title"
                        placeholder="Enter Title"
                        defaultValue={whatwedo?.title}

                    />
                    <FormTextarea
                        label="Enter  Short Description"
                        required
                        placeholder="Enter  Short Description"
                        defaultValue={whatwedo?.description}
                    />
                </FormWrapper>
            </div>
        </div>
    )
}

export default page