import FormWrapper from '@/components/Admin/Form/FormWrapper'
import FormInput from '@/components/Admin/Form/Input'
import FormTextarea from '@/components/Admin/Form/Textarea'
import IconPicker from '@/components/Admin/Form/IconPicker'
import { createTeam } from '../actions/team.action'
import FileUpload from '@/components/Admin/FileUpload'

const page = () => {
    return (
        <div className="w-full">
            <div className='md:-mt-4 mt-1'>
                <FormWrapper
                    action={createTeam}
                    buttonTitle="Create"
                    successMessage="About team create successfully"
                    href="/admin/about/team"
                >
                    <FileUpload />
                    <FormInput
                        label="Enter name"
                        required
                        name="name"
                        placeholder='Enter name'

                    />
                    <FormInput
                        label="Enter designation"
                        required
                        name="designation"
                        placeholder='Enter designation'
                    />

                    <FormTextarea
                        label='Enter description'
                        required
                        placeholder='Enter description'
                    />
                </FormWrapper>
            </div>
        </div>
    )
}

export default page