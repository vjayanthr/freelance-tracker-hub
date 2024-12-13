import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import { format } from "date-fns";

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  info: {
    fontSize: 12,
    marginBottom: 5,
  },
  table: {
    display: "flex",
    width: "100%",
    marginTop: 20,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
    alignItems: "center",
    minHeight: 24,
  },
  tableHeader: {
    backgroundColor: "#f0f0f0",
  },
  tableCell: {
    flex: 1,
    padding: 5,
  },
  total: {
    marginTop: 20,
    textAlign: "right",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export const InvoicePDF = ({ invoice }: { invoice: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Invoice</Text>
        <Text style={styles.info}>Invoice Number: {invoice.invoice_number}</Text>
        <Text style={styles.info}>
          Issue Date: {format(new Date(invoice.issue_date), "PP")}
        </Text>
        <Text style={styles.info}>
          Due Date: {format(new Date(invoice.due_date), "PP")}
        </Text>
      </View>

      <View>
        <Text style={styles.info}>Client: {invoice.project?.client?.name}</Text>
        <Text style={styles.info}>Project: {invoice.project?.name}</Text>
      </View>

      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={styles.tableCell}>Description</Text>
          <Text style={styles.tableCell}>Amount</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Project Services</Text>
          <Text style={styles.tableCell}>${invoice.total_amount.toFixed(2)}</Text>
        </View>
      </View>

      <Text style={styles.total}>
        Total Amount: ${invoice.total_amount.toFixed(2)}
      </Text>
    </Page>
  </Document>
);