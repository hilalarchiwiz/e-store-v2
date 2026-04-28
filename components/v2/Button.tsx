import Link from "next/link";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  fullWidth?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
  href?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  fullWidth = false,
  isLoading = false,
  icon,
  className = "",
  href,
  ...props
}) => {
  const baseStyles =
    "flex items-center justify-center gap-2 rounded-xl font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles = {
    primary:
      "bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20 p-4",
    secondary:
      "bg-[#f1f4f2] dark:bg-[#2a3a2f] text-[#121714] dark:text-white hover:bg-primary/20 p-4",
    outline:
      "bg-transparent border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 py-3 px-6",
    ghost: "bg-transparent hover:bg-primary/10 text-primary p-4",
  }[variant]; // Simplified access

  const widthStyles = fullWidth ? "w-full" : "px-8";
  const finalClassName = `${baseStyles} ${variantStyles} ${widthStyles} ${className}`;

  const content = (
    <>
      {isLoading ? (
        <span className="size-5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
      ) : (
        <>
          {children}
          {icon && <span className="material-symbols-outlined">{icon}</span>}
        </>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={finalClassName}>
        {content}
      </Link>
    );
  }

  return (
    <button
      className={finalClassName}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {content}
    </button>
  );
};

export default Button;
