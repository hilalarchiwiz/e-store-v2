import FormWrapper from '@/components/Admin/Form/FormWrapper'
import FormInput from '@/components/Admin/Form/Input'
import FormTextarea from '@/components/Admin/Form/Textarea'
import IconPicker from '@/components/Admin/Form/IconPicker'
import { createWhatWeDo } from '../../what-we-do/actions/whatwedo.action'

const page = () => {
    return (
        <div className="w-full">
            <div className='md:-mt-4 mt-1'>
                <FormWrapper
                    action={createWhatWeDo}
                    buttonTitle="Create"
                    successMessage="About Why Choose create successfully"
                    href="/admin/about/why-choose"
                >
                    <IconPicker />
                    <input type="hidden" name='type' value={'why_choose'} readOnly />
                    <FormInput
                        label="Enter Title"
                        required
                        name="title"
                        placeholder="Enter Title"

                    />
                    <FormTextarea
                        label="Enter  Short Description"
                        required
                        placeholder="Enter  Short Description"
                    />
                </FormWrapper>
            </div>
        </div>
    )
}

export default page