import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import Timer from "@/components/Timer";
import TimeEntriesList from "@/components/TimeEntriesList";
import InvoiceList from "@/components/InvoiceList";
import ClientForm from "@/components/ClientForm";
import ProjectForm from "@/components/ProjectForm";
import InvoiceForm from "@/components/InvoiceForm";
import ClientDetailsDialog from "@/components/ClientDetailsDialog";
import ProjectDetailsDialog from "@/components/ProjectDetailsDialog";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import type { Client, Project, TimeEntry } from "@/types";
import ClientList from "@/components/ClientList";
import ProjectList from "@/components/ProjectList";

export default function Index() {
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [recentTimeEntries, setRecentTimeEntries] = useState<TimeEntry[]>([]);
  const [unpaidInvoices, setUnpaidInvoices] = useState<any[]>([]);
  const [financialMetrics, setFinancialMetrics] = useState({
    totalBilled: 0,
    totalPaid: 0,
    totalInvoiced: 0,
    totalNotInvoiced: 0,
  });

  const fetchData = async () => {
    // Fetch clients
    const { data: clientsData } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    // Fetch projects
    const { data: projectsData } = await supabase
      .from("projects")
      .select("*, client:clients(*)")
      .order("created_at", { ascending: false })
      .limit(5);

    // Fetch recent time entries
    const { data: timeEntriesData } = await supabase
      .from("time_entries")
      .select("*, project:projects(name, client:clients(name))")
      .order("start_time", { ascending: false })
      .limit(5);

    // Fetch unpaid invoices
    const { data: invoicesData } = await supabase
      .from("invoices")
      .select("*, project:projects(name, client:clients(name))")
      .in("status", ["sent", "overdue"])
      .order("issue_date", { ascending: false });

    // Calculate financial metrics
    const { data: allTimeEntries } = await supabase
      .from("time_entries")
      .select("*, project:projects(rate), invoice:invoices(status)");

    if (allTimeEntries) {
      const metrics = allTimeEntries.reduce(
        (acc, entry) => {
          const entryAmount =
            (entry.duration / 3600) * (entry.project?.rate || 0);
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

    if (clientsData) setClients(clientsData);
    if (projectsData) setProjects(projectsData);
    if (timeEntriesData) setRecentTimeEntries(timeEntriesData);
    if (invoicesData) setUnpaidInvoices(invoicesData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage your clients and projects
            </p>
          </div>
          <div className="flex space-x-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-5 w-5 mr-2" />
                  New Client
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Client</DialogTitle>
                </DialogHeader>
                <ClientForm onSuccess={fetchData} />
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-5 w-5 mr-2" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Project</DialogTitle>
                </DialogHeader>
                <ProjectForm onSuccess={fetchData} />
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-5 w-5 mr-2" />
                  New Invoice
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate Invoice</DialogTitle>
                </DialogHeader>
                <InvoiceForm onSuccess={fetchData} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="time">Time Entries</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Financial Metrics */}
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

            {/* Recent Activity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Clients</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {clients.map((client) => (
                      <div
                        key={client.id}
                        className="flex items-center justify-between p-2 hover:bg-muted rounded-lg cursor-pointer"
                        onClick={() => setSelectedClient(client)}
                      >
                        <span>{client.name}</span>
                        <span className="text-muted-foreground">{client.status}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between p-2 hover:bg-muted rounded-lg cursor-pointer"
                        onClick={() => setSelectedProject(project)}
                      >
                        <div>
                          <div>{project.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {project.client.name}
                          </div>
                        </div>
                        <span className="text-muted-foreground">
                          ${project.rate}/hr
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Time Entries and Unpaid Invoices */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Time Entries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {recentTimeEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-2 hover:bg-muted rounded-lg"
                      >
                        <div>
                          <div>{entry.project.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {entry.project.client.name}
                          </div>
                        </div>
                        <span>
                          {Math.round((entry.duration / 3600) * 100) / 100} hours
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Unpaid Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {unpaidInvoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between p-2 hover:bg-muted rounded-lg"
                      >
                        <div>
                          <div>{invoice.invoice_number}</div>
                          <div className="text-sm text-muted-foreground">
                            {invoice.project.client.name} - {invoice.project.name}
                          </div>
                        </div>
                        <span>${invoice.total_amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Active Projects with Timers */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Active Projects</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {projects
                  .filter((project) => project.status === "active")
                  .map((project) => (
                    <Timer
                      key={project.id}
                      projectId={project.id}
                      projectName={project.name}
                      clientName={project.client.name}
                      onTimeEntryCreated={fetchData}
                    />
                  ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="clients">
            <ClientList onUpdate={fetchData} />
          </TabsContent>

          <TabsContent value="projects">
            <ProjectList onUpdate={fetchData} />
          </TabsContent>

          <TabsContent value="time">
            <TimeEntriesList />
          </TabsContent>

          <TabsContent value="invoices">
            <InvoiceList />
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <ClientDetailsDialog
        client={selectedClient!}
        open={!!selectedClient}
        onOpenChange={(open) => !open && setSelectedClient(null)}
        onProjectClick={setSelectedProject}
      />

      <ProjectDetailsDialog
        project={selectedProject!}
        open={!!selectedProject}
        onOpenChange={(open) => !open && setSelectedProject(null)}
      />
    </Layout>
  );
}