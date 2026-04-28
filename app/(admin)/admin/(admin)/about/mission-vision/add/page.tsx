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
                    successMessage="About Mission Vision create successfully"
                    href="/admin/about/mission-vision"
                >
                    <IconPicker />
                    <input type="hidden" name='type' value={'mission_vision'} readOnly />
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