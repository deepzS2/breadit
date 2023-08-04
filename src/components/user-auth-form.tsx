"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

import { Button } from "./ui/button";
import { Icons } from "./icons";
import { useToast } from "@/hooks/use-toast";

export const UserAuthForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loginWithGoogle = async () => {
    setIsLoading(true);

    try {
      await signIn("google");
    } catch (error) {
      toast({
        title: "There was a problem.",
        description: "There was an error logging in with Google",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center">
      <Button
        onClick={loginWithGoogle}
        isLoading={isLoading}
        size="sm"
        className="w-full"
      >
        {isLoading ? null : <Icons.google className="mr-2 w-4 h-4" />}
        Google
      </Button>
    </div>
  );
};
