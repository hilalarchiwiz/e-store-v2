// Helpers that turn raw audit-log JSON into human-readable text.
type Json = Record<string, unknown> | null | undefined;

// Fields that are noise or must never be shown.
const HIDDEN_FIELDS = new Set([
    'id', 'createdAt', 'updatedAt', 'password', 'token', 'accessToken', 'refreshToken', 'idToken',
]);

const FIELD_LABELS: Record<string, string> = {
    title: 'Title',
    titleFont: 'Title font',
    slug: 'Page URL',
    description: 'Description',
    additionalInfo: 'Additional info',
    metaDescription: 'SEO description',
    metaKeywords: 'SEO keywords',
    price: 'Price',
    discountedPrice: 'Discounted price',
    quantity: 'Quantity',
    warranty: 'Warranty',
    status: 'Status',
    images: 'Images',
    imgs: 'Images',
    specifications: 'Specifications',
    brandId: 'Brand',
    categoryId: 'Category',
    subCategoryId: 'Sub category',
    gradingId: 'Grading',
    roleName: 'Role',
    permissions: 'Permissions',
    modules: 'Modules',
    emailVerified: 'Email verified',
    isActive: 'Active',
};

const ENTITY_LABELS: Record<string, string> = {
    SubCategory: 'Sub category',
    LoginLog: 'Login log',
    FAQ: 'FAQ',
    Faq: 'FAQ',
};

export const REFERENCE_FIELDS: Record<string, 'brand' | 'category' | 'subCategory' | 'grading'> = {
    brandId: 'brand',
    categoryId: 'category',
    subCategoryId: 'subCategory',
    gradingId: 'grading',
};

const MONEY_FIELDS = new Set(['price', 'discountedPrice', 'total', 'subtotal', 'amount', 'shippingFee', 'discount']);

export const humanize = (key: string) => {
    if (FIELD_LABELS[key]) return FIELD_LABELS[key];
    const spaced = key.replace(/Id$/, '').replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/_/g, ' ').trim();
    return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
};

export const entityLabel = (name: string) =>
    ENTITY_LABELS[name] || name.replace(/([a-z0-9])([A-Z])/g, '$1 $2');

const stripHtml = (s: string) =>
    s.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

const isoDate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

export function formatValue(
    key: string,
    value: unknown,
    refs?: Record<string, Record<string, string>>,
): { text: string; empty: boolean } {
    if (value === null || value === undefined || value === '') return { text: 'Empty', empty: true };

    const refType = REFERENCE_FIELDS[key];
    if (refType) {
        const name = refs?.[refType]?.[String(value)];
        return { text: name ?? `#${value}`, empty: false };
    }
    if (typeof value === 'boolean') return { text: value ? 'Yes' : 'No', empty: false };
    if (typeof value === 'number') {
        const n = value.toLocaleString('en-US');
        return { text: MONEY_FIELDS.has(key) ? `Rs. ${n}` : n, empty: false };
    }
    if (typeof value === 'string') {
        if (isoDate.test(value)) {
            const d = new Date(value);
            if (!isNaN(d.getTime())) {
                return { text: d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }), empty: false };
            }
        }
        const plain = stripHtml(value);
        if (!plain) return { text: 'Empty', empty: true };
        return { text: plain.length > 140 ? `${plain.slice(0, 140)}…` : plain, empty: false };
    }
    if (Array.isArray(value)) {
        if (value.length === 0) return { text: 'None', empty: true };
        if (key === 'images') return { text: `${value.length} image${value.length === 1 ? '' : 's'}`, empty: false };
        if (value.every((v) => typeof v === 'string')) {
            const joined = (value as string[]).join(', ');
            return { text: joined.length > 140 ? `${value.length} items` : joined, empty: false };
        }
        return { text: `${value.length} items`, empty: false };
    }
    return { text: 'Details changed', empty: false };
}

export interface FieldChange {
    key: string;
    label: string;
    before: { text: string; empty: boolean };
    after: { text: string; empty: boolean };
}

/** Fields that actually changed (UPDATE), or the filled-in fields (CREATE / DELETE). */
export function getChanges(
    action: string,
    oldData: Json,
    newData: Json,
    refs?: Record<string, Record<string, string>>,
): FieldChange[] {
    const o = oldData || {};
    const n = newData || {};
    const keys = Array.from(new Set([...Object.keys(o), ...Object.keys(n)])).filter((k) => !HIDDEN_FIELDS.has(k));

    return keys
        .filter((k) => {
            if (action === 'UPDATE') return JSON.stringify(o[k]) !== JSON.stringify(n[k]);
            const v = action === 'DELETE' ? o[k] : n[k];
            return v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0);
        })
        .map((k) => ({
            key: k,
            label: humanize(k),
            before: formatValue(k, o[k], refs),
            after: formatValue(k, n[k], refs),
        }));
}

/** Best human name for the record, e.g. a product title or user email. */
export function recordName(oldData: Json, newData: Json): string | null {
    const src = (newData || oldData || {}) as Record<string, unknown>;
    for (const k of ['title', 'name', 'question', 'email', 'code', 'key', 'roleName']) {
        const v = src[k];
        if (typeof v === 'string' && v.trim()) {
            const t = stripHtml(v);
            return t.length > 80 ? `${t.slice(0, 80)}…` : t;
        }
    }
    return null;
}
