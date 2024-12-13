import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface SubscriptionLimits {
  maxClients: number;
  maxProjects: number;
  maxInvoices: number;
  maxTimeEntries: number;
}

export interface UsageStats {
  clientCount: number;
  projectCount: number;
  invoiceCount: number;
  timeEntryCount: number;
}

export function useSubscription() {
  const { data: subscription } = useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single();

      return data?.is_paid ? "paid" : "free";
    }
  });

  const { data: usageStats } = useQuery({
    queryKey: ["usage-stats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const [
        { count: clientCount },
        { count: projectCount },
        { count: invoiceCount },
        { count: timeEntryCount }
      ] = await Promise.all([
        supabase.from("clients").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("projects").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("invoices").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("time_entries").select("*", { count: "exact", head: true }).eq("user_id", user.id)
      ]);

      return {
        clientCount: clientCount || 0,
        projectCount: projectCount || 0,
        invoiceCount: invoiceCount || 0,
        timeEntryCount: timeEntryCount || 0
      };
    }
  });

  const limits: SubscriptionLimits = subscription === "paid" ? {
    maxClients: Infinity,
    maxProjects: Infinity,
    maxInvoices: Infinity,
    maxTimeEntries: Infinity
  } : {
    maxClients: 1,
    maxProjects: 3,
    maxInvoices: 5,
    maxTimeEntries: 10
  };

  const isAtLimit = {
    clients: (usageStats?.clientCount || 0) >= limits.maxClients,
    projects: (usageStats?.projectCount || 0) >= limits.maxProjects,
    invoices: (usageStats?.invoiceCount || 0) >= limits.maxInvoices,
    timeEntries: (usageStats?.timeEntryCount || 0) >= limits.maxTimeEntries
  };

  return {
    type: subscription || "free",
    limits,
    usageStats,
    isAtLimit
  };
}