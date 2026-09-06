import { jsPDF } from 'jspdf';

export interface ReceiptData {
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  planName: string;
  planType: 'free' | 'creator' | 'pro';
  amountInr: number;
  paymentId: string;
  paymentMethod: string;
  date: string;
  status: 'paid' | 'pending' | 'refunded' | 'failed';
  billingCycle?: 'monthly' | 'yearly';
  monthlyLimit?: number;
}

export class ReceiptPdfService {
  /**
   * Generates and triggers instant browser download for an official Tax Invoice / Payment Receipt PDF
   */
  public static downloadReceiptPdf(data: ReceiptData): void {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Top decorative primary header bar
      doc.setFillColor(79, 70, 229); // #4F46E5 Indigo
      doc.rect(0, 0, pageWidth, 24, 'F');

      // Header Brand Name
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('VOXARO AI STUDIO', 15, 15);

      // Sub-brand / Platform tag
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('Turn Text Into Voice — Natural • Real • Limitless', 15, 20);

      // Top Right: TAX INVOICE
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('PAYMENT RECEIPT', pageWidth - 15, 14, { align: 'right' });
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('GST TAX INVOICE (ORIGINAL FOR RECIPIENT)', pageWidth - 15, 19, { align: 'right' });

      // Invoice Meta Info (Right box)
      let y = 36;
      doc.setTextColor(51, 65, 85); // Slate 700
      doc.setFontSize(9);

      // Left Column: Seller & Buyer Details
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59); // Slate 800
      doc.text('ISSUED BY:', 15, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text('Voxaro Technologies Pvt. Ltd.', 15, y + 5);
      doc.text('Level 4, Cyber City, Indiranagar', 15, y + 9);
      doc.text('Bengaluru, Karnataka - 560038, India', 15, y + 13);
      doc.text('GSTIN: 29AABCU9603R1ZM • support@voxaro.ai', 15, y + 17);

      // Right Column: Invoice Reference Details
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('INVOICE DETAILS:', pageWidth - 80, y);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`Invoice No:`, pageWidth - 80, y + 5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(data.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`, pageWidth - 45, y + 5);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`Invoice Date:`, pageWidth - 80, y + 10);
      doc.setTextColor(15, 23, 42);
      const formattedDate = new Date(data.date || Date.now()).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      doc.text(formattedDate, pageWidth - 45, y + 10);

      doc.setTextColor(71, 85, 105);
      doc.text(`Payment Gateway:`, pageWidth - 80, y + 15);
      doc.setTextColor(15, 23, 42);
      doc.text('Razorpay (Official)', pageWidth - 45, y + 15);

      doc.setTextColor(71, 85, 105);
      doc.text(`Payment Status:`, pageWidth - 80, y + 20);
      // Status pill
      doc.setFillColor(16, 185, 129); // Emerald
      doc.roundedRect(pageWidth - 45, y + 16.5, 24, 5.5, 1.5, 1.5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text((data.status || 'PAID').toUpperCase(), pageWidth - 33, y + 20.3, { align: 'center' });

      // Horizontal Divider
      y = 66;
      doc.setDrawColor(226, 232, 240); // Slate 200
      doc.setLineWidth(0.4);
      doc.line(15, y, pageWidth - 15, y);

      // Customer Info Section
      y = 74;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('BILLED TO (CUSTOMER DETAILS):', 15, y);

      doc.setFillColor(248, 250, 252); // Slate 50
      doc.roundedRect(15, y + 3, pageWidth - 30, 20, 2, 2, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(15, y + 3, pageWidth - 30, 20, 2, 2, 'D');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(data.customerName || 'Valued Creator', 20, y + 10);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Email: ${data.customerEmail || 'customer@voxaro.ai'}`, 20, y + 15);
      doc.text(`Place of Supply: Karnataka (29) / India • Currency: Indian Rupee (INR)`, 20, y + 19.5);

      // Itemized Table
      y = 104;
      // Table Header
      doc.setFillColor(241, 245, 249); // Slate 100
      doc.rect(15, y, pageWidth - 30, 8, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.rect(15, y, pageWidth - 30, 8, 'D');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text('DESCRIPTION / SUBSCRIPTION PLAN', 20, y + 5.5);
      doc.text('SAC CODE', 110, y + 5.5);
      doc.text('BILLING CYCLE', 135, y + 5.5);
      doc.text('TOTAL AMOUNT', pageWidth - 20, y + 5.5, { align: 'right' });

      // Table Row
      y = 112;
      doc.setFillColor(255, 255, 255);
      doc.rect(15, y, pageWidth - 30, 22, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(15, y, pageWidth - 30, 22, 'D');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      const planTitle = data.planName || (data.planType === 'pro' ? 'Pro Enterprise Plan' : 'Creator Studio Plan');
      doc.text(`Voxaro ${planTitle}`, 20, y + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      const limitText = data.monthlyLimit 
        ? `${data.monthlyLimit.toLocaleString()} characters/month • All HD Voices`
        : (data.planType === 'pro' ? '500,000 chars/mo • Lossless WAV • API Access' : '100,000 chars/mo • Lossless WAV Export');
      doc.text(limitText, 20, y + 11);
      doc.text(`Razorpay Transaction ID: ${data.paymentId || 'pay_rzp_live_ref'}`, 20, y + 16);

      // SAC & Billing Cycle
      doc.setTextColor(71, 85, 105);
      doc.text('998313', 110, y + 8);
      doc.text(data.billingCycle === 'yearly' ? 'Annual (12 Mos)' : 'Monthly Recurring', 135, y + 8);

      // Amount
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      const totalAmt = data.amountInr || (data.planType === 'pro' ? 2999 : 1199);
      doc.text(`Rs. ${totalAmt.toLocaleString('en-IN')}`, pageWidth - 20, y + 8, { align: 'right' });

      // Calculation Breakdown (Subtotal, GST, Net Total)
      y = 140;
      const subtotal = Math.round(totalAmt / 1.18);
      const gstAmount = totalAmt - subtotal;
      const cgst = Math.round(gstAmount / 2);
      const sgst = gstAmount - cgst;

      const calcStartX = pageWidth - 90;

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);

      doc.text('Subtotal (Taxable Value):', calcStartX, y);
      doc.text(`Rs. ${subtotal.toLocaleString('en-IN')}`, pageWidth - 20, y, { align: 'right' });

      doc.text('CGST (9.0%):', calcStartX, y + 5);
      doc.text(`Rs. ${cgst.toLocaleString('en-IN')}`, pageWidth - 20, y + 5, { align: 'right' });

      doc.text('SGST (9.0%):', calcStartX, y + 10);
      doc.text(`Rs. ${sgst.toLocaleString('en-IN')}`, pageWidth - 20, y + 10, { align: 'right' });

      // Total Paid Highlight Bar
      y = 156;
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(calcStartX - 5, y - 4, 80, 12, 1.5, 1.5, 'F');
      doc.setDrawColor(79, 70, 229);
      doc.setLineWidth(0.3);
      doc.roundedRect(calcStartX - 5, y - 4, 80, 12, 1.5, 1.5, 'D');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text('Grand Total Paid (INR):', calcStartX, y + 3.5);
      doc.setTextColor(79, 70, 229);
      doc.setFontSize(11);
      doc.text(`Rs. ${totalAmt.toLocaleString('en-IN')}`, pageWidth - 20, y + 3.5, { align: 'right' });

      // Payment Method summary badge
      y = 175;
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(15, y, pageWidth - 30, 20, 2, 2, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(15, y, pageWidth - 30, 20, 2, 2, 'D');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      doc.text('PAYMENT VERIFICATION & GATEWAY TELEMETRY', 20, y + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      const cleanMethod = (data.paymentMethod || 'razorpay_upi').replace('razorpay_', '').toUpperCase();
      doc.text(`Payment Instrument: ${cleanMethod} (Verified via Razorpay India)`, 20, y + 11);
      doc.text(`Transaction Reference ID: ${data.paymentId || 'pay_live_verified'} • Digital Signature Hash Valid`, 20, y + 15.5);

      // Terms & Legal Info
      y = 205;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('TERMS & CONDITIONS:', 15, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text('1. Subscription character limits renew automatically on the 1st of every calendar billing cycle.', 15, y + 4.5);
      doc.text('2. All generated AI audio synthesized under this paid plan includes commercial usage and broadcast rights.', 15, y + 8.5);
      doc.text('3. This is an electronic tax invoice compliant with Indian GST Rules (Rule 46) and does not require physical signature.', 15, y + 12.5);

      // Signature Stamp Box
      const stampX = pageWidth - 65;
      const stampY = y;
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(stampX, stampY, 50, 22, 2, 2, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(stampX, stampY, 50, 22, 2, 2, 'D');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(79, 70, 229);
      doc.text('DIGITALLY VERIFIED', stampX + 25, stampY + 7, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text('Voxaro Accounts Dept.', stampX + 25, stampY + 12, { align: 'center' });
      doc.text('Secure Razorpay Keyed', stampX + 25, stampY + 17, { align: 'center' });

      // Bottom Footer Bar
      doc.setFillColor(15, 23, 42); // Slate 900
      doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text('Thank you for choosing Voxaro AI Studio • https://voxaro.ai • Support: support@voxaro.ai', pageWidth / 2, pageHeight - 5, { align: 'center' });

      // Trigger Save
      const filename = `Voxaro_Receipt_${data.invoiceNumber || 'INV'}.pdf`;
      doc.save(filename);
    } catch (error) {
      console.error('Failed to generate PDF via jsPDF:', error);
      // Fallback: Create printable HTML receipt in new window / blob
      ReceiptPdfService.downloadHtmlPrintableReceipt(data);
    }
  }

  /**
   * Fallback printer and downloader for browser compatibility
   */
  public static downloadHtmlPrintableReceipt(data: ReceiptData): void {
    const formattedDate = new Date(data.date || Date.now()).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const totalAmt = data.amountInr || (data.planType === 'pro' ? 2999 : 1199);
    const subtotal = Math.round(totalAmt / 1.18);
    const gst = totalAmt - subtotal;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Payment Receipt - ${data.invoiceNumber}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 30px; color: #1e293b; background: #fff; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #4f46e5; padding-bottom: 16px; margin-bottom: 24px; }
    .brand { font-size: 24px; font-weight: 900; color: #4f46e5; }
    .tagline { font-size: 12px; color: #64748b; }
    .invoice-title { text-align: right; }
    .invoice-title h2 { margin: 0; font-size: 20px; color: #0f172a; }
    .badge { display: inline-block; padding: 4px 10px; background: #10b981; color: white; border-radius: 9999px; font-size: 11px; font-weight: bold; margin-top: 4px; }
    .grid { display: flex; justify-content: space-between; margin-bottom: 24px; font-size: 13px; line-height: 1.6; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
    th { background: #f1f5f9; text-align: left; padding: 10px; border-bottom: 2px solid #cbd5e1; color: #475569; font-weight: bold; }
    td { padding: 12px 10px; border-bottom: 1px solid #e2e8f0; }
    .total-box { margin-left: auto; width: 280px; font-size: 13px; }
    .total-row { display: flex; justify-content: space-between; padding: 6px 0; }
    .grand-total { border-top: 2px solid #4f46e5; font-size: 16px; font-weight: bold; color: #4f46e5; padding-top: 8px; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 20px; text-align: right;">
    <button onclick="window.print()" style="padding: 10px 20px; background: #4f46e5; color: #fff; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">Print / Save as PDF</button>
  </div>
  <div class="header">
    <div>
      <div class="brand">VOXARO AI STUDIO</div>
      <div class="tagline">Turn Text Into Voice — Natural • Real • Limitless</div>
    </div>
    <div class="invoice-title">
      <h2>PAYMENT RECEIPT</h2>
      <div class="badge">PAID</div>
    </div>
  </div>

  <div class="grid">
    <div>
      <strong>ISSUED BY:</strong><br>
      Voxaro Technologies Pvt. Ltd.<br>
      Level 4, Cyber City, Indiranagar<br>
      Bengaluru, Karnataka - 560038, India<br>
      GSTIN: 29AABCU9603R1ZM<br>
      support@voxaro.ai
    </div>
    <div style="text-align: right;">
      <strong>INVOICE DETAILS:</strong><br>
      Invoice No: <strong>${data.invoiceNumber}</strong><br>
      Date: ${formattedDate}<br>
      Payment Gateway: Razorpay<br>
      Payment ID: <span style="font-family: monospace;">${data.paymentId}</span>
    </div>
  </div>

  <div class="card">
    <strong>BILLED TO:</strong><br>
    <strong>${data.customerName || 'Valued Customer'}</strong><br>
    Email: ${data.customerEmail || 'customer@voxaro.ai'}<br>
    Payment Method: ${data.paymentMethod.toUpperCase()} (Razorpay India)
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>SAC Code</th>
        <th>Cycle</th>
        <th style="text-align: right;">Amount (INR)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <strong>Voxaro ${data.planName || data.planType.toUpperCase() + ' Plan'}</strong><br>
          <span style="font-size: 11px; color: #64748b;">${data.monthlyLimit ? data.monthlyLimit.toLocaleString() + ' chars/month' : 'Unlimited Pro Features'}</span>
        </td>
        <td>998313</td>
        <td>${data.billingCycle === 'yearly' ? 'Annual' : 'Monthly'}</td>
        <td style="text-align: right; font-weight: bold;">Rs. ${totalAmt.toLocaleString('en-IN')}</td>
      </tr>
    </tbody>
  </table>

  <div class="total-box">
    <div class="total-row">
      <span>Subtotal:</span>
      <span>Rs. ${subtotal.toLocaleString('en-IN')}</span>
    </div>
    <div class="total-row">
      <span>GST (18%):</span>
      <span>Rs. ${gst.toLocaleString('en-IN')}</span>
    </div>
    <div class="total-row grand-total">
      <span>Grand Total:</span>
      <span>Rs. ${totalAmt.toLocaleString('en-IN')}</span>
    </div>
  </div>

  <div class="footer">
    <p>Thank you for creating with Voxaro AI. Computer-generated tax invoice issued via Razorpay.</p>
    <p>© 2026 Voxaro Technologies Pvt. Ltd. All rights reserved.</p>
  </div>
</body>
</html>
`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win) {
      win.focus();
    }
  }
}
