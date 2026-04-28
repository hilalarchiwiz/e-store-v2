import { getTopProducts } from "@/app/(admin)/admin/actions/dashboard";
import { Eye } from "lucide-react";
import Image from "next/image";

export default async function TopProducts() {
    const result = await getTopProducts();

    if (!result.success) {
        return <div>Error loading top products</div>;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Viewed Products</h2>

            <div className="space-y-4">
                {result.products.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No product data available</p>
                ) : (
                    result.products.map((product, index) => {
                        const discountPercent = product.discountedPrice && product.discountedPrice > 0 ? product.discountedPrice : null;
                        const displayPrice = discountPercent ? product.price - (product.price * discountPercent) / 100 : product.price;
                        return (

                            <div key={product.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                <span className="text-lg font-bold text-gray-400 w-6">{index + 1}</span>

                                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                                    {product.images[0] && (
                                        <Image
                                            src={product.images[0]}
                                            alt={product.title}
                                            fill
                                            className="object-cover"
                                        />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0 overflow-hidden">
                                    <h3 className="text-sm font-medium text-gray-900 truncate whitespace-nowrap overflow-hidden text-ellipsis">{product.title}</h3>
                                    <p className="text-xs text-gray-500">{product.category?.title}</p>
                                </div>

                                <div className="text-right flex-shrink-0">
                                    <div className="text-lg font-bold text-gray-900">
                                        Rs. {displayPrice || product.price}
                                        <p className="text-sm text-gray-400 line-through">Rs. {product.price}</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                        <Eye className="w-4 h-4" />
                                        <span>{product.viewCount}</span>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    );
}