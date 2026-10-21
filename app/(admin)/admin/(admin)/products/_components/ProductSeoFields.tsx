"use client";

import FormTextarea from "@/components/Admin/Form/Textarea";

type ProductSeoFieldsProps = {
  metaDescription?: string | null;
  metaKeywords?: string | null;
  onChange?: (values: { metaDescription?: string; metaKeywords?: string }) => void;
};

export default function ProductSeoFields({
  metaDescription,
  metaKeywords,
  onChange,
}: ProductSeoFieldsProps) {
  return (
    <section className="space-y-4" aria-labelledby="product-seo-heading">
      <h2 id="product-seo-heading" className="text-xl font-bold text-gray-800">Search Engine Optimization</h2>
      <p className="text-sm text-gray-500">
        Enter text only. Leave the description blank to use the product description automatically.
      </p>
      <FormTextarea
        label="Meta description"
        name="metaDescription"
        defaultValue={metaDescription || ""}
        onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => onChange?.({ metaDescription: event.target.value })}
        placeholder="Buy this product at Qaam.pk with nationwide delivery in Pakistan."
      />
      <p className="text-sm text-gray-500">Aim for about 150–160 characters for the description.</p>
      <FormTextarea
        label="Meta keywords"
        name="metaKeywords"
        defaultValue={metaKeywords || ""}
        onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => onChange?.({ metaKeywords: event.target.value })}
        placeholder="Product name, product price in Pakistan, brand, model"
      />
      <p className="text-sm text-gray-500">Separate keywords with commas.</p>
    </section>
  );
}
