import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricsProps {
  financialMetrics: {
    totalBilled: number;
    totalPaid: number;
    totalInvoiced: number;
    totalNotInvoiced: number;
  };
}

export default function DashboardMetrics({ financialMetrics }: MetricsProps) {
  const unpaidInvoiced = financialMetrics.totalInvoiced - financialMetrics.totalPaid;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Billed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ₹{financialMetrics.totalBilled.toFixed(2)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ₹{financialMetrics.totalPaid.toFixed(2)}
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
            ₹{unpaidInvoiced.toFixed(2)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Not Invoiced</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ₹{financialMetrics.totalNotInvoiced.toFixed(2)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}