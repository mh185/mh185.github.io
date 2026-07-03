import { cva, type VariantProps } from "class-variance-authority";

export const button = cva(
  "flex items-center justify-center cursor-pointer rounded-lg px-3.5 py-2.5 text-sm font-semibold tracking-wide focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-95 transition duration-300 " +
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
  {
    variants: {
      intent: {
        primary:
          "bg-blue-600 text-white shadow-sm hover:bg-blue-500 focus-visible:outline-blue-600 active:bg-blue-500 dark:bg-yellow-400 dark:text-black dark:shadow-[0_0_18px_-6px_rgba(251,191,36,0.12),0_0_42px_-4px_rgba(251,191,36,0.12)] dark:hover:bg-yellow-300 dark:focus-visible:outline-yellow-400 dark:active:bg-yellow-300",
        secondary:
          "border border-blue-600 bg-transparent text-blue-600 hover:bg-blue-50 dark:border-yellow-400 dark:text-yellow-400 dark:hover:bg-yellow-400/10",
        unstyled: "",
      },
    },
    defaultVariants: {
      intent: "primary",
    },
  },
);

export type ButtonVariants = VariantProps<typeof button>;
