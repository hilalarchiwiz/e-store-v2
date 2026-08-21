import FormWrapper from '@/components/Admin/Form/FormWrapper'
import { createWhatWeDo } from '../actions/whatwedo.action'
import FormInput from '@/components/Admin/Form/Input'
import FormTextarea from '@/components/Admin/Form/Textarea'
import FileUpload from '@/components/Admin/FileUpload'

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
                    <FileUpload title="Service image" />
                    <input type="hidden" name='type' value={'what_we_do'} readOnly />
                    <FormInput
                        label="Enter Title"
                        required
                        name="title"
                        placeholder="Laptops"

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
