'use client'

import { useStateContext } from '@/context/StateContext';
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, FileText } from "lucide-react"
import { format, parse, isValid, addYears, subMonths } from "date-fns"
import { de } from "date-fns/locale"
import { jsPDF } from "jspdf"
import autoTable from 'jspdf-autotable'

// Add this type augmentation at the top of your file
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

const customStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Alegreya:wght@400;700&family=Alegreya+SC:wght@700&display=swap');

  .custom-bg {
    background-color: #85B0CA;
  }

  .custom-headline {
    color: #163C5A;
    font-family: 'Alegreya SC', serif;
    font-weight: 700;
    text-transform: uppercase;
  }

  .custom-font {
    font-family: 'Alegreya', serif;
    font-size: 21px;
    color: #003c5D;
  }

  .section-card {
    background-color: #FFF8DC;
    margin-bottom: 20px;
  }
`

// Updated sub-types
type Tilgungsrate = {
  startDatum: string;
  endDatum: string;
  rate: number;
}

type Sondertilgung = {
  startDatum: string;
  endDatum: string | null;
  betrag: number;
}

type Tranche = {
  eingabe: {
    tranchenName: string;
    kreditinstitut: string;
    darlehen: number;
    startdatum: string;
    enddatum: string;
    zinslaufzeit: number;
    sollzins: number;
    tilgungsraten: Tilgungsrate[];
    sondertilgungen: Sondertilgung[];
  };
  ausgabe: {
    monatlicheAbzahlung: number;
    restschuldNachZinsbindung: number;
    voraussichtlicheLaufzeit: number;
  };
}

type Variante = {
  name: string;
  tranchen: Tranche[];
}

// Updated Datenstruktur type
type Datenstruktur = {
  kunde: {
    objektnutzung: string;
    objektArt: string;
    darlehensnehmer: string;
  };
  kostenaufstellung: {
    kaufpreis: number;
    grunderwerbssteuer: number;
    grunderwerbssteuerPreis: number;
    notarUndGerichtskosten: number;
    notarUndGerichtskostenPreis: number;
    vermittlerprovision: number;
    vermittlerprovisionPreis: number;
    neubaukostenUndBaunebenkosten: number;
    sanierungskosten: number;
    sonstiges: number;
    eigenkapital: number;
    eigenleistung: number;
    gesamtaufwand: number;
    nettoDarlehensbetrag: number;
    risikoanalyse: number;
  };
  finanzierungsvarianten: Variante[];
};

type PartialTrancheUpdate = {
  eingabe?: Partial<Tranche['eingabe']>;
  ausgabe?: Partial<Tranche['ausgabe']>;
};

export function FinancingAdvisorComponent() {
  const { datenstruktur, setDatenstruktur } = useStateContext();

  const objektArten = [  
    "ETW", "Einfamilienhaus", "Zweifamilienhaus", "Mehrfamilienhaus", "Wohn- und Geschäftshaus", "Gewerbeobjekt", "Volle Eigennutzung", "Eigennutzung und Vermietung", "Volle Vermietung"
  ];

  const [aktiveVariante, setAktiveVariante] = useState(0);
  const [neueTilgungsrate, setNeueTilgungsrate] = useState<Tilgungsrate>({
    startDatum: format(new Date(), 'yyyy-MM-dd'),
    endDatum: format(addYears(new Date(), 10), 'yyyy-MM-dd'),
    rate: 0
  });
  const [neueSondertilgung, setNeueSondertilgung] = useState<Sondertilgung>({
    startDatum: format(new Date(), 'yyyy-MM-dd'),
    endDatum: null,
    betrag: 0
  });

  // Update functions to work with the new data structure
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

  const tilgungsrateHinzufügen = (varianteIndex: number, trancheIndex: number) => {
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
                        tilgungsraten: [
                          ...tranche.eingabe.tilgungsraten.map(rate => ({
                            ...rate,
                            endDatum: subMonths(new Date(neueTilgungsrate.startDatum), 1).toISOString().split('T')[0]
                          })),
                          neueTilgungsrate
                        ].sort((a, b) => new Date(a.startDatum).getTime() - new Date(b.startDatum).getTime())
                      }
                    }
                  : tranche
              )
            }
          : variante
      )
    }));
    setNeueTilgungsrate({
      startDatum: format(new Date(), 'yyyy-MM-dd'),
      endDatum: format(addYears(new Date(), 10), 'yyyy-MM-dd'),
      rate: 0
    });
  };

  const sondertilgungHinzufügen = (varianteIndex: number, trancheIndex: number) => {
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
                        sondertilgungen: [
                          ...tranche.eingabe.sondertilgungen.map(tilgung => ({
                            ...tilgung,
                            endDatum: subMonths(new Date(neueSondertilgung.startDatum), 1).toISOString().split('T')[0]
                          })),
                          {
                            ...neueSondertilgung,
                            betrag: Math.min(Math.floor(neueSondertilgung.betrag), tranche.eingabe.darlehen),
                            endDatum: neueSondertilgung.endDatum || tranche.eingabe.enddatum
                          }
                        ].sort((a, b) => new Date(a.startDatum).getTime() - new Date(b.startDatum).getTime())
                      }
                    }
                  : tranche
              )
            }
          : variante
      )
    }));
    setNeueSondertilgung({
      startDatum: format(new Date(), 'yyyy-MM-dd'),
      endDatum: null,
      betrag: 0
    });
  };

  const updateTranche = (varianteIndex: number, trancheIndex: number, updatedTranche: PartialTrancheUpdate) => {
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
                        ...(updatedTranche.eingabe || {}),
                      },
                      ausgabe: {
                        ...tranche.ausgabe,
                        ...(updatedTranche.ausgabe || {}),
                      },
                    }
                  : tranche
              )
            }
          : variante
      )
    }));
  };

  const handleDateChange = (value: string, setter: (date: Date) => void) => {
    const parsedDate = parse(value, 'dd.MM.yyyy', new Date())
    if (isValid(parsedDate)) {
      setter(parsedDate)
    }
  }

  // Update the updateDatenstruktur function
  const updateDatenstruktur = (path: string, value: any) => {
    setDatenstruktur(prevState => {
      const newState = JSON.parse(JSON.stringify(prevState));
      const pathArray = path.split('.');
      let current = newState;
      for (let i = 0; i < pathArray.length - 1; i++) {
        current = current[pathArray[i]];
      }
      current[pathArray[pathArray.length - 1]] = value;
      return newState;
    });
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.text("Finanzierungsvorschlag", 14, 20);

    // Finanzierungsbausteine
    doc.setFontSize(14);
    doc.text("Finanzierungsbausteine", 14, 30);
    
    const bausteinData = [
      ["Baustein", "Darlehen", "Sollzins", "Tilgung", "Sollzinsbindung", "Effektivzins", "Rate monatlich"],
      ["Bank", "161.000 €", "1,350 %", "2,000 %", "30.08.2035", "1,36 %", "449,46 €"],
      ["Eigenkapitalhilfedarlehen", "42.000 €", "5,590 %", "4,274 %", "30.08.2025", "5,74 %", "345,24 €"]
    ];

    autoTable(doc, {
      startY: 35,
      head: [bausteinData[0]],
      body: bausteinData.slice(1),
    });

    // Entwicklung der Finanzierung
    doc.setFontSize(14);
    doc.text("Entwicklung der Finanzierung", 14, doc.lastAutoTable?.finalY + 10 || 35);

    const entwicklungData = [
      ["Jahr", "Immobilienwert", "Restschuld", "Sondertilgung", "Rate monatlich"],
      ["2020", "180.223 €", "201.322 €", "1.678 €", "795 €"],
      ["2021", "183.828 €", "188.712 €", "7.400 €", "795 €"],
      ["2022", "187.504 €", "175.623 €", "7.400 €", "795 €"]
    ];

    autoTable(doc, {
      startY: doc.lastAutoTable?.finalY + 15 || 35,
      head: [entwicklungData[0]],
      body: entwicklungData.slice(1),
    });

    // Ereignisse während der Finanzierung
    doc.setFontSize(14);
    doc.text("Ereignisse während der Finanzierung", 14, doc.lastAutoTable?.finalY + 10 || 35);

    const ereignisseData = [
      ["Monat", "Baustein", "Ereignis"],
      ["2020-08", "Bank", "Auszahlung Darlehen (161.000 €)"],
      ["2020-08", "Bank", "Auszahlung Darlehen (42.000 €)"],
      ["2025-02", "Eigenkapitalhilfedarlehen", "Tilgungsende"],
      ["2035-08", "Bank", "Ende Sollzinsbindung"]
    ];

    autoTable(doc, {
      startY: doc.lastAutoTable?.finalY + 15 || 35,
      head: [ereignisseData[0]],
      body: ereignisseData.slice(1),
    });

    // Save the PDF
    doc.save("Finanzierungsvorschlag.pdf");
  };

  return (
    <>
      <style>{customStyles}</style>
      <div className="min-h-screen custom-bg p-4 custom-font">
        <div className="container mx-auto space-y-8">
          <Card className="section-card">
            <CardHeader>
              <CardTitle className="custom-headline">KUNDENEINGABE</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="kundenName">Name des Kunden:</Label>
                  <Input 
                    id="kundenName" 
                    value={datenstruktur.kunde.darlehensnehmer} 
                    onChange={(e) => updateDatenstruktur('kunde.darlehensnehmer', e.target.value)}
                    placeholder="Name eingeben" 
                  />
                </div>
                <div>
                  <Label htmlFor="objektart">Objektart:</Label>
                  <Select 
                    value={datenstruktur.kunde.objektArt}
                    onValueChange={(value) => updateDatenstruktur('kunde.objektArt', value)}
                  >
                    <SelectTrigger id="objektart">
                      <SelectValue placeholder="Typ auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {objektArten.map((objektName) => (
                        <SelectItem key={objektName} value={objektName}>{objektName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="nutzung">Art der Objektnutzung:</Label>
                  <Select 
                    value={datenstruktur.kunde.objektnutzung}
                    onValueChange={(value) => updateDatenstruktur('kunde.objektnutzung', value)}
                  >
                    <SelectTrigger id="nutzung">
                      <SelectValue placeholder="Nutzung auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eigennutzung">Volle Eigennutzung</SelectItem>
                      <SelectItem value="teilnutzung">Eigennutzung und Vermietung</SelectItem>
                      <SelectItem value="vermietung">Volle Vermietung</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="section-card">
            <CardHeader>
              <CardTitle className="custom-headline">KOSTENAUFSTELLUNG</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="kaufpreis">Kaufpreis:</Label>
                  <Input 
                    id="kaufpreis" 
                    type="number" 
                    value={datenstruktur.kostenaufstellung.kaufpreis} 
                    onChange={(e) => updateDatenstruktur('kostenaufstellung.kaufpreis', Number(e.target.value))}
                    placeholder="0,00 €" 
                  />
                </div>
                <div>
                  <Label htmlFor="grunderwerbssteuer">Grunderwerbssteuer:</Label>
                  <Input 
                    id="grunderwerbssteuer" 
                    type="number" 
                    value={datenstruktur.kostenaufstellung.grunderwerbssteuer} 
                    onChange={(e) => updateDatenstruktur('kostenaufstellung.grunderwerbssteuer', Number(e.target.value))}
                    placeholder="6,00 %" 
                  />
                </div>
                <div>
                  <Label htmlFor="notarkosten">Notar- und Gerichtskosten:</Label>
                  <Input 
                    id="notarkosten" 
                    type="number" 
                    value={datenstruktur.kostenaufstellung.notarUndGerichtskosten} 
                    onChange={(e) => updateDatenstruktur('kostenaufstellung.notarUndGerichtskosten', Number(e.target.value))}
                    placeholder="2,00 %" 
                  />
                </div>
                <div>
                  <Label htmlFor="eigenkapital">Eigenkapital:</Label>
                  <Input 
                    id="eigenkapital" 
                    type="number" 
                    value={datenstruktur.kostenaufstellung.eigenkapital} 
                    onChange={(e) => updateDatenstruktur('kostenaufstellung.eigenkapital', Number(e.target.value))}
                    placeholder="971,00 €" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div>
                  <Label>Gesamtaufwand:</Label>
                  <Input readOnly value={`${datenstruktur.kostenaufstellung.gesamtaufwand.toFixed(2)} €`} />
                </div>
                <div>
                  <Label>Netto-Darlehensbetrag:</Label>
                  <Input readOnly value={`${datenstruktur.kostenaufstellung.nettoDarlehensbetrag.toFixed(2)} €`} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="section-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="custom-headline">FINANZIERUNGSVARIANTEN</CardTitle>
              <Button onClick={generatePDF} className="flex items-center gap-2">
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
                    <div className="space-y-4">
                      {variante.tranchen.map((tranche, trancheIndex) => (
                        <Card key={trancheIndex}>
                          <CardHeader>
                            <CardTitle className="custom-headline">Tranche {trancheIndex + 1}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor={`trancheName-${trancheIndex}`}>Name der Tranche:</Label>
                                  <Input
                                    id={`trancheName-${trancheIndex}`}
                                    value={tranche.eingabe.tranchenName}
                                    onChange={(e) => updateTranche(varianteIndex, trancheIndex, { eingabe: { tranchenName: e.target.value } })}
                                    placeholder="Name eingeben"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`institut-${trancheIndex}`}>Name des Kreditinstitutes:</Label>
                                  <Input
                                    id={`institut-${trancheIndex}`}
                                    value={tranche.eingabe.kreditinstitut}
                                    onChange={(e) => updateTranche(varianteIndex, trancheIndex, { eingabe: { kreditinstitut: e.target.value } })}
                                    placeholder="z.B. Deutsche Bank"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`betrag-${trancheIndex}`}>Brutto Darlehensbetrag:</Label>
                                  <Input
                                    id={`betrag-${trancheIndex}`}
                                    type="number"
                                    value={tranche.eingabe.darlehen}
                                    onChange={(e) => updateTranche(varianteIndex, trancheIndex, { eingabe: { darlehen: Number(e.target.value) } })}
                                    placeholder="0,00 €"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`startDatum-${trancheIndex}`}>Startdatum:</Label>
                                  <div className="flex items-center space-x-2">
                                    <Input
                                      type="text"
                                      value={format(new Date(tranche.eingabe.startdatum), "dd.MM.yyyy")}
                                      onChange={(e) => handleDateChange(e.target.value, (date) => updateTranche(varianteIndex, trancheIndex, { eingabe: { startdatum: date.toISOString().split('T')[0] } }))}
                                      placeholder="TT.MM.JJJJ"
                                    />
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button variant="outline" size="icon">
                                          <CalendarIcon className="h-4 w-4" />
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0">
                                        <Calendar
                                          mode="single"
                                          selected={new Date(tranche.eingabe.startdatum)}
                                          onSelect={(date) => updateTranche(varianteIndex, trancheIndex, { eingabe: { startdatum: date?.toISOString().split('T')[0] || format(new Date(), 'yyyy-MM-dd') } })}
                                          initialFocus
                                        />
                                      </PopoverContent>
                                    </Popover>
                                  </div>
                                </div>
                                <div>
                                  <Label htmlFor={`endDatum-${trancheIndex}`}>Enddatum:</Label>
                                  <div className="flex items-center space-x-2">
                                    <Input
                                      type="text"
                                      value={format(new Date(tranche.eingabe.enddatum), "dd.MM.yyyy")}
                                      onChange={(e) => handleDateChange(e.target.value, (date) => updateTranche(varianteIndex, trancheIndex, { eingabe: { enddatum: date.toISOString().split('T')[0] } }))}
                                      placeholder="TT.MM.JJJJ"
                                    />
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button variant="outline" size="icon">
                                          <CalendarIcon className="h-4 w-4" />
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0">
                                        <Calendar
                                          mode="single"
                                          selected={new Date(tranche.eingabe.enddatum)}
                                          onSelect={(date) => updateTranche(varianteIndex, trancheIndex, { eingabe: { enddatum: date?.toISOString().split('T')[0] || format(addYears(new Date(), 10), 'yyyy-MM-dd') } })}
                                          initialFocus
                                        />
                                      </PopoverContent>
                                    </Popover>
                                  </div>
                                </div>
                                <div>
                                  <Label htmlFor={`zinslaufzeit-${trancheIndex}`}>Zinslaufzeit:</Label>
                                  <Input
                                    id={`zinslaufzeit-${trancheIndex}`}
                                    type="number"
                                    value={tranche.eingabe.zinslaufzeit}
                                    onChange={(e) => updateTranche(varianteIndex, trancheIndex, { eingabe: { zinslaufzeit: Number(e.target.value) } })}
                                    placeholder="15"
                                  />
                                  <span className="text-sm text-gray-500 ml-2">Jahre</span>
                                </div>
                                <div>
                                  <Label htmlFor={`sollzins-${trancheIndex}`}>Sollzins p.a.:</Label>
                                  <Input
                                    id={`sollzins-${trancheIndex}`}
                                    type="number"
                                    step="0.01"
                                    value={tranche.eingabe.sollzins}
                                    onChange={(e) => updateTranche(varianteIndex, trancheIndex, { eingabe: { sollzins: Number(e.target.value) } })}
                                    placeholder="1,35"
                                  />
                                  <span className="text-sm text-gray-500 ml-2">%</span>
                                </div>
                                <div>
                                  <Label>Tilgungsraten:</Label>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="outline">Tilgungsraten bearbeiten</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Tilgungsraten für Zeiträume</DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <div className="grid grid-cols-3 gap-4">
                                          <div>
                                            <Label htmlFor="startDatum">Startdatum:</Label>
                                            <div className="flex items-center space-x-2">
                                              <Input
                                                type="text"
                                                value={format(new Date(neueTilgungsrate.startDatum), "dd.MM.yyyy")}
                                                onChange={(e) => handleDateChange(e.target.value, (date) => setNeueTilgungsrate({...neueTilgungsrate, startDatum: date.toISOString().split('T')[0]}))}
                                                placeholder="TT.MM.JJJJ"
                                              />
                                              <Popover>
                                                <PopoverTrigger asChild>
                                                  <Button variant="outline" size="icon">
                                                    <CalendarIcon className="h-4 w-4" />
                                                  </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                  <Calendar
                                                    mode="single"
                                                    selected={new Date(neueTilgungsrate.startDatum)}
                                                    onSelect={(date) => setNeueTilgungsrate({...neueTilgungsrate, startDatum: date?.toISOString().split('T')[0] || format(new Date(), 'yyyy-MM-dd')})}
                                                    initialFocus
                                                  />
                                                </PopoverContent>
                                              </Popover>
                                            </div>
                                          </div>
                                          <div>
                                            <Label htmlFor="endDatum">Enddatum:</Label>
                                            <div className="flex items-center space-x-2">
                                              <Input
                                                type="text"
                                                value={format(new Date(neueTilgungsrate.endDatum), "dd.MM.yyyy")}
                                                onChange={(e) => handleDateChange(e.target.value, (date) => setNeueTilgungsrate({...neueTilgungsrate, endDatum: date.toISOString().split('T')[0]}))}
                                                placeholder="TT.MM.JJJJ"
                                              />
                                              <Popover>
                                                <PopoverTrigger asChild>
                                                  <Button variant="outline" size="icon">
                                                    <CalendarIcon className="h-4 w-4" />
                                                  </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                  <Calendar
                                                    mode="single"
                                                    selected={new Date(neueTilgungsrate.endDatum)}
                                                    onSelect={(date) => setNeueTilgungsrate({...neueTilgungsrate, endDatum: date?.toISOString().split('T')[0] || format(addYears(new Date(), 10), 'yyyy-MM-dd')})}
                                                    initialFocus
                                                  />
                                                </PopoverContent>
                                              </Popover>
                                            </div>
                                          </div>
                                          <div>
                                            <Label htmlFor="rate">Tilgungsrate:</Label>
                                            <Input
                                              id="rate"
                                              type="number"
                                              step="0.01"
                                              value={neueTilgungsrate.rate}
                                              onChange={(e) => setNeueTilgungsrate({...neueTilgungsrate, rate: Number(e.target.value)})}
                                              placeholder="0,00"
                                            />
                                            <span className="text-sm text-gray-500 ml-2">%</span>
                                          </div>
                                        </div>
                                        <Button onClick={() => tilgungsrateHinzufügen(varianteIndex, trancheIndex)}>Zeitraum hinzufügen</Button>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                  <div className="mt-2 space-y-2">
                                    {tranche.eingabe.tilgungsraten.map((rate, index) => (
                                      <div key={index} className="text-sm">
                                        <span>{format(new Date(rate.startDatum), "dd.MM.yyyy")} - {format(new Date(rate.endDatum), "dd.MM.yyyy")}: </span>
                                        <span className="font-semibold">{rate.rate.toFixed(2)} %</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <Label>Sondertilgungen:</Label>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="outline">Sondertilgung hinzufügen</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Sondertilgung hinzufügen</DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <div>
                                          <Label htmlFor="sondertilgungStartDatum">Startdatum:</Label>
                                          <div className="flex items-center space-x-2">
                                            <Input
                                              type="text"
                                              value={format(new Date(neueSondertilgung.startDatum), "dd.MM.yyyy")}
                                              onChange={(e) => handleDateChange(e.target.value, (date) => setNeueSondertilgung({...neueSondertilgung, startDatum: date.toISOString().split('T')[0]}))}
                                              placeholder="TT.MM.JJJJ"
                                            />
                                            <Popover>
                                              <PopoverTrigger asChild>
                                                <Button variant="outline" size="icon">
                                                  <CalendarIcon className="h-4 w-4" />
                                                </Button>
                                              </PopoverTrigger>
                                              <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                  mode="single"
                                                  selected={new Date(neueSondertilgung.startDatum)}
                                                  onSelect={(date) => setNeueSondertilgung({...neueSondertilgung, startDatum: date?.toISOString().split('T')[0] || format(new Date(), 'yyyy-MM-dd')})}
                                                  initialFocus
                                                />
                                              </PopoverContent>
                                            </Popover>
                                          </div>
                                        </div>
                                        <div>
                                          <Label htmlFor="sondertilgungEndDatum">Enddatum (optional):</Label>
                                          <div className="flex items-center space-x-2">
                                            <Input
                                              type="text"
                                              value={neueSondertilgung.endDatum ? format(new Date(neueSondertilgung.endDatum), "dd.MM.yyyy") : ""}
                                              onChange={(e) => handleDateChange(e.target.value, (date) => setNeueSondertilgung({...neueSondertilgung, endDatum: date.toISOString().split('T')[0]}))}
                                              placeholder="TT.MM.JJJJ"
                                            />
                                            <Popover>
                                              <PopoverTrigger asChild>
                                                <Button variant="outline" size="icon">
                                                  <CalendarIcon className="h-4 w-4" />
                                                </Button>
                                              </PopoverTrigger>
                                              <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                  mode="single"
                                                  selected={neueSondertilgung.endDatum ? new Date(neueSondertilgung.endDatum) : undefined}
                                                  onSelect={(date) => setNeueSondertilgung({...neueSondertilgung, endDatum: date?.toISOString().split('T')[0] || null})}
                                                  initialFocus
                                                />
                                              </PopoverContent>
                                            </Popover>
                                          </div>
                                        </div>
                                        <div>
                                          <Label htmlFor="sondertilgungBetrag">Betrag:</Label>
                                          <Input
                                            id="sondertilgungBetrag"
                                            type="number"
                                            value={neueSondertilgung.betrag}
                                            onChange={(e) => setNeueSondertilgung({...neueSondertilgung, betrag: Math.floor(Number(e.target.value))})}
                                            placeholder="0"
                                          />
                                          <span className="text-sm text-gray-500 ml-2">€</span>
                                        </div>
                                        <Button onClick={() => sondertilgungHinzufügen(varianteIndex, trancheIndex)}>Sondertilgung hinzufügen</Button>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                  <div className="mt-2 space-y-2">
                                    {tranche.eingabe.sondertilgungen.map((sondertilgung, index) => (
                                      <div key={index} className="text-sm">
                                        <span>{format(new Date(sondertilgung.startDatum), "dd.MM.yyyy")} - {sondertilgung.endDatum ? format(new Date(sondertilgung.endDatum), "dd.MM.yyyy") : "Ende der Finanzierung"}: </span>
                                        <span className="font-semibold">{sondertilgung.betrag} €</span>
                                      </div>
                                    ))}
                                  </div>
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
                          </CardContent>
                        </Card>
                      ))}
                      <Button onClick={() => trancheHinzufügen(varianteIndex)}>Tranche hinzufügen</Button>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}