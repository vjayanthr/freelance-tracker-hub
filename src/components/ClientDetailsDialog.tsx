import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Client, Project } from "@/types";

interface ClientDetailsDialogProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectClick?: (project: Project) => void;
}

export default function ClientDetailsDialog({
  client,
  open,
  onOpenChange,
  onProjectClick,
}: ClientDetailsDialogProps) {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!client) return;
      
      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("client_id", client.id);

      if (data) {
        setProjects(data);
      }
    };

    if (open && client) {
      fetchProjects();
    }
  }, [open, client]);

  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{client.name}</DialogTitle>
        </DialogHeader>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow
                  key={project.id}
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => onProjectClick?.(project)}
                >
                  <TableCell>{project.name}</TableCell>
                  <TableCell>${project.rate}/hr</TableCell>
                  <TableCell>{project.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}