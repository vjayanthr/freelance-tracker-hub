import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: "clients" | "projects" | "invoices" | "timeEntries";
}

const featureLabels = {
  clients: "clients",
  projects: "projects",
  invoices: "invoices",
  timeEntries: "time entries",
};

const limits = {
  clients: 1,
  projects: 3,
  invoices: 5,
  timeEntries: 10,
};

export default function UpgradeDialog({
  open,
  onOpenChange,
  feature,
}: UpgradeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upgrade to Pro</DialogTitle>
          <DialogDescription>
            You've reached the limit of {limits[feature]} {featureLabels[feature]} on
            the free plan.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="bg-muted/50 p-6 rounded-lg">
            <h3 className="font-semibold mb-4">Pro Plan Features</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span>Unlimited clients</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span>Unlimited projects</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span>Unlimited invoices</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span>Unlimited time entries</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span>Priority support</span>
              </li>
            </ul>
          </div>
          <div className="text-center">
            <div className="mb-4">
              <span className="text-3xl font-bold">₹200</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <Button className="w-full" size="lg">
              Upgrade Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}