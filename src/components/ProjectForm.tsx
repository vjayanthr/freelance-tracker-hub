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