import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Project } from "@/types";

interface InvoicePricingProps {
  project: Project;
  onPriceChange: (amount: number) => void;
}

export function InvoicePricing({ project, onPriceChange }: InvoicePricingProps) {
  const [customAmount, setCustomAmount] = useState<string>("");

  useEffect(() => {
    if (project.pricing_type === "monthly") {
      setCustomAmount(project.monthly_rate?.toString() || "");
    } else if (project.pricing_type === "fixed") {
      setCustomAmount(project.fixed_rate?.toString() || "");
    }
  }, [project]);

  const handleAmountChange = (value: string) => {
    setCustomAmount(value);
    const numericValue = parseFloat(value) || 0;
    onPriceChange(numericValue);
  };

  if (project.pricing_type === "hourly") {
    return null;
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="custom-amount">
        {project.pricing_type === "monthly" ? "Monthly Rate" : "Fixed Rate"}
      </Label>
      <Input
        id="custom-amount"
        type="number"
        min="0"
        step="0.01"
        value={customAmount}
        onChange={(e) => handleAmountChange(e.target.value)}
        placeholder="Enter amount"
      />
    </div>
  );
}