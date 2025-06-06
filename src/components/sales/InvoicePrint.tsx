
import React from 'react';
import { Sale, Customer } from '@/types/pos';
import { toast } from 'sonner';

interface InvoicePrintProps {
  sale: Sale;
  customer?: Customer;
  onPrint: () => void;
}

const InvoicePrint: React.FC<InvoicePrintProps> = ({ sale, customer, onPrint }) => {
  
  const printInvoice = () => {
    console.log('Imprimiendo factura:', {
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
      payments: sale.payments.map(payment => ({
        type: payment.type,
        amount: payment.amount,
        reference: payment.reference || `AUTO-${Date.now()}`
      })),
      status: sale.status
    });

    // Simular impresión
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
        <head>
          <title>Factura ${sale.receiptNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .company-name { font-size: 24px; font-weight: bold; }
            .invoice-info { margin-bottom: 20px; }
            .customer-info { margin-bottom: 20px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items-table th { background-color: #f2f2f2; }
            .totals { text-align: right; }
            .total-line { display: flex; justify-content: space-between; margin: 5px 0; }
            .final-total { font-weight: bold; font-size: 18px; }
            .payments { margin-top: 20px; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">TU EMPRESA</div>
            <div>RNC: 123-45678-9</div>
            <div>Teléfono: (809) 555-0123</div>
            <div>Dirección: Calle Principal #123, Santo Domingo</div>
          </div>

          <div class="invoice-info">
            <strong>FACTURA DE VENTA</strong><br>
            Número: ${sale.receiptNumber}<br>
            Fecha: ${new Date(sale.date).toLocaleString()}<br>
            Estado: ${sale.status === 'completed' ? 'Completada' : sale.status === 'credit' ? 'A Crédito' : sale.status}
          </div>

          <div class="customer-info">
            <strong>CLIENTE:</strong><br>
            ${customer ? `
              Nombre: ${customer.name}<br>
              ${customer.document ? `Documento: ${customer.document}<br>` : ''}
              ${customer.address ? `Dirección: ${customer.address}<br>` : ''}
              ${customer.phone ? `Teléfono: ${customer.phone}<br>` : ''}
            ` : 'Cliente General'}
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio Unit.</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${sale.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>RD$ ${item.price.toLocaleString()}</td>
                  <td>RD$ ${(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div class="total-line">
              <span>Subtotal:</span>
              <span>RD$ ${sale.subtotal.toLocaleString()}</span>
            </div>
            <div class="total-line">
              <span>ITBIS (18%):</span>
              <span>RD$ ${sale.tax.toLocaleString()}</span>
            </div>
            <div class="total-line final-total">
              <span>TOTAL:</span>
              <span>RD$ ${sale.total.toLocaleString()}</span>
            </div>
          </div>

          <div class="payments">
            <strong>FORMAS DE PAGO:</strong><br>
            ${sale.payments.map(payment => {
              const paymentType = payment.type === 'cash' ? 'Efectivo' : 
                               payment.type === 'card' ? 'Tarjeta' : 
                               payment.type === 'transfer' ? 'Transferencia' : 
                               payment.type === 'credit' ? 'Crédito' : 
                               payment.type;
              const reference = payment.reference ? ` (Ref: ${payment.reference})` : '';
              return `${paymentType}: RD$ ${payment.amount.toLocaleString()}${reference}<br>`;
            }).join('')}
          </div>

          ${sale.dueDate ? `
            <div style="margin-top: 20px; padding: 10px; background-color: #fff3cd; border: 1px solid #ffeeba;">
              <strong>VENTA A CRÉDITO</strong><br>
              Fecha de vencimiento: ${new Date(sale.dueDate).toLocaleDateString()}
            </div>
          ` : ''}

          <div class="footer">
            <p>¡Gracias por su compra!</p>
            <p>Esta factura es válida como comprobante de compra</p>
          </div>
        </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }

    toast.success('Factura enviada a impresión');
    onPrint();
  };

  // Auto print when component mounts
  React.useEffect(() => {
    const timer = setTimeout(() => {
      printInvoice();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return null; // This component doesn't render anything visible
};

export default InvoicePrint;
