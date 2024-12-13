import { useState, useEffect } from "react";
import { format } from "date-fns";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Project, TimeEntry } from "@/types";

interface ProjectDetailsDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProjectDetailsDialog({
  project,
  open,
  onOpenChange,
}: ProjectDetailsDialogProps) {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [financialMetrics, setFinancialMetrics] = useState({
    totalBilled: 0,
    totalPaid: 0,
    totalInvoiced: 0,
    totalNotInvoiced: 0,
  });

  useEffect(() => {
    const fetchTimeEntries = async () => {
      if (!project) return;
      
      const { data } = await supabase
        .from("time_entries")
        .select(`
          *,
          project:projects (rate),
          invoice:invoices!inner(status)
        `)
        .eq("project_id", project.id);

      if (data) {
        setTimeEntries(data);
        
        const metrics = data.reduce(
          (acc, entry) => {
            const entryAmount = (entry.duration / 3600) * project.rate;
            if (entry.invoice?.status === "paid") {
              acc.totalPaid += entryAmount;
              acc.totalBilled += entryAmount;
              acc.totalInvoiced += entryAmount;
            } else if (entry.invoice_id) {
              acc.totalInvoiced += entryAmount;
              acc.totalBilled += entryAmount;
            } else {
              acc.totalNotInvoiced += entryAmount;
            }
            return acc;
          },
          { totalBilled: 0, totalPaid: 0, totalInvoiced: 0, totalNotInvoiced: 0 }
        );

        setFinancialMetrics(metrics);
      }
    };

    if (open && project) {
      fetchTimeEntries();
    }
  }, [open, project]);

  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{project.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Billed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${financialMetrics.totalBilled.toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Paid
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${financialMetrics.totalPaid.toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Invoiced (Unpaid)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(financialMetrics.totalInvoiced - financialMetrics.totalPaid).toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Not Invoiced
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${financialMetrics.totalNotInvoiced.toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {format(new Date(entry.start_time), "PPp")}
                    </TableCell>
                    <TableCell>
                      {Math.round((entry.duration / 3600) * 100) / 100} hours
                    </TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell>
                      {entry.invoice_id
                        ? entry.invoice?.status
                        : "Not Invoiced"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
