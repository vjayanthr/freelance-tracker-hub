import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import type { Project } from "@/types";

export default function ProjectList({ onUpdate }: { onUpdate?: () => void }) {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*, client:clients(*)");
    if (error) {
      console.error("Error fetching projects:", error);
      return;
    }
    if (data) {
      setProjects(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const updateProjectStatus = async (projectId: string, status: string) => {
    const { error } = await supabase
      .from("projects")
      .update({ status })
      .eq("id", projectId);

    if (error) {
      toast({
        title: "Error updating project status",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Project status updated successfully",
    });

    fetchProjects();
    if (onUpdate) onUpdate();
  };

  const formatRate = (project: Project) => {
    switch (project.pricing_type) {
      case "hourly":
        return `$${project.rate}/hr`;
      case "monthly":
        return `$${project.monthly_rate}/month`;
      case "fixed":
        return `$${project.fixed_rate} (fixed)`;
      default:
        return "N/A";
    }
  };

  if (loading) {
    return <div>Loading projects...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Projects</h2>
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>{project.name}</TableCell>
                <TableCell>{project.client.name}</TableCell>
                <TableCell>{formatRate(project)}</TableCell>
                <TableCell>
                  <Select
                    value={project.status || "active"}
                    onValueChange={(value) => updateProjectStatus(project.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}