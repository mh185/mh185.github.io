import { cva, type VariantProps } from "class-variance-authority";

export const field = cva(
  [
    "w-full rounded-lg border-0 px-3.5 py-2 shadow-sm ring-1 ring-inset",
    "sm:text-sm sm:leading-6 transition-colors duration-200 focus:outline-none",
    "bg-white dark:bg-neutral-700",
    "placeholder:text-neutral-500 dark:placeholder:text-neutral-400",
  ].join(" "),
  {
    variants: {
      intent: {
        default:
          "ring-neutral-300 dark:ring-neutral-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-yellow-400",
        error:
          "ring-red-500 dark:ring-red-500 focus:ring-2 focus:ring-red-500 dark:focus:ring-red-500",
      },
    },
    defaultVariants: {
      intent: "default",
    },
  },
);

export type FieldVariants = VariantProps<typeof field>;
