import { Eye, Edit2, Trash2, ChevronLeft, Calendar, Tag, Package, DollarSign, FileText, Star, Heart, Pencil } from 'lucide-react';
import ProductTab from '@/components/Admin/Common/Product/ProductTab';
import ProductImage from '@/components/Admin/Common/Product/ProductImage';
import { deleteProduct, getProductById } from '../../(actions)/product.action';
import RecordNotFound from '@/components/Admin/Common/RecordNotFound';
import Link from 'next/link';
import Card from '@/components/Admin/Common/Card';
import Title from '@/components/Admin/Typography/Title';
import DeleteButton from '@/components/Admin/Buttons/DeleteButton';
import { RoleGuard } from '@/components/Admin/Common/RoleGuard';

const AdminProductDetails = async ({ params }) => {
    const { id } = await params;
    const { product } = await getProductById(Number(id))

    if (!product) {
        return (
            <>
                <RecordNotFound />
            </>
        )
    }
    const calculateDiscount = () => {
        if (product.discountedPrice) {
            const discountPrice = (product?.discountedPrice / 100) * product.price;
            const discount = product?.price - discountPrice;
            return Math.round(discount);
        }
    };
    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'specifications', label: 'Specifications' },
        { id: 'images', label: 'Images' },
        { id: 'pricing', label: 'Pricing' },
        // { id: 'activity', label: 'Activity' }
    ];

    return (
        <RoleGuard permission='product_view'>
            <Title
                title={`Product details `}
                breadcrumbs={
                    [
                        {
                            label: 'Dashboard', href: '/admin'
                        },
                        {
                            label: "Products", href: '/admin/products'
                        },
                        {
                            label: "Details"
                        }
                    ]
                }
            />
            <Card>
                <div className='p-4'>
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href={'/admin/products'} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition">
                                <ChevronLeft className="w-5 h-5" />
                                <span className="font-medium">Back to Products</span>
                            </Link>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href={`/shop-details/${product.id}`} target='__blank' className="p-2 bg-blue-50 text-blue-600 rounded">
                                <Eye size={14} />
                            </Link>
                            <Link href={`/admin/products/edit/${product.id}`} className="p-2 bg-blue-50 text-blue-600 rounded">
                                <Pencil size={14} />
                            </Link>
                            <DeleteButton id={product.id.toString()} action={deleteProduct} />
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Product Images */}
                        <div className="lg:col-span-1">
                            <div className="bg-white overflow-hidden">
                                <div className="p-4 border-b border-gray-100">
                                    <h3 className="font-semibold text-gray-900">Product Images</h3>
                                </div>

                                <ProductImage product={product} />
                            </div>
                        </div>

                        {/* Right Column - Product Details */}
                        <div className="lg:col-span-2">
                            {/* Product Header */}
                            <div className="bg-white  p-6 mb-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                                                {product.status}
                                            </span>
                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                                ID: #{product.id}
                                            </span>
                                        </div>
                                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.title}</h1>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Package className="w-4 h-4" />
                                                {product.brand.title}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Tag className="w-4 h-4" />
                                                {product.category.title}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-bold text-green-600 mb-1">
                                            Rs. {product.discountedPrice ? calculateDiscount() : product.price.toLocaleString()}
                                        </div>
                                        {
                                            product.discountedPrice ? (
                                                <>
                                                    <div className="text-sm text-gray-500 line-through">
                                                        Rs. {product.price.toLocaleString()}
                                                    </div>
                                                    <div className="text-xs text-red-600 font-medium">
                                                        {product.discountedPrice}% OFF
                                                    </div>
                                                </>
                                            ) : ('')
                                        }
                                    </div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <ProductTab tabs={tabs} product={product} />
                        </div>
                    </div>
                </div>
            </Card >
        </RoleGuard>
    );
};

export default AdminProductDetails;