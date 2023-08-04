"use client";

import axios, { isAxiosError } from "axios";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";

import { toast } from "@/hooks/use-toast";
import { UsernameRequest, UsernameValidator } from "@/lib/validators/username";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface UserNameFormProps {
  user?: Pick<User, "id" | "username">;
}

export const UserNameForm = ({ user }: UserNameFormProps) => {
  const router = useRouter();
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<UsernameRequest>({
    resolver: zodResolver(UsernameValidator),
    defaultValues: {
      name: user?.username || "",
    },
  });

  const { mutate: updateUsername, isLoading } = useMutation({
    mutationFn: async (payload: UsernameRequest) => {
      const { data } = await axios.patch(`/api/username`, payload);

      return data;
    },
    onError: (err) => {
      if (isAxiosError(err)) {
        if (err.response?.status === 409) {
          return toast({
            title: "Username already taken.",
            description: "Please choose a different username.",
            variant: "destructive",
          });
        }
      }

      return toast({
        title: "There was a problem",
        description: "Something went wrong, please try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        description: "Your username has been updated",
      });

      router.refresh();
    },
  });

  const onSubmit = handleSubmit((data) => updateUsername(data));

  return (
    <form onSubmit={onSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Your username</CardTitle>
          <CardDescription>
            Please enter a display name you are comfortable with.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid relative gap-1">
            <div className="grid absolute top-0 left-0 place-items-center w-8 h-10">
              <span className="text-sm text-zinc-400">u/</span>
            </div>

            <Label className="sr-only" htmlFor="name">
              Name
            </Label>
            <Input
              id="name"
              className="pl-6 w-[400px]"
              size={32}
              {...register("name")}
            />

            {errors?.name && (
              <p className="px-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <Button isLoading={isLoading}>Change name</Button>
        </CardFooter>
      </Card>
    </form>
  );
};
