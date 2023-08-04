"use client";

import { X } from "lucide-react";

import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export const CloseModal = () => {
  const router = useRouter();

  return (
    <Button
      variant="subtle"
      className="p-0 w-6 h-6 rounded-md"
      aria-label="close modal"
      onClick={router.back}
    >
      <X className="w-4 h-4" />
    </Button>
  );
};
