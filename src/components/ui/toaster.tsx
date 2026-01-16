"use client";

import * as React from "react";

// Placeholder for shadcn/ui Toaster component
// Run: npx shadcn-ui@latest add toast

export function Toaster() {
  return null;
}

export function useToast() {
  return {
    toast: ({
      title,
      description,
      variant,
    }: {
      title?: string;
      description?: string;
      variant?: "default" | "destructive";
    }) => {
      // Fallback to console for now
      console.log(`[Toast ${variant}]: ${title} - ${description}`);
    },
    dismiss: () => {},
  };
}
