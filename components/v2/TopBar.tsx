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
            <span className="material-symbols-outlined text-sm">call</span>
            {phone}
          </a>
        )}
        {email && (
          <a href={`mailto:${email}`} className="flex items-center gap-1 hover:underline">
            <span className="material-symbols-outlined text-sm">mail</span>
            {email}
          </a>
        )}
        {!phone && !email && (
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">support_agent</span>
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
