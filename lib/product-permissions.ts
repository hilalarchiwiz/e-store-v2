// Field-level product permissions. `product_update` grants every field.
export const PRODUCT_FIELD_PERMISSIONS = {
    title: 'product_update_title',
    description: 'product_update_description',
    price: 'product_update_price',
    discount: 'product_update_discount',
    quantity: 'product_update_quantity',
    seo: 'product_update_seo',
    grading: 'product_update_grading',
} as const;

export type ProductField = keyof typeof PRODUCT_FIELD_PERMISSIONS;
export type ProductFieldAccess = Record<ProductField, boolean>;

export const ALL_PRODUCT_FIELD_PERMISSION_KEYS = ['product_update', ...Object.values(PRODUCT_FIELD_PERMISSIONS)];

export function getProductFieldAccess(permissions: string[]): ProductFieldAccess {
    const full = permissions.includes('product_update');
    const access = {} as ProductFieldAccess;
    for (const field of Object.keys(PRODUCT_FIELD_PERMISSIONS) as ProductField[]) {
        access[field] = full || permissions.includes(PRODUCT_FIELD_PERMISSIONS[field]);
    }
    return access;
}

export const anyProductFieldAccess = (a: ProductFieldAccess) => Object.values(a).some(Boolean);

// Permission keys that allow a given set of fields (any of them).
export const permissionsFor = (...fields: ProductField[]) => [
    'product_update',
    ...fields.map((f) => PRODUCT_FIELD_PERMISSIONS[f]),
];
