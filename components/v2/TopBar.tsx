
import SiteIcon from '@/components/v2/SiteIcon';
import React from 'react';

interface TopBarProps {
  generalSetting?: {
    support_number?: string;
    support_email?: string;
  };
}

const TopBar = ({ generalSetting }: TopBarProps) => {
  const phone = generalSetting?.support_number;
  const email = generalSetting?.support_email;

  return (
    <div className="w-full bg-[#1a7339] text-white py-2 px-6 md:px-10 flex justify-between items-center text-xs font-medium">
      <div className="flex items-center gap-4">
        {phone && (
          <a href={`tel:${phone}`} className="flex items-center gap-1 hover:underline">
            <SiteIcon className="text-sm">call</SiteIcon>
            {phone}
          </a>
        )}
        {email && (
          <a href={`mailto:${email}`} className="flex items-center gap-1 hover:underline">
            <SiteIcon className="text-sm">mail</SiteIcon>
            {email}
          </a>
        )}
        {!phone && !email && (
          <span className="flex items-center gap-1">
            <SiteIcon className="text-sm">support_agent</SiteIcon>
            24/7 Customer Support
          </span>
        )}
      </div>
      <div className="hidden md:block">
        Free shipping on orders over PKR 5,000 | Sustainable Packaging
      </div>
      <div className="flex items-center gap-3">
        <a className="hover:underline" href="#">English</a>
        <a className="hover:underline" href="#">PKR</a>
      </div>
    </div>
  );
};

export default TopBar;
