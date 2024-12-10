import { useState, useEffect } from "react";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { InvoicePDF } from "./InvoicePDF";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface Invoice {
  id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  total_amount: number;
  status: string;
  project: {
    name: string;
    client: {
      name: string;
    };
  };
}

export default function InvoiceList() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          project:projects (
            name,
            client:clients (
              name
            )
          )
        `)
        .eq("user_id", userData.user.id)
        .order("issue_date", { ascending: false });

      if (error) {
        console.error("Error fetching invoices:", error);
        return;
      }

      if (data) {
        setInvoices(data);
      }
      setLoading(false);
    };

    fetchInvoices();
  }, []);

  if (loading) {
    return <div>Loading invoices...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Invoices</h2>
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice Number</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.invoice_number}</TableCell>
                <TableCell>{invoice.project?.client?.name}</TableCell>
                <TableCell>{invoice.project?.name}</TableCell>
                <TableCell>
                  {format(new Date(invoice.issue_date), "PP")}
                </TableCell>
                <TableCell>{format(new Date(invoice.due_date), "PP")}</TableCell>
                <TableCell>${invoice.total_amount.toFixed(2)}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      invoice.status === "paid"
                        ? "bg-green-100 text-green-800"
                        : invoice.status === "draft"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {invoice.status}
                  </span>
                </TableCell>
                <TableCell>
                  <PDFDownloadLink
                    document={<InvoicePDF invoice={invoice} />}
                    fileName={`${invoice.invoice_number}.pdf`}
                  >
                    {({ loading }) => (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={loading}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                    )}
                  </PDFDownloadLink>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}