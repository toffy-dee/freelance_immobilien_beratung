import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Sondertilgung } from '@/types/datenstruktur';

type SondertilgungenModalProps = {
  isOpen: boolean;
  onClose: () => void;
  sondertilgungen: Sondertilgung[];
  onRemove: (index: number) => void;
}

export function SondertilgungenModal({ isOpen, onClose, sondertilgungen, onRemove }: SondertilgungenModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Alle Sondertilgungen</DialogTitle>
        </DialogHeader>
        <div className="mt-4 max-h-96 overflow-y-auto">
          {sondertilgungen.map((sondertilgung, index) => (
            <div key={index} className="text-sm mb-2 flex justify-between items-center">
              <span>
                {sondertilgung.datum}: 
                <span className="font-semibold">{sondertilgung.betrag.toFixed(2)} €</span>
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onRemove(index)}
              >
                Entfernen
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}