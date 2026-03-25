import { jsPDF } from 'jspdf';
import { Bill } from './types';

const formatCurrency = (amount: number): string => {
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `Rs. ${formatted}`;
};

export function generatePDF(bill: Bill) {
  const blob = generatePDFBlob(bill);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Chakra_Bill_${bill.bill_number}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function numberToWords(num: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (num === 0) return 'Zero';

  const intNum = Math.floor(num);

  if (intNum < 20) return ones[intNum];

  if (intNum < 100) {
    return tens[Math.floor(intNum / 10)] + (intNum % 10 !== 0 ? ' ' + ones[intNum % 10] : '');
  }

  if (intNum < 1000) {
    return ones[Math.floor(intNum / 100)] + ' Hundred' + (intNum % 100 !== 0 ? ' ' + numberToWords(intNum % 100) : '');
  }

  if (intNum < 100000) {
    return numberToWords(Math.floor(intNum / 1000)) + ' Thousand' + (intNum % 1000 !== 0 ? ' ' + numberToWords(intNum % 1000) : '');
  }

  if (intNum < 10000000) {
    return numberToWords(Math.floor(intNum / 100000)) + ' Lakh' + (intNum % 100000 !== 0 ? ' ' + numberToWords(intNum % 100000) : '');
  }

  return numberToWords(Math.floor(intNum / 10000000)) + ' Crore' + (intNum % 10000000 !== 0 ? ' ' + numberToWords(intNum % 10000000) : '');
}

function generatePDFBlob(bill: Bill): Blob {
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('CHAKRA', pageWidth / 2, 25, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Professional Bike Service Center', pageWidth / 2, 33, { align: 'center' });
  doc.text('Phone: +91 9876543210', pageWidth / 2, 39, { align: 'center' });

  doc.setDrawColor(220, 38, 38);
  doc.setLineWidth(0.5);
  doc.line(20, 45, pageWidth - 20, 45);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(`Bill #${bill.bill_number}`, 20, 55);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Date: ${new Date(bill.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`, pageWidth - 20, 55, { align: 'right' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Customer Details', 20, 70);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  const customerDetails = [
    `Bike Number: ${bill.bike_number}`,
    `Bike Name:   ${bill.bike_name}`,
    `Customer:    ${bill.customer_name}`,
    `Mobile:      ${bill.mobile}`,
  ];

  customerDetails.forEach((line, index) => {
    doc.text(line, 20, 78 + (index * 6));
  });

  doc.setDrawColor(226, 232, 240);
  doc.line(20, 105, pageWidth - 20, 105);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Service Details', 20, 115);

  let yPos = 125;

  const servicesFromItems = bill.service_items?.reduce((sum, item) => sum + item.price, 0) || 0;
  const partsFromItems = bill.parts_items?.reduce((sum, item) => sum + item.price, 0) || 0;
  const serviceAdjustment = bill.service_amount - servicesFromItems;
  const partsAdjustment = bill.parts_amount - partsFromItems;

  if (bill.service_items && bill.service_items.length > 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Services:', 20, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    bill.service_items.forEach((item) => {
      doc.text(`${item.name}:`, 25, yPos);
      doc.text(formatCurrency(item.price), pageWidth - 20, yPos, { align: 'right' });
      yPos += 5;
    });
    if (serviceAdjustment !== 0) {
      doc.setTextColor(serviceAdjustment > 0 ? 22 : 220, serviceAdjustment > 0 ? 163 : 38, serviceAdjustment > 0 ? 94 : 38);
      doc.text(`Manual Adjustment:`, 25, yPos);
      doc.text(`${serviceAdjustment > 0 ? '+' : ''}${formatCurrency(serviceAdjustment)}`, pageWidth - 20, yPos, { align: 'right' });
      yPos += 5;
    }
  } else if (bill.service_amount > 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Service:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const splitDesc = doc.splitTextToSize(bill.service_desc, pageWidth - 60);
    doc.text(splitDesc, 35, yPos);
    yPos += splitDesc.length * 5;
  }

  if (bill.parts_items && bill.parts_items.length > 0) {
    yPos += 3;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Parts:', 20, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    bill.parts_items.forEach((item) => {
      doc.text(`${item.name}:`, 25, yPos);
      doc.text(formatCurrency(item.price), pageWidth - 20, yPos, { align: 'right' });
      yPos += 5;
    });
    if (partsAdjustment !== 0) {
      doc.setTextColor(partsAdjustment > 0 ? 22 : 220, partsAdjustment > 0 ? 163 : 38, partsAdjustment > 0 ? 94 : 38);
      doc.text(`Manual Adjustment:`, 25, yPos);
      doc.text(`${partsAdjustment > 0 ? '+' : ''}${formatCurrency(partsAdjustment)}`, pageWidth - 20, yPos, { align: 'right' });
      yPos += 5;
    }
  } else if (bill.parts_amount > 0) {
    yPos += 3;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Parts:', 20, yPos);
    doc.text(formatCurrency(bill.parts_amount), pageWidth - 20, yPos, { align: 'right' });
    yPos += 7;
  } else {
    yPos += 7;
  }

  doc.setDrawColor(226, 232, 240);
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 8;

  if (bill.gst_amount > 0) {
    doc.text(`GST (${bill.gst_percent}%):`, 20, yPos);
    doc.text(formatCurrency(bill.gst_amount), pageWidth - 20, yPos, { align: 'right' });
    yPos += 7;
  }

  if (bill.discount > 0) {
    doc.setTextColor(220, 38, 38);
    doc.text('Discount:', 20, yPos);
    doc.text(`-${formatCurrency(bill.discount)}`, pageWidth - 20, yPos, { align: 'right' });
    yPos += 7;
  }

  doc.setDrawColor(226, 232, 240);
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 10;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Total Amount:', 20, yPos);
  doc.setTextColor(220, 38, 38);
  doc.text(formatCurrency(bill.total), pageWidth - 20, yPos, { align: 'right' });

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  const amountWords = numberToWords(bill.total);
  doc.text(`Amount in Words: ${amountWords} Rupees Only`, 20, yPos + 10);

  doc.setDrawColor(220, 38, 38);
  doc.line(20, yPos + 20, pageWidth - 20, yPos + 20);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('Thank you for choosing Chakra!', pageWidth / 2, yPos + 30, { align: 'center' });
  doc.text('Please visit again!', pageWidth / 2, yPos + 36, { align: 'center' });

  return doc.output('blob');
}

export async function shareToWhatsApp(bill: Bill) {
  const message = `*CHAKRA*

*Bill #${bill.bill_number}*
Date: ${new Date(bill.created_at).toLocaleDateString('en-IN')}

*Customer Details:*
Bike: ${bill.bike_number} (${bill.bike_name})
Name: ${bill.customer_name}
Mobile: ${bill.mobile}

*Service:* ${bill.service_desc}

*Amount Details:*
Service: ${formatCurrency(bill.service_amount)}
${bill.parts_amount > 0 ? `Parts: ${formatCurrency(bill.parts_amount)}\n` : ''}${bill.gst_amount > 0 ? `GST (${bill.gst_percent}%): ${formatCurrency(bill.gst_amount)}\n` : ''}${bill.discount > 0 ? `Discount: -${formatCurrency(bill.discount)}\n` : ''}

*Total: ${formatCurrency(bill.total)}*

Thank you for choosing Chakra!`;

  if (navigator.share && navigator.canShare) {
    try {
      const pdfBlob = generatePDFBlob(bill);
      const pdfFile = new File([pdfBlob], `Chakra_Bill_${bill.bill_number}.pdf`, { type: 'application/pdf' });
      
      const shareData = {
        title: `Bill #${bill.bill_number} - Chakra`,
        text: message,
        files: [pdfFile],
      };

      if (navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return true;
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Share error:', error);
      }
    }
  }

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
  return true;
}
