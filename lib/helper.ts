import generateSession from "./generate-session"
import { DiscountPriceType } from "./type"

export const discountPrice = (data: DiscountPriceType) => {
    return data.price - (data.price * data?.discount) / 100
}


export const parseDate = (expiryDate: any) => {
    return expiryDate ? new Date(expiryDate) : null;
}

export const slugify = (text: string) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w-]+/g, '')  // Remove all non-word chars
        .replace(/--+/g, '-');    // Replace multiple - with single -
};


export const getDiff = (oldData: any, newData: any) => {
    const oldObj = oldData || {};
    const newObj = newData || {};
    const allKeys = Array.from(new Set([...Object.keys(oldObj), ...Object.keys(newObj)]));

    return allKeys.filter(key =>
        JSON.stringify(oldObj[key]) !== JSON.stringify(newObj[key]) &&
        !['updatedAt', 'createdAt', 'id'].includes(key)
    );
};