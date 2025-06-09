
import React from 'react';
import { Sale, Customer } from '@/types/pos';
import { useSettings } from '@/contexts/SettingsContext';
import { usePos } from '@/contexts/PosContext';
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
  const { getProduct } = usePos();
  
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

    // Calcular impuestos correctamente basado en los productos
    const itemsWithTax = sale.items.map(item => {
      const product = getProduct(item.productId);
      const totalAmount = item.price * item.quantity;
      
      // Si el producto no tiene ITBIS, no calcular impuesto
      if (!product?.hasTax || product.hasTax === false) {
        return {
          ...item,
          basePrice: item.price,
          basePriceTotal: totalAmount,
          taxAmount: 0,
          totalWithTax: totalAmount,
          hasItbis: false,
          unitOfMeasure: product?.unitOfMeasure || 'unidad'
        };
      }

      const taxRate = product?.taxRate || businessSettings?.taxRate || 18;
      
      // El ITBIS está incluido en el precio, calculamos el valor sin impuesto
      const basePrice = totalAmount / (1 + (taxRate / 100));
      const taxAmount = totalAmount - basePrice;
      
      return {
        ...item,
        basePrice: basePrice / item.quantity,
        basePriceTotal: basePrice,
        taxAmount: taxAmount,
        totalWithTax: totalAmount,
        hasItbis: true,
        unitOfMeasure: product?.unitOfMeasure || 'unidad'
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
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 0; 
              padding: 20px;
              font-size: 13px;
              line-height: 1.5;
              color: #333;
              background: white;
            }
            .invoice-container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              box-shadow: 0 0 20px rgba(0,0,0,0.1);
              border-radius: 8px;
              overflow: hidden;
            }
            .header { 
              background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);
              color: #fbbf24;
              text-align: center; 
              padding: 30px 20px;
              position: relative;
            }
            .header::after {
              content: '';
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              height: 4px;
              background: #fbbf24;
            }
            .company-name { 
              font-size: 28px; 
              font-weight: bold; 
              margin-bottom: 8px;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            }
            .company-info { 
              font-size: 14px; 
              opacity: 0.9;
              line-height: 1.6;
            }
            .document-title {
              font-size: 22px;
              font-weight: bold;
              text-align: center;
              margin: 25px 0;
              padding: 15px;
              background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
              color: #1a1a1a;
              border-radius: 8px;
              text-transform: uppercase;
              letter-spacing: 1px;
              box-shadow: 0 4px 8px rgba(251, 191, 36, 0.3);
            }
            .content-section {
              padding: 0 30px;
            }
            .invoice-info { 
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
              margin-bottom: 25px;
              padding: 20px;
              background: #f8f9fa;
              border-radius: 8px;
              border-left: 4px solid #fbbf24;
            }
            .info-group {
              display: flex;
              flex-direction: column;
              gap: 8px;
            }
            .info-label {
              font-weight: 600;
              color: #1a1a1a;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .info-value {
              font-size: 14px;
              color: #333;
            }
            .customer-info { 
              margin-bottom: 25px; 
              border: 2px solid #fbbf24;
              border-radius: 8px;
              padding: 20px;
              background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
            }
            .customer-title {
              font-size: 16px;
              font-weight: bold;
              color: #1a1a1a;
              margin-bottom: 10px;
              border-bottom: 2px solid #fbbf24;
              padding-bottom: 5px;
            }
            .items-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 25px;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            }
            .items-table th { 
              background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);
              color: #fbbf24;
              padding: 15px 12px;
              text-align: left;
              font-weight: bold;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .items-table td { 
              padding: 12px;
              border-bottom: 1px solid #e5e7eb;
              font-size: 13px;
              vertical-align: middle;
            }
            .items-table tbody tr:nth-child(even) {
              background-color: #f8f9fa;
            }
            .items-table tbody tr:hover {
              background-color: #fef3c7;
            }
            .items-table td.number { 
              text-align: right;
              font-weight: 500;
            }
            .unit-badge {
              display: inline-block;
              background: #fbbf24;
              color: #1a1a1a;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 10px;
              font-weight: bold;
              text-transform: uppercase;
              margin-left: 5px;
            }
            .totals-container {
              display: flex;
              justify-content: flex-end;
              margin-bottom: 25px;
            }
            .totals { 
              width: 350px;
              background: white;
              border: 2px solid #fbbf24;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 4px 8px rgba(251, 191, 36, 0.2);
            }
            .totals-header {
              background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
              color: #1a1a1a;
              padding: 10px 15px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .totals-body {
              padding: 15px;
            }
            .total-line { 
              display: flex; 
              justify-content: space-between; 
              margin: 8px 0; 
              padding: 5px 0;
              font-size: 14px;
            }
            .total-line.subtotal {
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 8px;
            }
            .total-line.tax {
              color: #6b7280;
            }
            .final-total { 
              font-weight: bold; 
              font-size: 18px; 
              color: #1a1a1a;
              border-top: 2px solid #fbbf24;
              padding-top: 10px;
              margin-top: 10px;
              background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
              padding: 10px;
              border-radius: 4px;
            }
            .payments { 
              margin-bottom: 25px;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 20px;
              background: #f8f9fa;
            }
            .payments-title {
              font-weight: bold;
              color: #1a1a1a;
              margin-bottom: 10px;
              font-size: 16px;
            }
            .payment-item {
              display: flex;
              justify-content: space-between;
              padding: 5px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .payment-item:last-child {
              border-bottom: none;
            }
            .credit-note-info, .return-info {
              margin: 20px 0;
              padding: 20px;
              border-radius: 8px;
              border: 2px solid;
            }
            .credit-note-info {
              background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
              border-color: #f59e0b;
              color: #92400e;
            }
            .return-info {
              background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
              border-color: #dc2626;
              color: #991b1b;
            }
            .footer { 
              margin-top: 30px; 
              text-align: center; 
              font-size: 11px; 
              color: #6b7280;
              border-top: 2px solid #fbbf24;
              padding: 20px;
              background: #f8f9fa;
            }
            .footer-company {
              font-weight: bold;
              color: #1a1a1a;
              margin-bottom: 5px;
            }
            @media print {
              body { 
                margin: 0; 
                box-shadow: none;
              }
              .invoice-container {
                box-shadow: none;
                border-radius: 0;
              }
              .no-print { 
                display: none; 
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <div class="company-name">${businessSettings?.name || 'MI EMPRESA'}</div>
              <div class="company-info">
                ${businessSettings?.rnc ? `RNC: ${businessSettings.rnc}` : ''}<br>
                ${businessSettings?.address || ''}<br>
                ${businessSettings?.phone ? `Tel: ${businessSettings.phone}` : ''}<br>
                ${businessSettings?.email || ''}
              </div>
            </div>

            <div class="content-section">
              <div class="document-title">${documentType}</div>

              <div class="invoice-info">
                <div class="info-group">
                  <div class="info-label">Número de Factura</div>
                  <div class="info-value">${sale.receiptNumber}</div>
                  
                  <div class="info-label">Fecha de Emisión</div>
                  <div class="info-value">${new Date(sale.date).toLocaleDateString('es-DO', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</div>
                  
                  <div class="info-label">Hora</div>
                  <div class="info-value">${new Date(sale.date).toLocaleTimeString('es-DO')}</div>
                </div>
                <div class="info-group">
                  <div class="info-label">Estado</div>
                  <div class="info-value">${
                    sale.status === 'completed' ? 'Completada' : 
                    sale.status === 'credit' ? 'A Crédito' : 
                    sale.status === 'returned' ? 'Devuelta' :
                    sale.status
                  }</div>
                  
                  ${type === 'credit-note' ? '<div class="info-label">Tipo</div><div class="info-value">Nota de Crédito</div>' : ''}
                  ${type === 'return' ? '<div class="info-label">Tipo</div><div class="info-value">Devolución</div>' : ''}
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
                <div class="customer-title">DATOS DEL CLIENTE</div>
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
                    <th style="width: 8%">Cant.</th>
                    <th style="width: 10%">Unidad</th>
                    <th style="width: 35%">Descripción</th>
                    <th style="width: 12%">Precio Base</th>
                    <th style="width: 12%">Valor Base</th>
                    <th style="width: 10%">ITBIS</th>
                    <th style="width: 13%">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsWithTax.map(item => `
                    <tr>
                      <td class="number">${item.quantity}</td>
                      <td><span class="unit-badge">${item.unitOfMeasure}</span></td>
                      <td>${item.name}</td>
                      <td class="number">${businessSettings?.currency || 'RD$'} ${item.basePrice.toFixed(2)}</td>
                      <td class="number">${businessSettings?.currency || 'RD$'} ${item.basePriceTotal.toFixed(2)}</td>
                      <td class="number">${item.hasItbis ? 
                        `${businessSettings?.currency || 'RD$'} ${item.taxAmount.toFixed(2)}` : 
                        '0.00'
                      }</td>
                      <td class="number">${businessSettings?.currency || 'RD$'} ${item.totalWithTax.toLocaleString()}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>

              <div class="totals-container">
                <div class="totals">
                  <div class="totals-header">Resumen de Totales</div>
                  <div class="totals-body">
                    <div class="total-line subtotal">
                      <span>Subtotal (Base):</span>
                      <span>${businessSettings?.currency || 'RD$'} ${subtotalBase.toFixed(2)}</span>
                    </div>
                    <div class="total-line tax">
                      <span>ITBIS Total:</span>
                      <span>${businessSettings?.currency || 'RD$'} ${totalTax.toFixed(2)}</span>
                    </div>
                    <div class="total-line final-total">
                      <span>TOTAL A PAGAR:</span>
                      <span>${businessSettings?.currency || 'RD$'} ${grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="payments">
                <div class="payments-title">FORMAS DE PAGO</div>
                ${sale.payments.map(payment => {
                  const paymentType = payment.type === 'cash' ? 'Efectivo' : 
                                   payment.type === 'card' ? 'Tarjeta' : 
                                   payment.type === 'transfer' ? 'Transferencia' : 
                                   payment.type === 'credit' ? 'Crédito' : 
                                   payment.type === 'return' ? 'Devolución' :
                                   payment.type === 'credit-note' ? 'Nota de Crédito' :
                                   payment.type;
                  const reference = payment.reference ? ` (Ref: ${payment.reference})` : '';
                  return `
                    <div class="payment-item">
                      <span>${paymentType}${reference}</span>
                      <span>${businessSettings?.currency || 'RD$'} ${payment.amount.toLocaleString()}</span>
                    </div>
                  `;
                }).join('')}
              </div>

              ${sale.dueDate ? `
                <div style="margin: 20px 0; padding: 15px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; border-radius: 8px;">
                  <strong>⏰ VENTA A CRÉDITO</strong><br>
                  Fecha de vencimiento: ${new Date(sale.dueDate).toLocaleDateString('es-DO', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              ` : ''}
            </div>

            <div class="footer">
              <div class="footer-company">${businessSettings?.name || 'MI EMPRESA'}</div>
              <p>Esta factura es válida como comprobante de compra</p>
              <p>Impreso el: ${new Date().toLocaleString('es-DO')}</p>
              ${businessSettings?.rnc ? `<p>RNC: ${businessSettings.rnc}</p>` : ''}
              <p>Gracias por su preferencia</p>
            </div>
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
