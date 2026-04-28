import FormWrapper from '@/components/Admin/Form/FormWrapper'
import FormInput from '@/components/Admin/Form/Input'
import FormTextarea from '@/components/Admin/Form/Textarea'
import { getTeamById, updateTeam } from '../../actions/team.action'
import FileUpload from '@/components/Admin/FileUpload'

const page = async ({ params }: { params: { id: string } }) => {
    const { id } = await params;
    const { team } = await getTeamById(id);
    return (
        <div className="w-full">
            <div className='md:-mt-4 mt-1'>
                <FormWrapper
                    action={updateTeam.bind(null, team?.id)}
                    buttonTitle="Update"
                    successMessage="About Who we do Update successfully"
                    href="/admin/about/team"
                >
                    <FileUpload defaultImageUrl={team?.image} />
                    <FormInput
                        label="Enter name"
                        required
                        name="name"
                        placeholder='Enter name'
                        defaultValue={team?.name}

                    />
                    <FormInput
                        label="Enter designation"
                        required
                        name="designation"
                        placeholder='Enter designation'
                        defaultValue={team?.designation}
                    />

                    <FormTextarea
                        label="Enter  Short Description"
                        required
                        placeholder="Enter  Short Description"
                        defaultValue={team?.description}
                    />
                </FormWrapper>
            </div>
        </div>
    )
}

export default page