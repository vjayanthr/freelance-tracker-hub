import { useState, useEffect } from "react";
import { Play, Pause, StopCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimerProps {
  projectName: string;
  clientName: string;
}

export default function Timer({ projectName, clientName }: TimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);

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

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
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
            onClick={() => setIsRunning(!isRunning)}
            className={cn(
              "p-2 rounded-full transition-colors",
              isRunning ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
            )}
          >
            {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
          <button
            onClick={handleReset}
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