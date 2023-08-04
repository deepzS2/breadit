import { CloseModal } from "@/components/close-modal";
import { SignUp } from "@/components/sign-up";

export default function SignUpModal() {
  return (
    <div className="fixed inset-0 z-10 bg-zinc-900/20">
      <div className="container flex items-center mx-auto max-w-lg h-full">
        <div className="relative py-20 px-2 w-full bg-white rounded-lg h-fit">
          <div className="absolute top-4 right-4">
            <CloseModal />
          </div>

          <SignUp />
        </div>
      </div>
    </div>
  );
}
