import { cva, type VariantProps } from "class-variance-authority";

const commonFontStyles = "text-sm font-medium";
const commonHoverStyles =
  "hover:text-blue-500 active:text-blue-500 dark:hover:text-yellow-400 dark:active:text-yellow-400";
const animatedUnderlineStyles =
  "bg-[linear-gradient(currentColor,currentColor)] bg-no-repeat [background-position:0_100%] [background-size:0%_2px] transition-[background-size] duration-250 ease-out hover:[background-size:100%_2px] active:[background-size:100%_2px] group-hover:[background-size:100%_2px]";

export const link = cva(
  "relative inline-block transition duration-250 ease-out before:content-[''] before:absolute before:inset-y-[-10px] before:inset-x-[-7px] active:scale-95",
  {
    variants: {
      variant: {
        default: `${commonFontStyles} underline underline-offset-4 ${commonHoverStyles}`,
        "hover-reveal": `${commonFontStyles} text-blue-600 underline-offset-4 underline decoration-transparent hover:decoration-current active:decoration-current dark:text-yellow-400`,
        "animated-underline": `${commonHoverStyles} ${animatedUnderlineStyles}`,
        plain: `${commonHoverStyles}`,
        unstyled: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type LinkVariants = VariantProps<typeof link>;
