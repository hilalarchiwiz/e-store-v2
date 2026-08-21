import FormWrapper from "@/components/Admin/Form/FormWrapper";
import FormInput from "@/components/Admin/Form/Input";
import FormTextarea from "@/components/Admin/Form/Textarea";
import FileUpload from "@/components/Admin/FileUpload";
import {
  getWhatWeDoById,
  updateWhatWeDo,
} from "../../../what-we-do/actions/whatwedo.action";

const page = async ({ params }: { params: { id: string } }) => {
  const { id } = await params;
  const response = await getWhatWeDoById(id);
  const whatwedo = response?.whatwedo;
  const currentImage = whatwedo?.icon && (
    whatwedo.icon.startsWith('/') ||
    whatwedo.icon.startsWith('http://') ||
    whatwedo.icon.startsWith('https://')
  ) ? whatwedo.icon : undefined;
  return (
    <div className="w-full">
      <div className="md:-mt-4 mt-1">
        <FormWrapper
          action={updateWhatWeDo.bind(null, whatwedo?.id as any)}
          buttonTitle="Update"
          successMessage="About Who we do Update successfully"
          href="/admin/about/mission-vision"
        >
          <FileUpload title="Mission or vision image" defaultImageUrl={currentImage} />
          <FormInput
            label="Enter Title"
            required
            name="title"
            placeholder="Our Mission"
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
  );
};

export default page;
