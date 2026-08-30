"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      position="top-center"
      richColors
      expand={true}
      toastOptions={{
        style: {
          fontFamily: 'var(--font-sans)',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
