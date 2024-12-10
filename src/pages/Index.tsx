import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import Timer from "@/components/Timer";
import TimeEntriesList from "@/components/TimeEntriesList";
import InvoiceList from "@/components/InvoiceList";
import ClientForm from "@/components/ClientForm";
import ProjectForm from "@/components/ProjectForm";
import InvoiceForm from "@/components/InvoiceForm";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import type { Client, Project } from "@/types";

export default function Index() {
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const fetchData = async () => {
    const { data: clientsData } = await supabase.from("clients").select("*");
    const { data: projectsData } = await supabase
      .from("projects")
      .select("*, client:clients(*)");

    if (clientsData) setClients(clientsData);
    if (projectsData) setProjects(projectsData);
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

        {/* Active Projects with Timers */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Active Projects</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {projects.map((project) => (
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

        {/* Time Entries List */}
        <TimeEntriesList />

        {/* Invoices List */}
        <InvoiceList />
      </div>
    </Layout>
  );
}