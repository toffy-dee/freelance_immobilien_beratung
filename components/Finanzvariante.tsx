import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Tranche } from './Tranche'
import { Variante, Tranche as TrancheType } from '@/types/datenstruktur'
import { FinanzierungsBarChart } from './FinanzierungsBarChart';
import { FinanzierungsLineChart } from './FinanzierungsLineChart';
import { ChevronDown, ChevronUp } from "lucide-react"

type FinanzvarianteProps = {
  variante: Variante;
  varianteIndex: number;
  onUpdateTranche: (trancheIndex: number, updatedTranche: Partial<TrancheType['eingabe']>) => void;
  onUpdateTrancheAusgabe: (trancheIndex: number, updatedAusgabe: Partial<TrancheType['ausgabe']>) => void;
  onAddTranche: () => void;
  onDeleteTranche: (trancheIndex: number) => void;
};

export function Finanzvariante({ variante, varianteIndex, onUpdateTranche, onUpdateTrancheAusgabe, onAddTranche, onDeleteTranche }: FinanzvarianteProps) {
  const [isGraphExpanded, setIsGraphExpanded] = useState(true);
  const [isLineGraphExpanded, setIsLineGraphExpanded] = useState(true);

  return (
    <div className="space-y-4">
      {variante.tranchen.map((tranche, trancheIndex) => (
        <Tranche
          key={trancheIndex}
          tranche={tranche}
          onUpdate={(updatedTranche) => onUpdateTranche(trancheIndex, updatedTranche)}
          onUpdateAusgabe={(updatedAusgabe) => onUpdateTrancheAusgabe(trancheIndex, updatedAusgabe)}
          onDelete={() => onDeleteTranche(trancheIndex)}
        />
      ))}
      <Button onClick={onAddTranche}>Tranche hinzufügen</Button>
      <div className="mt-4">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsGraphExpanded(!isGraphExpanded)}>
          <h2 className="text-lg font-semibold">Monatliche Raten</h2>
          {isGraphExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
        {isGraphExpanded && <FinanzierungsBarChart data={variante.grafikMonatlicheRaten} />}
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsLineGraphExpanded(!isLineGraphExpanded)}>
          <h2 className="text-lg font-semibold">Gesamtentwicklung</h2>
          {isLineGraphExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
        {isLineGraphExpanded && <FinanzierungsLineChart data={variante.grafikGesamtentwicklung} />}
      </div>
    </div>
  );
}