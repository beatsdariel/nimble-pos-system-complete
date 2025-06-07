
import React from 'react';
import { Sale, Customer } from '@/types/pos';
import { useSettings } from '@/contexts/SettingsContext';
import { toast } from 'sonner';

interface InvoicePrintProps {
  sale: Sale;
  customer?: Customer;
  onPrint: () => void;
  type?: 'sale' | 'credit-note' | 'return';
  returnData?: {
    returnAmount: number;
    returnId: string;
    returnItems?: any[];
    returnReason?: string;
  };
}

const InvoicePrint: React.FC<InvoicePrintProps> = ({ 
  sale, 
  customer, 
  onPrint, 
  type = 'sale',
  returnData 
}) => {
  const { businessSettings } = useSettings();
  
  const printInvoice = () => {
    const documentType = type === 'credit-note' ? 'NOTA DE CRÉDITO' :
                        type === 'return' ? 'FACTURA DE DEVOLUCIÓN' : 'FACTURA DE VENTA';
    
    console.log(`Imprimiendo ${documentType.toLowerCase()}:`, {
      saleId: sale.id,
      receiptNumber: sale.receiptNumber,
      date: sale.date,
      customer: customer ? {
        name: customer.name,
        document: customer.document,
        address: customer.address
      } : 'Cliente General',
      items: sale.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity
      })),
      subtotal: sale.subtotal,
      tax: sale.tax,
      total: sale.total,
      type,
      returnData
    });

    // Calcular ITBIS correctamente (incluido en el precio)
    const taxRate = businessSettings?.taxRate || 18;
    const itemsWithTax = sale.items.map(item => {
      const totalAmount = item.price * item.quantity;
      // El ITBIS está incluido en el precio, calculamos el valor sin impuesto
      const basePrice = totalAmount / (1 + (taxRate / 100));
      const taxAmount = totalAmount - basePrice;
      
      return {
        ...item,
        basePrice: basePrice / item.quantity,
        basePriceTotal: basePrice,
        taxAmount: taxAmount,
        totalWithTax: totalAmount
      };
    });

    const subtotalBase = itemsWithTax.reduce((sum, item) => sum + item.basePriceTotal, 0);
    const totalTax = itemsWithTax.reduce((sum, item) => sum + item.taxAmount, 0);
    const grandTotal = subtotalBase + totalTax;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
        <head>
          <title>${documentType} ${sale.receiptNumber}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              font-size: 12px;
              line-height: 1.4;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #333;
              padding-bottom: 15px;
            }
            .company-name { 
              font-size: 20px; 
              font-weight: bold; 
              margin-bottom: 5px;
            }
            .company-info { 
              font-size: 11px; 
              color: #666;
            }
            .document-title {
              font-size: 18px;
              font-weight: bold;
              text-align: center;
              margin: 20px 0;
              padding: 10px;
              border: 2px solid #333;
              background-color: #f5f5f5;
            }
            .invoice-info { 
              margin-bottom: 20px; 
              display: flex;
              justify-content: space-between;
            }
            .invoice-info div {
              flex: 1;
            }
            .customer-info { 
              margin-bottom: 20px; 
              border: 1px solid #ddd;
              padding: 10px;
              background-color: #f9f9f9;
            }
            .items-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 20px; 
            }
            .items-table th, .items-table td { 
              border: 1px solid #ddd; 
              padding: 6px; 
              text-align: left; 
              font-size: 11px;
            }
            .items-table th { 
              background-color: #333; 
              color: white;
              font-weight: bold;
            }
            .items-table td.number { 
              text-align: right; 
            }
            .totals { 
              margin-left: auto;
              width: 300px;
              border: 1px solid #333;
              padding: 10px;
            }
            .total-line { 
              display: flex; 
              justify-content: space-between; 
              margin: 5px 0; 
              padding: 2px 0;
            }
            .final-total { 
              font-weight: bold; 
              font-size: 14px; 
              border-top: 2px solid #333;
              padding-top: 5px;
              margin-top: 10px;
            }
            .payments { 
              margin-top: 20px; 
              border: 1px solid #ddd;
              padding: 10px;
            }
            .footer { 
              margin-top: 30px; 
              text-align: center; 
              font-size: 10px; 
              border-top: 1px solid #ddd;
              padding-top: 15px;
            }
            .credit-note-info {
              background-color: #fff3cd;
              border: 2px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 5px;
            }
            .return-info {
              background-color: #f8d7da;
              border: 2px solid #dc3545;
              padding: 15px;
              margin: 20px 0;
              border-radius: 5px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">${businessSettings?.name || 'MI EMPRESA'}</div>
            <div class="company-info">
              ${businessSettings?.rnc ? `RNC: ${businessSettings.rnc}` : ''}<br>
              ${businessSettings?.address || ''}<br>
              ${businessSettings?.phone ? `Tel: ${businessSettings.phone}` : ''}<br>
              ${businessSettings?.email || ''}
            </div>
          </div>

          <div class="document-title">${documentType}</div>

          <div class="invoice-info">
            <div>
              <strong>Número:</strong> ${sale.receiptNumber}<br>
              <strong>Fecha:</strong> ${new Date(sale.date).toLocaleDateString()}<br>
              <strong>Hora:</strong> ${new Date(sale.date).toLocaleTimeString()}
            </div>
            <div>
              <strong>Estado:</strong> ${
                sale.status === 'completed' ? 'Completada' : 
                sale.status === 'credit' ? 'A Crédito' : 
                sale.status === 'returned' ? 'Devuelta' :
                sale.status
              }<br>
              ${type === 'credit-note' ? '<strong>Tipo:</strong> Nota de Crédito' : ''}
              ${type === 'return' ? '<strong>Tipo:</strong> Devolución' : ''}
            </div>
          </div>

          ${type === 'credit-note' ? `
            <div class="credit-note-info">
              <strong>⚠️ NOTA DE CRÉDITO</strong><br>
              Monto del crédito: ${businessSettings?.currency || 'RD$'} ${returnData?.returnAmount?.toLocaleString() || '0.00'}<br>
              ${returnData?.returnReason ? `Motivo: ${returnData.returnReason}` : ''}
            </div>
          ` : ''}

          ${type === 'return' ? `
            <div class="return-info">
              <strong>📦 DEVOLUCIÓN</strong><br>
              Monto de devolución: ${businessSettings?.currency || 'RD$'} ${returnData?.returnAmount?.toLocaleString() || '0.00'}<br>
              Factura original: ${sale.receiptNumber}<br>
              ${returnData?.returnReason ? `Motivo: ${returnData.returnReason}` : ''}
            </div>
          ` : ''}

          <div class="customer-info">
            <strong>DATOS DEL CLIENTE:</strong><br>
            ${customer ? `
              <strong>Nombre:</strong> ${customer.name}<br>
              ${customer.document ? `<strong>Documento:</strong> ${customer.document}<br>` : ''}
              ${customer.address ? `<strong>Dirección:</strong> ${customer.address}<br>` : ''}
              ${customer.phone ? `<strong>Teléfono:</strong> ${customer.phone}<br>` : ''}
            ` : '<strong>Nombre:</strong> CONSUMIDOR FINAL'}
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 40%">Descripción</th>
                <th style="width: 10%">Cant.</th>
                <th style="width: 15%">Precio Base</th>
                <th style="width: 15%">Valor Base</th>
                <th style="width: 10%">ITBIS</th>
                <th style="width: 15%">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsWithTax.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td class="number">${item.quantity}</td>
                  <td class="number">${businessSettings?.currency || 'RD$'} ${item.basePrice.toFixed(2)}</td>
                  <td class="number">${businessSettings?.currency || 'RD$'} ${item.basePriceTotal.toFixed(2)}</td>
                  <td class="number">${businessSettings?.currency || 'RD$'} ${item.taxAmount.toFixed(2)}</td>
                  <td class="number">${businessSettings?.currency || 'RD$'} ${item.totalWithTax.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div class="total-line">
              <span>Subtotal (Base):</span>
              <span>${businessSettings?.currency || 'RD$'} ${subtotalBase.toFixed(2)}</span>
            </div>
            <div class="total-line">
              <span>ITBIS (${taxRate}%):</span>
              <span>${businessSettings?.currency || 'RD$'} ${totalTax.toFixed(2)}</span>
            </div>
            <div class="total-line final-total">
              <span>TOTAL:</span>
              <span>${businessSettings?.currency || 'RD$'} ${grandTotal.toLocaleString()}</span>
            </div>
          </div>

          <div class="payments">
            <strong>FORMAS DE PAGO:</strong><br>
            ${sale.payments.map(payment => {
              const paymentType = payment.type === 'cash' ? 'Efectivo' : 
                               payment.type === 'card' ? 'Tarjeta' : 
                               payment.type === 'transfer' ? 'Transferencia' : 
                               payment.type === 'credit' ? 'Crédito' : 
                               payment.type === 'return' ? 'Devolución' :
                               payment.type === 'credit-note' ? 'Nota de Crédito' :
                               payment.type;
              const reference = payment.reference ? ` (Ref: ${payment.reference})` : '';
              return `• ${paymentType}: ${businessSettings?.currency || 'RD$'} ${payment.amount.toLocaleString()}${reference}<br>`;
            }).join('')}
          </div>

          ${sale.dueDate ? `
            <div style="margin-top: 20px; padding: 10px; background-color: #fff3cd; border: 1px solid #ffeeba;">
              <strong>⏰ VENTA A CRÉDITO</strong><br>
              Fecha de vencimiento: ${new Date(sale.dueDate).toLocaleDateString()}
            </div>
          ` : ''}

          <div class="footer">
            <p><strong>${businessSettings?.name || 'MI EMPRESA'}</strong></p>
            <p>Esta factura es válida como comprobante de compra</p>
            <p>Impreso el: ${new Date().toLocaleString()}</p>
            ${businessSettings?.rnc ? `<p>RNC: ${businessSettings.rnc}</p>` : ''}
          </div>
        </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }

    toast.success(`${documentType} enviada a impresión`);
    onPrint();
  };

  // Auto print when component mounts
  React.useEffect(() => {
    const timer = setTimeout(() => {
      printInvoice();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return null;
};

export default InvoicePrint;
