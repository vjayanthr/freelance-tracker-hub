export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status?: string;
  created_at?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  client_id: string;
  rate: number;
  client: Client;
  status?: string;
  created_at?: string;
}

export interface TimeEntry {
  id: string;
  start_time: string;
  end_time: string;
  duration: number;
  description: string;
  project_id: string;
  invoice_id: string | null;
  status?: string;
  project?: {
    name: string;
    rate?: number;
    client: {
      name: string;
    };
  };
  invoice?: {
    status: string;
  };
}