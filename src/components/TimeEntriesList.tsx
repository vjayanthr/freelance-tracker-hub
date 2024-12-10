import { useEffect, useState } from "react";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import type { TimeEntry } from "@/types";

export default function TimeEntriesList() {
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
              <div className="text-right">
                <p className="font-medium">{formatDuration(entry.duration)}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(entry.start_time), "MMM d, yyyy")}
                </p>
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