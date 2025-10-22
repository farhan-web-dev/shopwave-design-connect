import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const GuestCheckoutModal = ({
  open,
  onClose,
  onGuestCheckout,
  onSignIn,
}: {
  open: boolean;
  onClose: () => void;
  onGuestCheckout: () => void;
  onSignIn: () => void;
}) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Checkout Options</DialogTitle>
        <DialogDescription>
          Continue as a guest or sign in to save your order history.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-3 mt-4">
        <Button onClick={onGuestCheckout}>Checkout as Guest</Button>
        <Button variant="outline" onClick={onSignIn}>
          Sign In / Sign Up
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);

export default GuestCheckoutModal;
