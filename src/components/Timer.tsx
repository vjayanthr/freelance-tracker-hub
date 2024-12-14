import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface TimerProps {
  projectId: string;
  projectName: string;
  clientName: string;
  onTimeEntryCreated?: () => void;
}

export default function Timer({
  projectId,
  projectName,
  clientName,
  onTimeEntryCreated,
}: TimerProps) {
  const { toast } = useToast();
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeEntryId, setTimeEntryId] = useState<string | null>(null);
  const [pausedTime, setPausedTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [description, setDescription] = useState("");

  const handleStart = () => {
    setStartTime(new Date());
    setPausedTime(null);
  };

  const handlePause = () => {
    if (startTime) {
      const currentTime = new Date();
      const duration = Math.floor(
        (currentTime.getTime() - startTime.getTime()) / 1000
      );
      setElapsedTime(duration);
      setPausedTime(duration);
      setStartTime(null);
    }
  };

  const handleStop = async () => {
    if (!startTime) return;

    setLoading(true);
    const endTime = new Date();
    const duration = Math.floor(
      (endTime.getTime() - startTime.getTime()) / 1000
    );

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      // Only create a time entry if we haven't already (prevents duplicates)
      if (!timeEntryId) {
        const { error } = await supabase.from("time_entries").insert({
          project_id: projectId,
          user_id: userData.user.id,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          duration,
          description,
        });

        if (error) throw error;

        if (onTimeEntryCreated) onTimeEntryCreated();
      }
    } catch (error) {
      console.error("Error saving time entry:", error);
      toast({
        title: "Error saving time entry",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setTimeEntryId(null);
      setStartTime(null);
      setPausedTime(null);
      setElapsedTime(0);
      setDescription("");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <div>
        <h3 className="text-lg font-semibold">{projectName}</h3>
        <p className="text-sm text-muted-foreground">{clientName}</p>
      </div>
      <div className="flex items-center space-x-2">
        <Button onClick={handleStart} disabled={loading || !!startTime}>
          Start
        </Button>
        <Button onClick={handlePause} disabled={loading || !startTime}>
          Pause
        </Button>
        <Button onClick={handleStop} disabled={loading || !startTime}>
          Stop
        </Button>
      </div>
    </div>
  );
}
