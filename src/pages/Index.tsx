import Layout from "@/components/Layout";
import Timer from "@/components/Timer";
import { Plus } from "lucide-react";

export default function Index() {
  // Mock data for demonstration
  const activeTimers = [
    { id: 1, projectName: "Website Redesign", clientName: "Acme Corp" },
    { id: 2, projectName: "Mobile App Development", clientName: "TechStart Inc" },
  ];

  const stats = [
    { label: "Hours this week", value: "32.5" },
    { label: "Active projects", value: "4" },
    { label: "Pending invoices", value: "$2,450" },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Time Tracking</h1>
            <p className="text-muted-foreground mt-1">Track time for your projects</p>
          </div>
          <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>New Timer</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-6 border animate-fade-up">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-semibold mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Active Timers */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Active Timers</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeTimers.map((timer) => (
              <Timer
                key={timer.id}
                projectName={timer.projectName}
                clientName={timer.clientName}
              />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}