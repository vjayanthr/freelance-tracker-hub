import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import type { Project, Client } from "@/types";

interface ProjectFormProps {
  onSuccess?: () => void;
  initialData?: Omit<Project, 'client'>;
}

export default function ProjectForm({ onSuccess, initialData }: ProjectFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    client_id: initialData?.client_id || "",
    rate: initialData?.rate || 0,
    pricing_type: initialData?.pricing_type || "hourly",
    monthly_rate: initialData?.monthly_rate || 0,
    fixed_rate: initialData?.fixed_rate || 0,
  });

  useEffect(() => {
    const fetchClients = async () => {
      const { data, error } = await supabase.from("clients").select("*");
      if (!error && data) {
        setClients(data);
      }
    };
    fetchClients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { error } = initialData
        ? await supabase
            .from("projects")
            .update(formData)
            .eq("id", initialData.id)
        : await supabase.from("projects").insert({
            ...formData,
            user_id: userData.user.id,
          });

      if (error) throw error;

      toast({
        title: `Project ${initialData ? "updated" : "created"} successfully`,
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error saving project:", error);
      toast({
        title: "Error saving project",
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
          Project Name *
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
        <label htmlFor="client" className="block text-sm font-medium mb-1">
          Client *
        </label>
        <Select
          value={formData.client_id}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, client_id: value }))
          }
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a client" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="pricing_type" className="block text-sm font-medium mb-1">
          Pricing Type *
        </label>
        <Select
          value={formData.pricing_type}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, pricing_type: value }))
          }
          required
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hourly">Hourly Rate</SelectItem>
            <SelectItem value="monthly">Monthly Rate</SelectItem>
            <SelectItem value="fixed">Fixed Rate</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.pricing_type === "hourly" && (
        <div>
          <label htmlFor="rate" className="block text-sm font-medium mb-1">
            Hourly Rate ($)
          </label>
          <Input
            id="rate"
            type="number"
            min="0"
            step="0.01"
            value={formData.rate}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, rate: parseFloat(e.target.value) }))
            }
          />
        </div>
      )}

      {formData.pricing_type === "monthly" && (
        <div>
          <label htmlFor="monthly_rate" className="block text-sm font-medium mb-1">
            Monthly Rate ($)
          </label>
          <Input
            id="monthly_rate"
            type="number"
            min="0"
            step="0.01"
            value={formData.monthly_rate}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, monthly_rate: parseFloat(e.target.value) }))
            }
          />
        </div>
      )}

      {formData.pricing_type === "fixed" && (
        <div>
          <label htmlFor="fixed_rate" className="block text-sm font-medium mb-1">
            Fixed Rate ($)
          </label>
          <Input
            id="fixed_rate"
            type="number"
            min="0"
            step="0.01"
            value={formData.fixed_rate}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, fixed_rate: parseFloat(e.target.value) }))
            }
          />
        </div>
      )}

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description
        </label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : initialData ? "Update Project" : "Add Project"}
      </Button>
    </form>
  );
}