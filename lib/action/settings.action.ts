"use server";

import prisma from "@/lib/prisma";

export interface SiteSettings {
  logo: { logo?: string; favicon?: string };
  generalSetting: {
    support_number?: string;
    footer_text?: string;
    support_email?: string;
    home_address_location?: string;
    home_number?: string;
  };
  socialInfo: {
    facebook_url?: string;
    instagram_url?: string;
    twitter_url?: string;
    linkedin_url?: string;
  };
  contactInfo: {
    name?: string;
    phone_number?: string;
    address?: string;
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const [logoRow, generalRow, socialRow, contactRow] = await Promise.all([
      prisma.setting.findFirst({ where: { key: "logo" } }),
      prisma.setting.findFirst({ where: { key: "general_setting" } }),
      prisma.setting.findFirst({ where: { key: "social_info" } }),
      prisma.setting.findFirst({ where: { key: "contact_info" } }),
    ]);

    return {
      logo: logoRow ? JSON.parse(logoRow.value) : {},
      generalSetting: generalRow ? JSON.parse(generalRow.value) : {},
      socialInfo: socialRow ? JSON.parse(socialRow.value) : {},
      contactInfo: contactRow ? JSON.parse(contactRow.value) : {},
    };
  } catch {
    return { logo: {}, generalSetting: {}, socialInfo: {}, contactInfo: {} };
  }
}
