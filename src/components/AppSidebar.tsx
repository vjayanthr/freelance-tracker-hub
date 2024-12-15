import { useState, useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Client, Project } from "@/types";

interface AppSidebarProps {
  onProjectSelect: (project: Project) => void;
}

export function AppSidebar({ onProjectSelect }: AppSidebarProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const [clientProjects, setClientProjects] = useState<Record<string, Project[]>>({});

  useEffect(() => {
    const fetchClients = async () => {
      const { data } = await supabase
        .from("clients")
        .select("*")
        .order("name");
      if (data) setClients(data);
    };
    fetchClients();
  }, []);

  useEffect(() => {
    const fetchProjects = async (clientId: string) => {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("client_id", clientId)
        .order("name");
      if (data) {
        setClientProjects(prev => ({
          ...prev,
          [clientId]: data
        }));
      }
    };

    if (expandedClient) {
      fetchProjects(expandedClient);
    }
  }, [expandedClient]);

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Clients</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {clients.map((client) => (
                <div key={client.id}>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setExpandedClient(
                        expandedClient === client.id ? null : client.id
                      )}
                      className="w-full flex items-center justify-between"
                    >
                      <span>{client.name}</span>
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${
                          expandedClient === client.id ? "rotate-90" : ""
                        }`}
                      />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  {expandedClient === client.id && clientProjects[client.id]?.map((project) => (
                    <SidebarMenuItem key={project.id} className="pl-4">
                      <SidebarMenuButton
                        onClick={() => onProjectSelect(project)}
                        className="text-sm"
                      >
                        {project.name}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </div>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}