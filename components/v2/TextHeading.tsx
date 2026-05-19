const TextHeading = ({
  title,
  className,
}: {
  title: string;
  className?: string;
}) => {
  return (
    <h2
      className={`text-[32px] font-bold tracking-[0.025] leading-[40px]  text-[#121714] dark:text-white ${className}`}
    >
      {title}
    </h2>
  );
};

export default TextHeading;
