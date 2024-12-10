import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";

interface Project {
  id: string;
  name: string;
  client: {
    id: string;
    name: string;
    email: string;
    address: string;
  };
}

interface TimeEntry {
  id: string;
  start_time: string;
  end_time: string;
  duration: number;
  description: string;
}

export default function InvoiceForm({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select(`id, name, client:clients (id, name, email, address)`);
      if (!error && data) {
        setProjects(data);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchTimeEntries = async () => {
      if (selectedProject) {
        const { data, error } = await supabase
          .from("time_entries")
          .select("*")
          .eq("project_id", selectedProject)
          .is("invoice_id", null);
        if (!error && data) {
          setTimeEntries(data);
          setSelectedEntries(data.map((entry) => entry.id));
        }
      }
    };
    fetchTimeEntries();
  }, [selectedProject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const project = projects.find((p) => p.id === selectedProject);
      if (!project) throw new Error("Project not found");

      const selectedTimeEntries = timeEntries.filter((entry) =>
        selectedEntries.includes(entry.id)
      );

      const totalDuration = selectedTimeEntries.reduce(
        (acc, entry) => acc + entry.duration,
        0
      );
      const totalHours = totalDuration / 3600; // Convert seconds to hours

      const invoiceNumber = `INV-${format(new Date(), "yyyyMMdd")}-${Math.floor(
        Math.random() * 1000
      )
        .toString()
        .padStart(3, "0")}`;

      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          user_id: userData.user.id,
          project_id: selectedProject,
          invoice_number: invoiceNumber,
          issue_date: new Date().toISOString(),
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          total_amount: totalHours * (project.rate || 0),
          status: "draft",
        })
        .select()
        .single();

      if (invoiceError || !invoice) throw invoiceError;

      // Update time entries with invoice_id
      const { error: updateError } = await supabase
        .from("time_entries")
        .update({ invoice_id: invoice.id })
        .in("id", selectedEntries);

      if (updateError) throw updateError;

      toast({
        title: "Invoice created successfully",
        description: `Invoice ${invoiceNumber} has been created`,
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast({
        title: "Error creating invoice",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="project" className="block text-sm font-medium mb-1">
          Select Project
        </label>
        <Select
          value={selectedProject}
          onValueChange={setSelectedProject}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name} - {project.client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedProject && timeEntries.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium">Select Time Entries to Invoice</h3>
          <div className="space-y-2">
            {timeEntries.map((entry) => (
              <div key={entry.id} className="flex items-center space-x-2">
                <Checkbox
                  id={entry.id}
                  checked={selectedEntries.includes(entry.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedEntries((prev) => [...prev, entry.id]);
                    } else {
                      setSelectedEntries((prev) =>
                        prev.filter((id) => id !== entry.id)
                      );
                    }
                  }}
                />
                <label htmlFor={entry.id} className="text-sm">
                  {format(new Date(entry.start_time), "PPp")} -{" "}
                  {format(new Date(entry.end_time), "PPp")} (
                  {Math.round((entry.duration / 3600) * 100) / 100} hours)
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button type="submit" disabled={loading || !selectedProject}>
        {loading ? "Creating Invoice..." : "Generate Invoice"}
      </Button>
    </form>
  );
}