const { exportToCSV, getCSVFields } = require('../utils/csvExporter');
const PDFDocument = require('pdfkit');

class ExportService {
  async exportCSV(res, type, data) {
    try {
      const fields = getCSVFields(type);
      const csv = exportToCSV(data, fields);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${type}_export_${Date.now()}.csv`);
      res.status(200).send(csv);
    } catch (error) {
      throw new Error(`Failed to export ${type} to CSV: ${error.message}`);
    }
  }

  async generateInvoice(res, transaction) {
    try {
      const doc = new PDFDocument({ margin: 50 });
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Invoice_${transaction.invoiceNumber}.pdf`);
      
      doc.pipe(res);
      
      // Header
      doc.fontSize(20).text('KISAN BID - INVOICE', { align: 'center' });
      doc.moveDown();
      
      doc.fontSize(12)
         .text(`Invoice Number: ${transaction.invoiceNumber}`)
         .text(`Date: ${new Date(transaction.createdAt).toLocaleDateString()}`)
         .text(`Status: ${transaction.status.toUpperCase()}`);
      doc.moveDown();
      
      // Parties
      doc.text(`Farmer: ${transaction.farmerName}`);
      doc.text(`Buyer: ${transaction.buyerName}`);
      doc.moveDown();
      
      // Item Details
      doc.text(`Crop: ${transaction.cropName}`);
      doc.text(`Quantity: ${transaction.quantity} ${transaction.quantityUnit}`);
      doc.text(`Base Price: ₹${transaction.basePrice}`);
      doc.text(`Final Price (per unit): ₹${transaction.finalPrice}`);
      doc.moveDown();
      
      // Totals
      doc.text(`Total Amount: ₹${transaction.totalAmount}`, { underline: true });
      doc.text(`Platform Commission (${transaction.commissionPercent}%): ₹${transaction.commissionAmount}`);
      doc.text(`Farmer Receives: ₹${transaction.farmerReceives}`, { bold: true });
      
      doc.end();
    } catch (error) {
       throw new Error(`Failed to generate invoice: ${error.message}`);
    }
  }
}

module.exports = new ExportService();
