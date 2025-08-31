import { Button } from "@/components/ui/button";
import { DialogClose, DialogContent } from "@/components/ui/StackedDialog";
import { StackedDialogContext } from "@/components/ui/StackedDialog/context";
import { Mail, Wallet, Bird } from "lucide-react";
import Image from "next/image";

const Onboarding = ({ pushDialog }: StackedDialogContext) => {
  return (
    <DialogContent
      title={<span className="text-center">Welcome to GainForest</span>}
      description=""
      showCloseButton={false}
      className="max-w-md mx-auto"
    >
      {/* Logo Section */}
      <div className="flex flex-col items-center mb-8">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200/50 flex items-center justify-center mb-4">
          <Image
            src="/assets/logo_transparent.png"
            alt="GainForest"
            width={40}
            height={40}
            className="opacity-90"
          />
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Choose your preferred sign-in method
        </p>
      </div>

      {/* Sign-in Options */}
      <div className="space-y-3 mb-6">
        <Button
          variant="outline"
          className="w-full h-12 justify-start gap-3 text-left hover:bg-accent/50 transition-all duration-200"
          onClick={() => pushDialog("sign-in-email")}
        >
          <Mail className="size-4 text-muted-foreground" />
          <span className="flex-1">Continue with Email</span>
        </Button>
        
        <Button
          variant="outline"
          className="w-full h-12 justify-start gap-3 text-left hover:bg-accent/50 transition-all duration-200"
          onClick={() => pushDialog("sign-in-external-wallet")}
        >
          <Wallet className="size-4 text-muted-foreground" />
          <span className="flex-1">Connect Wallet</span>
        </Button>
        
        <Button
          variant="outline"
          className="w-full h-12 justify-start gap-3 text-left hover:bg-accent/50 transition-all duration-200"
          onClick={() => pushDialog("sign-in-bluesky")}
        >
          <Bird className="size-4 text-muted-foreground" />
          <span className="flex-1">Continue with Bluesky</span>
        </Button>
      </div>

      {/* Close Button */}
      <DialogClose asChild>
        <Button 
          variant="ghost" 
          className="w-full text-muted-foreground hover:text-foreground"
        >
          Maybe later
        </Button>
      </DialogClose>
    </DialogContent>
  );
};

export default Onboarding;
