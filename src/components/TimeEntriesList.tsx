import { useEffect, useState } from "react";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import type { TimeEntry } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

export default function TimeEntriesList() {
  const { toast } = useToast();
  const [timeEntries, setTimeEntries] = useState<(TimeEntry & { project: { name: string; client: { name: string } } })[]>([]);

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

    if (!error && data) {
      setTimeEntries(data);
    }
  };

  useEffect(() => {
    fetchTimeEntries();
  }, []);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const updateTimeEntryStatus = async (entryId: string, status: string) => {
    const { error } = await supabase
      .from("time_entries")
      .update({ status })
      .eq("id", entryId);

    if (error) {
      toast({
        title: "Error updating time entry status",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Time entry status updated successfully",
    });

    fetchTimeEntries();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Time Entries</h2>
      <div className="bg-white rounded-xl border shadow-sm divide-y">
        {timeEntries.map((entry) => (
          <div key={entry.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{entry.project.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {entry.project.client.name}
                </p>
              </div>
              <div className="text-right space-y-2">
                <p className="font-medium">{formatDuration(entry.duration)}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(entry.start_time), "MMM d, yyyy")}
                </p>
                <Select
                  value={entry.status || "pending"}
                  onValueChange={(value) => updateTimeEntryStatus(entry.id, value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="invoiced">Invoiced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ))}
        {timeEntries.length === 0 && (
          <div className="p-4 text-center text-muted-foreground">
            No time entries yet
          </div>
        )}
      </div>
    </div>
  );
}