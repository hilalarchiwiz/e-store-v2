import PageEditor from "@/components/Admin/Common/PageEditor";
import FormWrapper from "@/components/Admin/Form/FormWrapper";
import FileUpload from "@/components/Admin/FileUpload";
import FormInput from "@/components/Admin/Form/Input";
import FormTextarea from "@/components/Admin/Form/Textarea";
import { getBlog, updateBlog } from "../../actions/blog.action";
import { uploadToAzure } from "@/lib/azure-upload";
import { RoleGuard } from "@/components/Admin/Common/RoleGuard";

export default async function UpdateBlogPost({ params }: { params: { id: string } }) {
    const { id } = await params;
    const { blog } = await getBlog(id);
    return (
        <RoleGuard permission="blog_update">
            <FormWrapper
                action={updateBlog.bind(null, blog.id)}
                buttonTitle="Update Post"
                href="/admin/blog"
                successMessage="Blog post created successfully"
            >
                <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 dark:bg-slate-950 -mt-6">
                    {/* MAIN CONTENT AREA (75%) */}
                    <div className="flex-1 p-6 ">
                        <input
                            type="text"
                            name="title"
                            placeholder="Post Title"
                            defaultValue={blog?.title}
                            className="w-full text-4xl font-extrabold bg-transparent outline-none mb-8 text-slate-900 dark:text-white border-b border-transparent focus:border-emerald-500 pb-2"
                        />
                        <PageEditor initialContent={blog?.content} uploadToAzure={uploadToAzure} />
                    </div>

                    {/* ADMIN SIDEBAR (25%) */}
                    <aside className="w-full lg:w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6  space-y-8">
                        <FileUpload defaultImageUrl={blog?.image} />

                        <FormInput
                            name="tag"
                            label="Tag"
                            type="text"
                            defaultValue={blog?.tag || ''}
                        />
                        <FormTextarea
                            label="Short Description"
                            required
                            defaultValue={blog?.description}
                        />
                    </aside>
                </div>
            </FormWrapper>
        </RoleGuard>
    )
}