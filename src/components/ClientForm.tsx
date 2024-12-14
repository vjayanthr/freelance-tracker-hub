import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import type { Client } from "@/types";

interface ClientFormProps {
  onSuccess?: () => void;
  initialData?: Client;
}

export default function ClientForm({ onSuccess, initialData }: ClientFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    address: initialData?.address || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { error } = initialData
        ? await supabase
            .from("clients")
            .update(formData)
            .eq("id", initialData.id)
        : await supabase.from("clients").insert({
            ...formData,
            user_id: userData.user.id,
          });

      if (error) throw error;

      toast({
        title: `Client ${initialData ? "updated" : "created"} successfully`,
      });

      if (onSuccess) onSuccess();
      
      // Close the dialog by simulating Esc key press
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);
    } catch (error) {
      console.error("Error saving client:", error);
      toast({
        title: "Error saving client",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Client Name *
        </label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          required
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, email: e.target.value }))
          }
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium mb-1">
          Phone
        </label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, phone: e.target.value }))
          }
        />
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium mb-1">
          Address
        </label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, address: e.target.value }))
          }
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : initialData ? "Update Client" : "Add Client"}
      </Button>
    </form>
  );
}