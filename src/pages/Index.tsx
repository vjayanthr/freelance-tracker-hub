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
import DashboardMetrics from "@/components/DashboardMetrics";
import UpgradeDialog from "@/components/UpgradeDialog";
import ClientList from "@/components/ClientList";
import ProjectList from "@/components/ProjectList";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useSubscription } from "@/hooks/use-subscription";
import type { Client, Project } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Index() {
  const { toast } = useToast();
  const { isAtLimit } = useSubscription();
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [upgradeFeature, setUpgradeFeature] = useState<"clients" | "projects" | "invoices" | "timeEntries" | null>(null);
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

    // Fetch all time entries with their related invoices
    const { data: allTimeEntries } = await supabase
      .from("time_entries")
      .select(`
        *,
        project:projects (
          rate
        ),
        invoice:invoices (
          status
        )
      `);

    // Calculate financial metrics
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
            acc.totalBilled += entryAmount;
            acc.totalInvoiced += entryAmount;
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
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleNewClient = () => {
    if (isAtLimit.clients) {
      setUpgradeFeature("clients");
      return;
    }
    // Continue with creating new client
  };

  const handleNewProject = () => {
    if (isAtLimit.projects) {
      setUpgradeFeature("projects");
      return;
    }
    // Continue with creating new project
  };

  const handleNewInvoice = () => {
    if (isAtLimit.invoices) {
      setUpgradeFeature("invoices");
      return;
    }
    // Continue with creating new invoice
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage your clients and projects
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button onClick={handleNewClient}>
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
                <Button onClick={handleNewProject}>
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
                <Button onClick={handleNewInvoice}>
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
          <TabsList className="w-full sm:w-auto flex flex-wrap">
            <TabsTrigger value="overview" className="flex-1 sm:flex-none">Overview</TabsTrigger>
            <TabsTrigger value="clients" className="flex-1 sm:flex-none">Clients</TabsTrigger>
            <TabsTrigger value="projects" className="flex-1 sm:flex-none">Projects</TabsTrigger>
            <TabsTrigger value="time" className="flex-1 sm:flex-none">Time</TabsTrigger>
            <TabsTrigger value="invoices" className="flex-1 sm:flex-none">Invoices</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <DashboardMetrics financialMetrics={financialMetrics} />
            
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
                          ₹{project.rate}/hr
                        </span>
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

      <UpgradeDialog
        open={!!upgradeFeature}
        onOpenChange={(open) => !open && setUpgradeFeature(null)}
        feature={upgradeFeature!}
      />
    </Layout>
  );
}
