import { useState, useEffect } from "react";
import { Play, Pause, StopCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

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
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleStartStop = async () => {
    if (!isRunning) {
      setStartTime(new Date());
      setIsRunning(true);
    } else {
      setIsRunning(false);
      if (startTime) {
        try {
          const { data: userData } = await supabase.auth.getUser();
          if (!userData.user) throw new Error("Not authenticated");

          const endTime = new Date();
          const { error } = await supabase.from("time_entries").insert({
            user_id: userData.user.id,
            project_id: projectId,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            duration: time,
          });

          if (error) throw error;

          toast({
            title: "Time entry saved",
            description: `Tracked ${formatTime(time)} for ${projectName}`,
          });

          if (onTimeEntryCreated) onTimeEntryCreated();
        } catch (error) {
          console.error("Error saving time entry:", error);
          toast({
            title: "Error saving time entry",
            description: "Please try again",
            variant: "destructive",
          });
        }
      }
      handleReset();
    }
  };

  const handleStop = async () => {
    if (startTime) {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error("Not authenticated");

        const endTime = new Date();
        const { error } = await supabase.from("time_entries").insert({
          user_id: userData.user.id,
          project_id: projectId,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          duration: time,
        });

        if (error) throw error;

        toast({
          title: "Time entry saved",
          description: `Tracked ${formatTime(time)} for ${projectName}`,
        });

        if (onTimeEntryCreated) onTimeEntryCreated();
      } catch (error) {
        console.error("Error saving time entry:", error);
        toast({
          title: "Error saving time entry",
          description: "Please try again",
          variant: "destructive",
        });
      }
    }
    handleReset();
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    setStartTime(null);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">{projectName}</h3>
          <p className="text-sm text-muted-foreground">{clientName}</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleStartStop}
            className={cn(
              "p-2 rounded-full transition-colors",
              isRunning
                ? "bg-warning/10 text-warning"
                : "bg-success/10 text-success"
            )}
          >
            {isRunning ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={handleStop}
            className="p-2 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <StopCircle className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="text-3xl font-mono font-semibold">{formatTime(time)}</div>
    </div>
  );
}