const TextSubHeading = ({ title }: { title: string }) => {
  return (
    <>
      <p className="text-primary/90 dark:text-white/90 text-[12px] pb-2 font-bold leading-[16px] uppercase tracking-widest font-family-inter">
        {title}
      </p>
    </>
  );
};

export default TextSubHeading;
