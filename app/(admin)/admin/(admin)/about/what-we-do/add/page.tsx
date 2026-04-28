import FormWrapper from '@/components/Admin/Form/FormWrapper'
import { createWhatWeDo } from '../actions/whatwedo.action'
import FormInput from '@/components/Admin/Form/Input'
import FormTextarea from '@/components/Admin/Form/Textarea'
import IconPicker from '@/components/Admin/Form/IconPicker'

const page = () => {
    return (
        <div className="w-full">
            <div className='md:-mt-4 mt-1'>
                <FormWrapper
                    action={createWhatWeDo}
                    buttonTitle="Create"
                    successMessage="About Who we do create successfully"
                    href="/admin/about/what-we-do"
                >
                    <IconPicker />
                    <input type="hidden" name='type' value={'what_we_do'} readOnly />
                    <FormInput
                        label="Enter Title"
                        required
                        name="title"
                        placeholder="Enter Who we are Title"

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