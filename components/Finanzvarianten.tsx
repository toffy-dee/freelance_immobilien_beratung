import { useStateContext } from '@/context/StateContext';
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText } from "lucide-react"
import { format, addYears } from "date-fns"
import { Finanzvariante } from './Finanzvariante'
import { Tranche } from '@/types/datenstruktur'

export function Finanzvarianten() {
  const { datenstruktur, setDatenstruktur } = useStateContext();
  const [aktiveVariante, setAktiveVariante] = useState(0);

  const handlePDFGeneration = () => {
    console.log("PDF generation functionality to be implemented");
  };

  const varianteHinzufügen = () => {
    setDatenstruktur(prev => ({
      ...prev,
      finanzierungsvarianten: [
        ...prev.finanzierungsvarianten,
        {
          name: `Variante ${prev.finanzierungsvarianten.length + 1}`,
          tranchen: [
            {
              eingabe: {
                tranchenName: '',
                kreditinstitut: '',
                darlehen: 0,
                startdatum: format(new Date(), 'yyyy-MM-dd'),
                enddatum: format(addYears(new Date(), 10), 'yyyy-MM-dd'),
                zinslaufzeit: 10,
                sollzins: 0,
                tilgungsraten: [],
                sondertilgungen: [],
              },
              ausgabe: {
                monatlicheAbzahlung: 0,
                restschuldNachZinsbindung: 0,
                voraussichtlicheLaufzeit: 0,
              },
            },
          ],
          grafikGesamtentwicklung: [], // Add this line if not already present,
          grafikMonatlicheRaten: []
        },
      ],
    }));
    setAktiveVariante(datenstruktur.finanzierungsvarianten.length);
  };

  const trancheHinzufügen = (varianteIndex: number) => {
    setDatenstruktur(prev => ({
      ...prev,
      finanzierungsvarianten: prev.finanzierungsvarianten.map((variante, index) =>
        index === varianteIndex
          ? {
              ...variante,
              tranchen: [
                ...variante.tranchen,
                {
                  eingabe: {
                    tranchenName: '',
                    kreditinstitut: '',
                    darlehen: 0,
                    startdatum: format(new Date(), 'yyyy-MM-dd'),
                    enddatum: format(addYears(new Date(), 10), 'yyyy-MM-dd'),
                    zinslaufzeit: 10,
                    sollzins: 0,
                    tilgungsraten: [],
                    sondertilgungen: [],
                  },
                  ausgabe: {
                    monatlicheAbzahlung: 0,
                    restschuldNachZinsbindung: 0,
                    voraussichtlicheLaufzeit: 0,
                  },
                },
              ],
            }
          : variante
      ),
    }));
  };

  const updateTranche = (varianteIndex: number, trancheIndex: number, updatedTranche: Partial<Tranche['eingabe']>) => {
    setDatenstruktur(prev => ({
      ...prev,
      finanzierungsvarianten: prev.finanzierungsvarianten.map((variante, varianteIdx) =>
        varianteIdx === varianteIndex
          ? {
              ...variante,
              tranchen: variante.tranchen.map((tranche, trancheIdx) =>
                trancheIdx === trancheIndex
                  ? {
                      ...tranche,
                      eingabe: {
                        ...tranche.eingabe,
                        ...updatedTranche,
                      },
                    }
                  : tranche
              )
            }
          : variante
      )
    }));
  };

  const updateTrancheAusgabe = (varianteIndex: number, trancheIndex: number, updatedAusgabe: Partial<Tranche['ausgabe']>) => {
    setDatenstruktur(prev => ({
      ...prev,
      finanzierungsvarianten: prev.finanzierungsvarianten.map((variante, varianteIdx) =>
        varianteIdx === varianteIndex
          ? {
              ...variante,
              tranchen: variante.tranchen.map((tranche, trancheIdx) =>
                trancheIdx === trancheIndex
                  ? {
                      ...tranche,
                      ausgabe: {
                        ...tranche.ausgabe,
                        ...updatedAusgabe,
                      },
                    }
                  : tranche
              )
            }
          : variante
      )
    }));
  };

  const deleteTranche = (varianteIndex: number, trancheIndex: number) => {
    setDatenstruktur(prev => ({
      ...prev,
      finanzierungsvarianten: prev.finanzierungsvarianten.map((variante, varianteIdx) =>
        varianteIdx === varianteIndex
          ? {
              ...variante,
              tranchen: variante.tranchen.filter((_, trancheIdx) => trancheIdx !== trancheIndex)
            }
          : variante
      )
    }));
  };

  return (
    <Card className="section-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="custom-headline">FINANZIERUNGSVARIANTEN</CardTitle>
        <Button onClick={handlePDFGeneration} className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Finanzierungsvorschlag
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs value={`variante-${aktiveVariante}`} onValueChange={(value) => setAktiveVariante(Number(value.split('-')[1]))}>
          <TabsList>
            {datenstruktur.finanzierungsvarianten.map((variante, index) => (
              <TabsTrigger key={index} value={`variante-${index}`}>
                {variante.name}
              </TabsTrigger>
            ))}
            <Button variant="outline" onClick={varianteHinzufügen}>+</Button>
          </TabsList>
          {datenstruktur.finanzierungsvarianten.map((variante, varianteIndex) => (
            <TabsContent key={varianteIndex} value={`variante-${varianteIndex}`}>
              <Finanzvariante
                variante={variante}
                varianteIndex={varianteIndex}
                onUpdateTranche={(trancheIndex, updatedTranche) => updateTranche(varianteIndex, trancheIndex, updatedTranche)}
                onUpdateTrancheAusgabe={(trancheIndex, updatedAusgabe) => updateTrancheAusgabe(varianteIndex, trancheIndex, updatedAusgabe)}
                onAddTranche={() => trancheHinzufügen(varianteIndex)}
                onDeleteTranche={(trancheIndex) => deleteTranche(varianteIndex, trancheIndex)}
              />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}