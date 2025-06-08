
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePos } from '@/contexts/PosContext';
import { DollarSign, CreditCard, Receipt, Search, Banknote, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface CollectAccountModalProps {
  open: boolean;
  onClose: () => void;
}

const CollectAccountModal: React.FC<CollectAccountModalProps> = ({ open, onClose }) => {
  const { customers, sales, updateCreditSale } = usePos();
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [customerSales, setCustomerSales] = useState<any[]>([]);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer' | 'check'>('cash');
  const [selectedSale, setSelectedSale] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [checkNumber, setCheckNumber] = useState('');
  const [bankName, setBankName] = useState('');

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.documentId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (selectedCustomer) {
      const creditSales = sales.filter(sale => 
        sale.customerId === selectedCustomer && 
        (sale.status === 'credit' || sale.status === 'paid-credit')
      );
      setCustomerSales(creditSales);
    } else {
      setCustomerSales([]);
    }
  }, [selectedCustomer, sales]);

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomer(customerId);
    setSelectedSale('');
    setPaymentAmount(0);
    setReferenceNumber('');
    setCheckNumber('');
    setBankName('');
  };

  const handleSaleSelect = (saleId: string) => {
    setSelectedSale(saleId);
    const sale = customerSales.find(s => s.id === saleId);
    if (sale) {
      const totalPaid = sale.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0;
      const remaining = sale.total - totalPaid;
      setPaymentAmount(remaining);
    }
  };

  const handlePayment = () => {
    if (!selectedSale || paymentAmount <= 0) {
      toast.error('Seleccione una venta y un monto válido');
      return;
    }

    if (paymentMethod === 'transfer' && !referenceNumber.trim()) {
      toast.error('Ingrese el número de referencia de la transferencia');
      return;
    }

    if (paymentMethod === 'check' && (!checkNumber.trim() || !bankName.trim())) {
      toast.error('Ingrese el número de cheque y banco');
      return;
    }

    const sale = customerSales.find(s => s.id === selectedSale);
    if (!sale) return;

    const totalPaid = sale.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0;
    const remaining = sale.total - totalPaid;

    if (paymentAmount > remaining) {
      toast.error('El monto no puede ser mayor al saldo pendiente');
      return;
    }

    let paymentData: any = {
      method: paymentMethod,
      amount: paymentAmount,
      timestamp: new Date().toISOString()
    };

    switch (paymentMethod) {
      case 'transfer':
        paymentData.referenceNumber = referenceNumber;
        paymentData.bankName = bankName;
        break;
      case 'check':
        paymentData.checkNumber = checkNumber;
        paymentData.bankName = bankName;
        break;
    }

    updateCreditSale(selectedSale, paymentAmount, paymentData);
    
    // Reset form
    setSelectedSale('');
    setPaymentAmount(0);
    setReferenceNumber('');
    setCheckNumber('');
    setBankName('');
    
    // Refresh customer sales
    const updatedCreditSales = sales.filter(sale => 
      sale.customerId === selectedCustomer && 
      (sale.status === 'credit' || sale.status === 'paid-credit')
    );
    setCustomerSales(updatedCreditSales);

    toast.success('Pago registrado exitosamente');
  };

  const getTotalDebt = () => {
    return customerSales.reduce((total, sale) => {
      const totalPaid = sale.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0;
      return total + (sale.total - totalPaid);
    }, 0);
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return <Banknote className="h-4 w-4" />;
      case 'card': return <CreditCard className="h-4 w-4" />;
      case 'transfer': return <Receipt className="h-4 w-4" />;
      case 'check': return <FileText className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash': return 'Efectivo';
      case 'card': return 'Tarjeta';
      case 'transfer': return 'Transferencia';
      case 'check': return 'Cheque';
      default: return 'Efectivo';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Cobrar Cuentas por Pagar
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Selection */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div>
                  <Label>Buscar Cliente</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar por nombre o cédula..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2">
                  {filteredCustomers.map((customer) => {
                    const customerCreditSales = sales.filter(sale => 
                      sale.customerId === customer.id && 
                      (sale.status === 'credit' || sale.status === 'paid-credit')
                    );
                    
                    const totalDebt = customerCreditSales.reduce((total, sale) => {
                      const totalPaid = sale.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0;
                      return total + (sale.total - totalPaid);
                    }, 0);

                    if (totalDebt <= 0) return null;

                    return (
                      <Card 
                        key={customer.id} 
                        className={`cursor-pointer hover:shadow-md transition-shadow ${
                          selectedCustomer === customer.id ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => handleCustomerSelect(customer.id)}
                      >
                        <CardContent className="p-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">{customer.name}</h4>
                              <p className="text-sm text-gray-500">{customer.documentId}</p>
                            </div>
                            <Badge variant="destructive">
                              RD$ {totalDebt.toLocaleString()}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sales and Payment */}
          <Card>
            <CardContent className="p-4">
              {selectedCustomer ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="font-medium">
                      {customers.find(c => c.id === selectedCustomer)?.name}
                    </h3>
                    <Badge variant="outline" className="text-lg font-semibold">
                      Total Deuda: RD$ {getTotalDebt().toLocaleString()}
                    </Badge>
                  </div>

                  <div>
                    <Label>Seleccionar Venta</Label>
                    <Select value={selectedSale} onValueChange={handleSaleSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione una venta..." />
                      </SelectTrigger>
                      <SelectContent>
                        {customerSales.map((sale) => {
                          const totalPaid = sale.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0;
                          const remaining = sale.total - totalPaid;
                          
                          if (remaining <= 0) return null;
                          
                          return (
                            <SelectItem key={sale.id} value={sale.id}>
                              #{sale.receiptNumber} - RD$ {remaining.toLocaleString()}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedSale && (
                    <>
                      <div>
                        <Label>Método de Pago</Label>
                        <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">
                              <div className="flex items-center gap-2">
                                <Banknote className="h-4 w-4" />
                                Efectivo
                              </div>
                            </SelectItem>
                            <SelectItem value="card">
                              <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4" />
                                Tarjeta
                              </div>
                            </SelectItem>
                            <SelectItem value="transfer">
                              <div className="flex items-center gap-2">
                                <Receipt className="h-4 w-4" />
                                Transferencia
                              </div>
                            </SelectItem>
                            <SelectItem value="check">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Cheque
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {paymentMethod === 'transfer' && (
                        <div className="space-y-3">
                          <div>
                            <Label>Número de Referencia</Label>
                            <Input
                              value={referenceNumber}
                              onChange={(e) => setReferenceNumber(e.target.value)}
                              placeholder="Ingrese número de referencia"
                            />
                          </div>
                          <div>
                            <Label>Banco</Label>
                            <Input
                              value={bankName}
                              onChange={(e) => setBankName(e.target.value)}
                              placeholder="Nombre del banco"
                            />
                          </div>
                        </div>
                      )}

                      {paymentMethod === 'check' && (
                        <div className="space-y-3">
                          <div>
                            <Label>Número de Cheque</Label>
                            <Input
                              value={checkNumber}
                              onChange={(e) => setCheckNumber(e.target.value)}
                              placeholder="Número del cheque"
                            />
                          </div>
                          <div>
                            <Label>Banco</Label>
                            <Input
                              value={bankName}
                              onChange={(e) => setBankName(e.target.value)}
                              placeholder="Banco emisor del cheque"
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <Label>Monto a Pagar</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        />
                      </div>

                      <Button 
                        onClick={handlePayment}
                        className="w-full"
                        disabled={paymentAmount <= 0}
                      >
                        {getPaymentMethodIcon(paymentMethod)}
                        <span className="ml-2">
                          Registrar Pago - {getPaymentMethodLabel(paymentMethod)}
                        </span>
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Seleccione un cliente para ver sus cuentas pendientes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CollectAccountModal;
