import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export default function DashboardMetrics() {
  const { data: metrics } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch all necessary data
      const { data: timeEntries } = await supabase
        .from('time_entries')
        .select('duration, project_id, created_at')
        .eq('user_id', user.id);

      const { data: projects } = await supabase
        .from('projects')
        .select('id, status')
        .eq('user_id', user.id);

      const { data: clients } = await supabase
        .from('clients')
        .select('id, status')
        .eq('user_id', user.id);

      // Calculate metrics
      const now = new Date();
      const thisMonth = timeEntries?.filter(entry => {
        const entryDate = new Date(entry.created_at);
        return entryDate.getMonth() === now.getMonth() && 
               entryDate.getFullYear() === now.getFullYear();
      }) || [];

      const totalHoursThisMonth = thisMonth.reduce((acc, entry) => 
        acc + (entry.duration / 3600), 0);

      return {
        totalProjects: projects?.length || 0,
        activeProjects: projects?.filter(p => p.status === 'active').length || 0,
        totalClients: clients?.length || 0,
        activeClients: clients?.filter(c => c.status === 'active').length || 0,
        totalHoursThisMonth: Math.round(totalHoursThisMonth * 100) / 100,
        averageHoursPerDay: Math.round((totalHoursThisMonth / 30) * 100) / 100,
      };
    },
  });

  if (!metrics) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalProjects}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.activeProjects} active
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalClients}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.activeClients} active
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Hours This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalHoursThisMonth}</div>
          <p className="text-xs text-muted-foreground">
            ~{metrics.averageHoursPerDay} hours/day
          </p>
        </CardContent>
      </Card>
    </div>
  );
}