import React from 'react';
import { Button } from "@/components/ui/button"
import { Tranche } from './Tranche'
import { Variante, Tranche as TrancheType } from '@/types/datenstruktur'

type FinanzvarianteProps = {
  variante: Variante;
  varianteIndex: number;
  onUpdateTranche: (trancheIndex: number, updatedTranche: Partial<TrancheType['eingabe']>) => void;
  onUpdateTrancheAusgabe: (trancheIndex: number, updatedAusgabe: Partial<TrancheType['ausgabe']>) => void;
  onAddTranche: () => void;
};

export function Finanzvariante({ variante, varianteIndex, onUpdateTranche, onUpdateTrancheAusgabe, onAddTranche }: FinanzvarianteProps) {
  return (
    <div className="space-y-4">
      {variante.tranchen.map((tranche, trancheIndex) => (
        <Tranche
          key={trancheIndex}
          tranche={tranche}
          onUpdate={(updatedTranche) => onUpdateTranche(trancheIndex, updatedTranche)}
          onUpdateAusgabe={(updatedAusgabe) => onUpdateTrancheAusgabe(trancheIndex, updatedAusgabe)}
        />
      ))}
      <Button onClick={onAddTranche}>Tranche hinzufügen</Button>
    </div>
  );
}