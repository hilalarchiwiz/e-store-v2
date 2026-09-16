'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as RegularIcons from '@fortawesome/free-regular-svg-icons';
import * as LucideIcons from 'lucide-react';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

type SiteIconProps = React.HTMLAttributes<HTMLSpanElement> & {
  name?: string | null;
};

const aliases: Record<string, string> = {
  account_balance: 'BuildingColumns',
  add: 'Plus', add_circle: 'CirclePlus', add_location: 'LocationDot',
  add_shopping_cart: 'CartPlus', admin_panel_settings: 'UserShield', apartment: 'Building',
  arrow_back: 'ArrowLeft', arrow_forward: 'ArrowRight', auto_mode: 'WandMagicSparkles',
  bolt: 'Bolt', call: 'Phone', camera: 'Camera', cancel: 'CircleXmark', category: 'LayerGroup',
  chat_bubble: 'Comment', check_circle: 'CircleCheck', chevron_left: 'ChevronLeft',
  chevron_right: 'ChevronRight', close: 'Xmark', credit_card: 'CreditCard', dark_mode: 'Moon',
  badge_check: 'Certificate', badge_dollar_sign: 'SackDollar',
  delete: 'Trash', eco: 'Leaf', edit_location: 'LocationDot', error: 'CircleExclamation',
  event: 'CalendarDays', event_note: 'CalendarDay', expand_less: 'ChevronUp',
  expand_more: 'ChevronDown', favorite: 'Heart', filter_alt: 'Filter', filter_list_off: 'FilterCircleXmark',
  forum: 'Comments', grid_view: 'TableCellsLarge', help_center: 'CircleQuestion', history: 'ClockRotateLeft',
  home: 'House', image: 'Image', image_not_supported: 'Image', info: 'CircleInfo', inventory_2: 'Box',
  key: 'Key', keyboard_arrow_up: 'ChevronUp', laptop_mac: 'Laptop', light_mode: 'Sun', link: 'Link',
  local_offer: 'Tag', local_shipping: 'Truck', location_off: 'LocationCrosshairs', location_on: 'LocationDot',
  lock_open: 'LockOpen', lock_reset: 'Key', login: 'RightToBracket', logout: 'RightFromBracket',
  mail: 'Envelope', mark_email_read: 'EnvelopeCircleCheck', menu: 'Bars', newspaper: 'Newspaper',
  note: 'NoteSticky', payments: 'MoneyBill', person: 'User', person_add: 'UserPlus',
  photo_camera: 'Camera', play_arrow: 'Play', progress_activity: 'Spinner', public: 'Globe',
  rate_review: 'PenToSquare', receipt_long: 'Receipt', remove: 'Minus', remove_shopping_cart: 'CartArrowDown',
  request_quote: 'FileInvoiceDollar', restart_alt: 'ArrowRotateLeft', search: 'MagnifyingGlass',
  search_off: 'MagnifyingGlassMinus', sell: 'Tags', share: 'ShareNodes', shopping_basket: 'BasketShopping',
  shopping_cart: 'CartShopping', star: 'Star', star_border: 'Star', storefront: 'Store',
  shopping_bag: 'BagShopping', shield_check: 'ShieldHalved', users_round: 'Users',
  sparkles: 'WandMagicSparkles',
  support_agent: 'Headset', swap_horiz: 'RightLeft', swap_vert: 'RightLeft', topic: 'FolderOpen',
  tune: 'Sliders', verified: 'CircleCheck', verified_user: 'ShieldHalved', view_list: 'List',
  visibility: 'Eye', visibility_off: 'EyeSlash', wallet: 'Wallet', zoom_in: 'MagnifyingGlassPlus',
};

const outlineAliases: Record<string, string> = {
  account_balance: 'Landmark', add_location: 'MapPin', add_shopping_cart: 'ShoppingCart',
  admin_panel_settings: 'ShieldUser', auto_mode: 'WandSparkles', cancel: 'CircleX',
  category: 'Layers', chat_bubble: 'MessageCircle', close: 'X', badge_check: 'BadgeCheck',
  badge_dollar_sign: 'BadgeDollarSign', edit_location: 'MapPinPen', error: 'CircleAlert',
  event_note: 'CalendarDays', filter_list_off: 'ListFilterPlus', forum: 'MessagesSquare',
  grid_view: 'Grid2X2', help_center: 'CircleHelp', history: 'History', info: 'Info',
  location_off: 'MapPinOff', location_on: 'MapPin', login: 'LogIn', logout: 'LogOut',
  mail: 'Mail', mark_email_read: 'MailCheck', menu: 'Menu', note: 'StickyNote',
  payments: 'Banknote', progress_activity: 'LoaderCircle', rate_review: 'MessageSquareText',
  remove_shopping_cart: 'ShoppingCart', request_quote: 'FileText', restart_alt: 'RotateCcw',
  search: 'Search', search_off: 'SearchX', share: 'Share2', shopping_basket: 'ShoppingBasket',
  shopping_cart: 'ShoppingCart', shopping_bag: 'ShoppingBag', shield_check: 'ShieldCheck',
  sparkles: 'Sparkles', swap_horiz: 'ArrowLeftRight', swap_vert: 'ArrowUpDown',
  verified_user: 'ShieldCheck', visibility_off: 'EyeOff', zoom_in: 'ZoomIn',
};

function toExportName(value: string) {
  const normalized = value.trim().replace(/^fa[-_]/i, '');
  const aliasName = normalized.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
  const mapped = aliases[aliasName];
  if (mapped) return `fa${mapped}`;

  return `fa${normalized
    .replace(/[-_]+/g, ' ')
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .replace(/(?:^|\s)(.)/g, (_, character: string) => character.toUpperCase())
    .replace(/\s+/g, '')}`;
}

export default function SiteIcon({ name, children, className = '', ...props }: SiteIconProps) {
  const childName = typeof children === 'string' ? children : '';
  const iconName = String(name || childName || 'circle_question');
  const exportName = toExportName(iconName);
  const regularIcon = (RegularIcons as unknown as Record<string, IconDefinition>)[exportName];
  const aliasName = iconName.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
  const outlineName = outlineAliases[aliasName] || aliases[aliasName] || iconName;
  const OutlineIcon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string; size?: string | number; strokeWidth?: number }>>)[outlineName] || LucideIcons.CircleHelp;
  const shouldSpin = iconName === 'progress_activity' || iconName === 'spinner';

  return (
    <span
      {...props}
      className={className}
      aria-hidden={props['aria-hidden'] ?? true}
    >
      {regularIcon ? (
        <FontAwesomeIcon icon={regularIcon} />
      ) : (
        <OutlineIcon className={shouldSpin ? 'animate-spin' : ''} size="1em" strokeWidth={2.1} />
      )}
    </span>
  );
}
