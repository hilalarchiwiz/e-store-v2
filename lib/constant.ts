export const PAGE_SIZE = 12;

export const MAX_COMMENT_LENGTH = 250;

export const GOOGLE_FONTS = [
    "Inter", "Poppins", "Roboto", "Montserrat", "Open Sans", "Lato", "Nunito", "Raleway",
    "Ubuntu", "Mukta", "Kanit", "Rubik", "Work Sans", "Quicksand", "Fira Sans", "Nanum Gothic",
    "Barlow", "Titillium Web", "Heebo", "Karla", "DM Sans", "Public Sans", "Manrope", "Outfit",
    "Hind", "Josefin Sans", "Cabin", "Assistant", "Questrial", "Catamaran", "Maven Pro",
    "Comfortaa", "Exo 2", "Muli", "Oxygen", "PT Sans", "Source Sans 3", "IBM Plex Sans",
    "Playfair Display", "Merriweather", "Lora", "PT Serif", "Libre Baskerville", "Crimson Text",
    "EB Garamond", "Noto Serif", "Arvo", "Bitter", "Domine", "Cardo", "Abril Fatface",
    "Cormorant Garamond", "Spectral", "Old Standard TT", "Cinzel", "Prata", "DM Serif Display",
    "Bodoni Moda", "Bree Serif", "Zilla Slab", "Vollkorn", "Tinos", "Alice", "Faustina",
    "Oswald", "Anton", "Bebas Neue", "Archivo Black", "Lobster", "Pacifico", "Righteous",
    "Fredoka One", "Permanent Marker", "Dancing Script", "Caveat", "Satisfy", "Courgette",
    "Kaushan Script", "Great Vibes", "Sacramento", "Cookie", "Yellowtail", "Patua One",
    "Alfa Slab One", "Luckiest Guy", "Press Start 2P", "Syncopate", "Michroma", "Orbitron",
    "Space Grotesk", "Space Mono", "Fira Code", "Inconsolata", "Source Code Pro", "JetBrains Mono",
    "Roboto Mono", "Courier Prime", "Anonymous Pro", "Share Tech Mono"
];



// @/constants/icons.ts
// @/constants/icons.ts
export const LUCIDE_ICON_NAMES = [
    // --- Technology & Hardware ---
    "Laptop", "Wifi", "Keyboard", "Mouse", "Cpu", "Monitor", "Smartphone", "Tablet",
    "HardDrive", "Database", "Cloud", "Shield", "Lock", "Key", "Settings", "Server",
    "Network", "Activity", "Terminal", "Code", "Layers", "Box", "Watch", "Tv",
    "Headphones", "Speaker", "Bluetooth", "Battery", "Zap", "Router", "Ram",

    // --- Commerce & Business ---
    "ShoppingBag", "ShoppingCart", "CreditCard", "Truck", "Globe", "Languages",
    "Archive", "BarChart", "PieChart", "TrendingUp", "TrendingDown", "DollarSign",
    "Euro", "Banknote", "Wallet", "Tag", "Percent", "Gift", "Package", "Briefcase",
    "Store", "BadgePercent", "Calculator", "Receipt", "Landmark",

    // --- Communication & Users ---
    "User", "Users", "UserPlus", "UserMinus", "UserCheck", "Mail", "Phone", "Bell",
    "MessageSquare", "MessageCircle", "Share2", "Send", "AtSign", "Contact",

    // --- Interface & Navigation ---
    "Search", "Home", "Info", "HelpCircle", "Plus", "Minus", "Edit", "Trash",
    "Check", "X", "ChevronRight", "ChevronLeft", "ChevronUp", "ChevronDown",
    "Menu", "MoreHorizontal", "MoreVertical", "Filter", "Sliders", "Eye",
    "EyeOff", "RefreshCw", "ExternalLink", "Link", "Layout", "AppWindow",

    // --- Media & Files ---
    "Camera", "Video", "Music", "Mic", "Image", "FileText", "File", "Folder",
    "FolderPlus", "Download", "Upload", "Copy", "Clipboard", "Printer", "Play",
    "Pause", "Scissors",

    // --- Environment & Shapes ---
    "Sun", "Moon", "Star", "Heart", "MapPin", "Navigation", "Flag", "Clock",
    "Calendar", "Compass", "Target", "Lightbulb", "Flame", "Anchor"
];

export const permissionModules = [
    {
        module: "Categories",
        permissions: ["category_view", "category_create", "category_update", "category_delete"],
    },
    {
        module: "Brands",
        permissions: ["brand_view", "brand_create", "brand_update", "brand_delete"],
    },
    {
        module: "Roles",
        permissions: ["role_view", "role_create", "role_update", "role_delete"],
    },
    {
        module: "Users",
        permissions: ["user_view", "user_create", "user_update", "user_delete"],
    },
    {
        module: "Products",
        permissions: ["product_view", "product_create", "product_update", "product_delete"],
    },
    {
        module: "Sliders",
        permissions: ["slider_view", "slider_create", "slider_update", "slider_delete"],
    },
    {
        module: "Banners",
        permissions: ["banner_view", "banner_create", "banner_update", "banner_delete"],
    },
    {
        module: "Blogs",
        permissions: ["blog_view", "blog_create", "blog_update", "blog_delete"],
    },
    {
        module: "Coupons",
        permissions: ["coupon_view", "coupon_create", "coupon_update", "coupon_delete"],
    },
    {
        module: "Orders",
        permissions: ["order_view", "order_update", "order_delete", "order_status_manage"],
    },
    {
        module: "FAQs",
        permissions: ["faq_view", "faq_create", "faq_update", "faq_delete"],
    },
    {
        module: "Pages",
        permissions: ["page_view", "page_create", "page_update", "page_delete"],
    },
    {
        module: "About Page",
        permissions: ["about_view", "about_update"],
    },
    {
        module: "Subscribers",
        permissions: ["subscriber_view", "subscriber_delete", "subscriber_export"],
    },
    {
        module: "Contacts",
        permissions: ["contact_view", "contact_reply", "contact_delete"],
    },
    {
        module: "Settings",
        permissions: ["settings_view", "settings_update"],
    },
    {
        module: "logs",
        permissions: ["audit_view", "login_view"],
    },
];