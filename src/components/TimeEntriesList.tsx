import { useState, useEffect } from "react";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function TimeEntriesList() {
  const { toast } = useToast();
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchTimeEntries = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data, error } = await supabase
      .from("time_entries")
      .select(`
        *,
        project:projects (
          name,
          client:clients (
            name
          )
        )
      `)
      .eq("user_id", userData.user.id)
      .order("start_time", { ascending: false });

    if (error) {
      console.error("Error fetching time entries:", error);
      return;
    }

    if (data) {
      setTimeEntries(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTimeEntries();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase
      .from("time_entries")
      .delete()
      .eq("id", deleteId);

    if (error) {
      toast({
        title: "Error deleting time entry",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Time entry deleted successfully",
    });

    fetchTimeEntries();
    setDeleteId(null);
  };

  if (loading) {
    return <div>Loading time entries...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Time Entries</h2>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {timeEntries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{entry.project?.name}</TableCell>
                <TableCell>{entry.project?.client?.name}</TableCell>
                <TableCell>
                  {format(new Date(entry.start_time), "PPp")}
                </TableCell>
                <TableCell>
                  {Math.round((entry.duration / 3600) * 100) / 100} hours
                </TableCell>
                <TableCell>{entry.description}</TableCell>
                <TableCell>
                  {entry.invoice_id ? "Invoiced" : "Not Invoiced"}
                </TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteId(entry.id)}
                    disabled={entry.invoice_id !== null}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the time
              entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}