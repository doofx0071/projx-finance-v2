import Papa from 'papaparse'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import type { TransactionWithCategory } from '@/types'

/**
 * Export Utilities for CSV and PDF
 * 
 * Provides functions to export transaction data to CSV and PDF formats.
 */

/**
 * Format currency for display (PHP Peso)
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount)
}

/**
 * Export transactions to CSV
 * 
 * @param transactions - Array of transactions to export
 * @param filename - Optional filename (default: transactions-YYYY-MM-DD.csv)
 */
export function exportToCSV(
  transactions: TransactionWithCategory[],
  filename?: string
): void {
  // Prepare data for CSV
  const csvData = transactions.map((transaction) => ({
    Date: format(new Date(transaction.date), 'yyyy-MM-dd'),
    Description: transaction.description || '',
    Category: transaction.categories?.name || 'Uncategorized',
    Type: transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1),
    Amount: transaction.amount,
  }))

  // Convert to CSV string
  const csv = Papa.unparse(csvData, {
    quotes: true, // Wrap fields in quotes
    header: true, // Include header row
  })

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute(
    'download',
    filename || `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`
  )
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Export transactions to PDF
 * 
 * @param transactions - Array of transactions to export
 * @param filename - Optional filename (default: transactions-YYYY-MM-DD.pdf)
 */
export function exportToPDF(
  transactions: TransactionWithCategory[],
  filename?: string
): void {
  // Create new PDF document (portrait, mm, a4)
  const doc = new jsPDF('p', 'mm', 'a4')

  const pageWidth = doc.internal.pageSize.getWidth()

  // Add header background
  doc.setFillColor(249, 115, 22) // Orange-500
  doc.rect(0, 0, pageWidth, 35, 'F')

  // Add title
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255) // White
  doc.text('PHPinancia', 14, 15)

  doc.setFontSize(16)
  doc.setFont('helvetica', 'normal')
  doc.text('Transaction Report', 14, 24)

  // Reset text color
  doc.setTextColor(0, 0, 0)

  // Add date range info
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generated on: ${format(new Date(), 'MMMM do, yyyy')}`, 14, 45)
  doc.text(`Total Transactions: ${transactions.length}`, 14, 51)

  // Calculate totals
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const netAmount = totalIncome - totalExpense

  // Add summary box
  doc.setFillColor(248, 250, 252) // Slate-50
  doc.roundedRect(14, 58, pageWidth - 28, 28, 2, 2, 'F')

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(71, 85, 105) // Slate-600

  doc.text('Total Income:', 18, 67)
  doc.setTextColor(34, 197, 94) // Green-500
  doc.text(formatCurrency(totalIncome), 60, 67)

  doc.setTextColor(71, 85, 105) // Slate-600
  doc.text('Total Expense:', 18, 74)
  doc.setTextColor(239, 68, 68) // Red-500
  doc.text(formatCurrency(totalExpense), 60, 74)

  doc.setTextColor(71, 85, 105) // Slate-600
  doc.text('Net Amount:', 18, 81)
  if (netAmount >= 0) {
    doc.setTextColor(34, 197, 94) // Green-500
  } else {
    doc.setTextColor(239, 68, 68) // Red-500
  }
  doc.text(formatCurrency(netAmount), 60, 81)

  // Reset text color
  doc.setTextColor(0, 0, 0)

  // Prepare table data
  const tableData = transactions.map((transaction) => [
    format(new Date(transaction.date), 'yyyy-MM-dd'),
    transaction.description || '-',
    transaction.categories?.name || 'Uncategorized',
    transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1),
    formatCurrency(transaction.amount),
  ])

  // Add table
  autoTable(doc, {
    head: [['Date', 'Description', 'Category', 'Type', 'Amount']],
    body: tableData,
    startY: 95,
    theme: 'striped',
    headStyles: {
      fillColor: [249, 115, 22], // Orange-500
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [51, 65, 85], // Slate-700
    },
    columnStyles: {
      0: { cellWidth: 25 }, // Date
      1: { cellWidth: 60 }, // Description
      2: { cellWidth: 35 }, // Category
      3: { cellWidth: 25, halign: 'center' }, // Type
      4: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }, // Amount
    },
    alternateRowStyles: {
      fillColor: [254, 243, 199], // Amber-100
    },
    margin: { top: 95, left: 14, right: 14 },
    didParseCell: function(data: any) {
      // Color code the Type column
      if (data.column.index === 3 && data.section === 'body') {
        const type = data.cell.raw
        if (type === 'Income') {
          data.cell.styles.textColor = [34, 197, 94] // Green-500
          data.cell.styles.fontStyle = 'bold'
        } else if (type === 'Expense') {
          data.cell.styles.textColor = [239, 68, 68] // Red-500
          data.cell.styles.fontStyle = 'bold'
        }
      }
      // Color code the Amount column
      if (data.column.index === 4 && data.section === 'body') {
        const rowData = tableData[data.row.index]
        const type = rowData[3]
        if (type === 'Income') {
          data.cell.styles.textColor = [34, 197, 94] // Green-500
        } else if (type === 'Expense') {
          data.cell.styles.textColor = [239, 68, 68] // Red-500
        }
      }
    },
  })

  // Add page numbers
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    )
  }

  // Save PDF
  doc.save(filename || `transactions-${format(new Date(), 'yyyy-MM-dd')}.pdf`)
}

/**
 * Export transactions with filters applied
 * 
 * @param transactions - Array of transactions to export
 * @param format - Export format ('csv' or 'pdf')
 * @param filters - Optional filter description for filename
 */
export function exportTransactions(
  transactions: TransactionWithCategory[],
  exportFormat: 'csv' | 'pdf',
  filters?: string
): void {
  if (transactions.length === 0) {
    alert('No transactions to export')
    return
  }

  const timestamp = format(new Date(), 'yyyy-MM-dd')
  const filterSuffix = filters ? `-${filters}` : ''
  const filename = `transactions${filterSuffix}-${timestamp}`

  if (exportFormat === 'csv') {
    exportToCSV(transactions, `${filename}.csv`)
  } else {
    exportToPDF(transactions, `${filename}.pdf`)
  }
}

/**
 * Example usage:
 * 
 * ```typescript
 * import { exportTransactions } from '@/lib/export'
 * 
 * // Export all transactions to CSV
 * exportTransactions(transactions, 'csv')
 * 
 * // Export filtered transactions to PDF
 * exportTransactions(filteredTransactions, 'pdf', 'expenses-2024')
 * ```
 */

