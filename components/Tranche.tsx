import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, ChevronDown, ChevronUp } from "lucide-react"
import { format, parse, isValid, differenceInMonths, addYears } from "date-fns"
import { Tranche as TrancheType, Sondertilgung, Tilgungsrate } from '@/types/datenstruktur'
import { NumberInput } from './NumberInput'
import { calculateMonthlyPayment, calculateRemainingDebt, calculateLoanDuration } from '../calculations.js';
import { SondertilgungenModal } from './SondertilgungenModal'
import { TilgungsratenDialog } from './TilgungsratenDialog'
import { SondertilgungenDialog } from './SondertilgungenDialog'

type TrancheProps = {
  tranche: TrancheType;
  onUpdate: (updatedTranche: Partial<TrancheType['eingabe']>) => void;
  onUpdateAusgabe: (updatedAusgabe: Partial<TrancheType['ausgabe']>) => void;
  onDelete: () => void;
};

export function Tranche({ tranche, onUpdate, onUpdateAusgabe, onDelete }: TrancheProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isSondertilgungenModalOpen, setIsSondertilgungenModalOpen] = useState(false);

  const handleDateChange = (value: string, field: keyof TrancheType['eingabe']) => {
    const parsedDate = parse(value, 'yyyy-MM', new Date())
    if (isValid(parsedDate)) {
      onUpdate({ [field]: format(parsedDate, 'yyyy-MM') });
    }
  };

  const [neueTilgungsrate, setNeueTilgungsrate] = useState<Tilgungsrate>({
    startdatum: format(new Date(), 'yyyy-MM'),
    enddatum: format(addYears(new Date(), 10), 'yyyy-MM'),
    rate: 0
  });

  const [neueSondertilgung, setNeueSondertilgung] = useState<Sondertilgung>({
    datum: format(new Date(), 'yyyy-MM'),
    betrag: 0
  });

  const calculateValues = (eingabe: any) => {
    const monthlyPayment = calculateMonthlyPayment(
      eingabe.darlehen,
      eingabe.sollzins,
      eingabe.tilgungsraten[0]?.rate || 0
    );

    const remainingDebt = calculateRemainingDebt(
      eingabe.darlehen,
      eingabe.sollzins,
      eingabe.tilgungsraten[0]?.rate || 0,
      eingabe.zinslaufzeit
    );

    const loanDuration = calculateLoanDuration(
      eingabe.darlehen,
      eingabe.sollzins,
      eingabe.tilgungsraten[0]?.rate || 0
    );

    return {
      monatlicheAbzahlung: monthlyPayment,
      restschuldNachZinsbindung: remainingDebt,
      voraussichtlicheLaufzeit: loanDuration || 0 // Use 0 or some other default value if null
    };
  };

  const calculateValuesCallback = useCallback(calculateValues, []);

  useEffect(() => {
    console.log('tranche.eingabe: ', tranche.eingabe.darlehen);
    const newValues = calculateValuesCallback(tranche.eingabe);
    console.log('newValues: ', newValues.voraussichtlicheLaufzeit, tranche.ausgabe.voraussichtlicheLaufzeit);
    if (
      newValues.monatlicheAbzahlung !== tranche.ausgabe.monatlicheAbzahlung ||
      newValues.restschuldNachZinsbindung !== tranche.ausgabe.restschuldNachZinsbindung ||
      newValues.voraussichtlicheLaufzeit !== tranche.ausgabe.voraussichtlicheLaufzeit
    ) {
      onUpdateAusgabe(newValues);
    }
  }, [tranche.eingabe, calculateValuesCallback, onUpdateAusgabe, tranche.ausgabe]);

  const handleTilgungsrateChange = (field: keyof Tilgungsrate, value: string | number) => {
    setNeueTilgungsrate(prev => ({
      ...prev,
      [field]: field === 'rate' ? Number(value) : value
    }));
  };

  const handleTilgungsrateDateChange = (field: 'startdatum' | 'enddatum', value: string) => {
    const parsedDate = parse(value, 'yyyy-MM', new Date())
    if (isValid(parsedDate)) {
      handleTilgungsrateChange(field, format(parsedDate, 'yyyy-MM'));
    }
  };

  const addTilgungsrate = () => {
    const updatedTilgungsraten = [
      ...tranche.eingabe.tilgungsraten,
      neueTilgungsrate
    ].sort((a, b) => new Date(a.startdatum).getTime() - new Date(b.startdatum).getTime());

    onUpdate({
      tilgungsraten: updatedTilgungsraten
    });

    setNeueTilgungsrate({
      startdatum: format(new Date(), 'yyyy-MM'),
      enddatum: format(addYears(new Date(), 10), 'yyyy-MM'),
      rate: 0
    });
  };

  const handleSondertilgungChange = (field: keyof Sondertilgung, value: string | number) => {
    setNeueSondertilgung(prev => ({
      ...prev,
      [field]: field === 'betrag' ? Number(value) : value
    }));
  };

  const handleSondertilgungDateChange = (value: string) => {
    const parsedDate = parse(value, 'yyyy-MM', new Date())
    if (isValid(parsedDate)) {
      handleSondertilgungChange('datum', format(parsedDate, 'yyyy-MM'));
    }
  };

  const addSondertilgung = () => {
    const updatedSondertilgungen = [
      ...tranche.eingabe.sondertilgungen,
      neueSondertilgung
    ].sort((a, b) => new Date(a.datum).getTime() - new Date(b.datum).getTime());

    onUpdate({
      sondertilgungen: updatedSondertilgungen
    });

    setNeueSondertilgung({
      datum: format(new Date(), 'yyyy-MM'),
      betrag: 0
    });
  };

  const removeSondertilgung = (index: number) => {
    onUpdate({
      sondertilgungen: tranche.eingabe.sondertilgungen.filter((_, i) => i !== index)
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between cursor-pointer">
        <div className="flex items-center">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 mr-2" onClick={() => setIsExpanded(!isExpanded)} />
          ) : (
            <ChevronDown className="h-4 w-4 mr-2" onClick={() => setIsExpanded(!isExpanded)} />
          )}
          <CardTitle className="custom-headline">{tranche.eingabe.tranchenName}</CardTitle>
        </div>
        <Button variant="link" className="p-0 h-auto" onClick={onDelete}>
          <span className="text-xl">&times;</span>
        </Button>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="tranchenName">Tranchenname:</Label>
                <Input
                  id="tranchenName"
                  value={tranche.eingabe.tranchenName}
                  onChange={(e) => onUpdate({ tranchenName: e.target.value })}
                  placeholder="Name eingeben"
                />
              </div>
              <div>
                <Label htmlFor="kreditinstitut">Name des Kreditinstitutes:</Label>
                <Input
                  id="kreditinstitut"
                  value={tranche.eingabe.kreditinstitut}
                  onChange={(e) => onUpdate({ kreditinstitut: e.target.value })}
                  placeholder="z.B. Deutsche Bank"
                />
              </div>
              <div>
                <Label htmlFor="darlehen">Brutto Darlehensbetrag:</Label>
                <NumberInput
                  id="darlehen"
                  value={tranche.eingabe.darlehen}
                  onChange={(value) => onUpdate({ darlehen: value })}
                  placeholder="0,00"
                />
              </div>
              <div>
                <Label htmlFor="startdatum">Startdatum:</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="startdatum"
                    type="month"
                    value={tranche.eingabe.startdatum}
                    onChange={(e) => handleDateChange(e.target.value, 'startdatum')}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="enddatum">Enddatum:</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="enddatum"
                    type="month"
                    value={tranche.eingabe.enddatum}
                    onChange={(e) => handleDateChange(e.target.value, 'enddatum')}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="zinslaufzeit">Zinslaufzeit:</Label>
                <NumberInput
                  id="zinslaufzeit"
                  value={tranche.eingabe.zinslaufzeit}
                  onChange={(value) => onUpdate({ zinslaufzeit: value })}
                  placeholder="15"
                  isInteger={true}
                />
                <span className="text-sm text-gray-500 ml-2">Jahre</span>
              </div>
              <div>
                <Label htmlFor="sollzins">Sollzins p.a.:</Label>
                <NumberInput
                  id="sollzins"
                  value={tranche.eingabe.sollzins}
                  onChange={(value) => onUpdate({ sollzins: value })}
                  placeholder="1,35"
                />
                <span className="text-sm text-gray-500 ml-2">%</span>
              </div>
            </div>
            <div className="space-y-4 bg-muted p-4 rounded-lg">
              <div>
                <Label>Monatliche Abzahlung:</Label>
                <Input readOnly value={`${tranche.ausgabe.monatlicheAbzahlung.toFixed(2)} €`} />
              </div>
              <div>
                <Label>Restschuld nach Zinsbindung:</Label>
                <Input readOnly value={`${tranche.ausgabe.restschuldNachZinsbindung.toFixed(2)} €`} />
              </div>
              <div>
                <Label>Voraussichtliche Laufzeit:</Label>
                <Input readOnly value={`${tranche.ausgabe.voraussichtlicheLaufzeit.toFixed(1)} Jahre`} />
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Label>Tilgungsraten:</Label>
            <TilgungsratenDialog
              tilgungsraten={tranche.eingabe.tilgungsraten}
              neueTilgungsrate={neueTilgungsrate}
              onTilgungsrateChange={handleTilgungsrateChange}
              onTilgungsrateDateChange={handleTilgungsrateDateChange}
              onAddTilgungsrate={addTilgungsrate}
              onRemoveTilgungsrate={(index) => onUpdate({
                tilgungsraten: tranche.eingabe.tilgungsraten.filter((_, i) => i !== index)
              })}
            />
            <div className="mt-2 space-y-2">
              {tranche.eingabe.tilgungsraten.map((rate, index) => (
                <div key={index} className="text-sm">
                  <span>{rate.startdatum} - {rate.enddatum}: </span>
                  <span className="font-semibold">{rate.rate.toFixed(2)} %</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <Label>Sondertilgungen:</Label>
            <SondertilgungenDialog
              neueSondertilgung={neueSondertilgung}
              onSondertilgungChange={handleSondertilgungChange}
              onSondertilgungDateChange={handleSondertilgungDateChange}
              onAddSondertilgung={addSondertilgung}
            />
            <div className="mt-2 space-y-2">
              {tranche.eingabe.sondertilgungen.length <= 3 ? (
                tranche.eingabe.sondertilgungen.map((sondertilgung, index) => (
                  <div key={index} className="text-sm">
                    <span>{sondertilgung.datum}: </span>
                    <span className="font-semibold">{sondertilgung.betrag} €</span>
                  </div>
                ))
              ) : (
                <>
                  {tranche.eingabe.sondertilgungen.slice(0, 2).map((sondertilgung, index) => (
                    <div key={index} className="text-sm">
                      <span>{sondertilgung.datum}: </span>
                      <span className="font-semibold">{sondertilgung.betrag} €</span>
                    </div>
                  ))}
                  <div className="text-sm">
                    ....
                    <Button 
                      variant="link" 
                      className="p-0 h-auto font-normal text-sm"
                      onClick={() => setIsSondertilgungenModalOpen(true)}
                    >
                      Anzeigen
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      )}
      <SondertilgungenModal 
        isOpen={isSondertilgungenModalOpen}
        onClose={() => setIsSondertilgungenModalOpen(false)}
        sondertilgungen={tranche.eingabe.sondertilgungen}
        onRemove={removeSondertilgung}
      />
    </Card>
  );
}