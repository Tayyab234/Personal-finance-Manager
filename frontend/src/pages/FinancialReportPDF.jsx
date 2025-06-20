// src/FinancialReportPDF.jsx
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// PDF Styles
const styles = StyleSheet.create({
  page: { padding: 30 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#000', borderBottomStyle: 'solid', marginBottom: 5 },
  headerCell: { flex: 1, fontSize: 12, fontWeight: 'bold' },
  row: { flexDirection: 'row', marginBottom: 5 },
  cell: { flex: 1, fontSize: 10 },
});

// PDF Component
const FinancialReportPDF = ({ reportData }) => (
  <Document>
    <Page style={styles.page}>
      <Text style={styles.title}>Financial Report</Text>

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={styles.headerCell}>#</Text>
        <Text style={styles.headerCell}>Category</Text>
        <Text style={styles.headerCell}>Amount</Text>
        <Text style={styles.headerCell}>Description</Text>
        <Text style={styles.headerCell}>Date</Text>
      </View>

      {/* Table Rows */}
      {reportData.flatMap((item, index) =>
        item.transactions.map((tx, idx) => (
          <View style={styles.row} key={`${index}-${idx}`}>
            <Text style={styles.cell}>{index + 1}</Text>
            <Text style={styles.cell}>{item._id || 'Deleted Category'}</Text>
            <Text style={styles.cell}>${tx.amount.toFixed(2)}</Text>
            <Text style={styles.cell}>{tx.description}</Text>
            <Text style={styles.cell}>{new Date(tx.date).toLocaleDateString()}</Text>
          </View>
        ))
      )}
    </Page>
  </Document>
);

export default FinancialReportPDF;
