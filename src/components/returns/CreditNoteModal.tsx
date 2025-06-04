
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditNote } from '@/types/pos';
import { usePos } from '@/contexts/PosContext';
import { CreditCard, Printer } from 'lucide-react';
import { toast } from 'sonner';

interface CreditNoteModalProps {
  open: boolean;
  onClose: () => void;
  customerId?: string;
  onSelectCreditNote: (creditNote: CreditNote) => void;
}

const CreditNoteModal: React.FC<CreditNoteModalProps> = ({ 
  open, 
  onClose, 
  customerId,
  onSelectCreditNote 
}) => {
  const { getCustomerCreditNotes } = usePos();

  const creditNotes = customerId ? getCustomerCreditNotes(customerId) : [];
  const activeCreditNotes = creditNotes.filter(note => note.status === 'active' && note.balance > 0);

  const handleSelectCreditNote = (creditNote: CreditNote) => {
    onSelectCreditNote(creditNote);
    onClose();
  };

  const printCreditNote = (creditNote: CreditNote) => {
    console.log('Printing credit note', {
      creditNoteId: creditNote.id,
      amount: creditNote.amount,
      balance: creditNote.balance,
      date: creditNote.issueDate,
      reason: creditNote.reason,
      items: creditNote.returnItems
    });
    toast.info('Imprimiendo nota de crédito');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Notas de Crédito Disponibles
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {activeCreditNotes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Monto Original</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeCreditNotes.map((creditNote) => (
                  <TableRow key={creditNote.id}>
                    <TableCell className="font-medium">{creditNote.id}</TableCell>
                    <TableCell>{new Date(creditNote.issueDate).toLocaleDateString()}</TableCell>
                    <TableCell>RD$ {creditNote.amount.toLocaleString()}</TableCell>
                    <TableCell className="font-medium text-green-600">
                      RD$ {creditNote.balance.toLocaleString()}
                    </TableCell>
                    <TableCell>{creditNote.reason}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleSelectCreditNote(creditNote)}
                        >
                          Usar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => printCreditNote(creditNote)}
                        >
                          <Printer className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No hay notas de crédito disponibles para este cliente</p>
            </div>
          )}

          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreditNoteModal;
