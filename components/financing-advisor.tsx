'use client'

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

type Tilgungsrate = {
  startDatum: Date;
  endDatum: Date;
  rate: number;
}

type Sondertilgung = {
  startDatum: Date;
  endDatum: Date | null;
  betrag: number;
}

type Tranche = {
  name: string;
  kreditinstitut: string;
  bruttoDarlehensbetrag: number;
  startDatum: Date;
  endDatum: Date;
  zinslaufzeit: number;
  sollzins: number;
  tilgungsraten: Tilgungsrate[];
  sondertilgungen: Sondertilgung[];
}

type Variante = {
  id: number;
  tranchen: Tranche[];
}

export function FinancingAdvisorComponent() {
  const objektArten = [  
    "ETW", "Einfamilienhaus", "Zweifamilienhaus", "Mehrfamilienhaus", "Wohn- und Geschäftshaus", "Gewerbeobjekt", "Volle Eigennutzung", "Eigennutzung und Vermietung", "Volle Vermietung"
  ];

  const [varianten, setVarianten] = useState<Variante[]>([
    {
      id: 1,
      tranchen: [
        {
          name: '',
          kreditinstitut: '',
          bruttoDarlehensbetrag: 0,
          startDatum: new Date(),
          endDatum: addYears(new Date(), 10),
          zinslaufzeit: 10,
          sollzins: 0,
          tilgungsraten: [],
          sondertilgungen: []
        }
      ]
    }
  ])
  const [aktiveVariante, setAktiveVariante] = useState(1)
  const [neueTilgungsrate, setNeueTilgungsrate] = useState<Tilgungsrate>({
    startDatum: new Date(),
    endDatum: addYears(new Date(), 10),
    rate: 0
  })
  const [neueSondertilgung, setNeueSondertilgung] = useState<Sondertilgung>({
    startDatum: new Date(),
    endDatum: null,
    betrag: 0
  })

  const varianteHinzufügen = () => {
    const neueVariante: Variante = {
      id: varianten.length + 1,
      tranchen: [
        {
          name: '',
          kreditinstitut: '',
          bruttoDarlehensbetrag: 0,
          startDatum: new Date(),
          endDatum: addYears(new Date(), 10),
          zinslaufzeit: 10,
          sollzins: 0,
          tilgungsraten: [],
          sondertilgungen: []
        }
      ]
    }
    setVarianten([...varianten, neueVariante])
    setAktiveVariante(neueVariante.id)
  }

  const trancheHinzufügen = (varianteId: number) => {
    setVarianten(varianten.map(variante => 
      variante.id === varianteId 
        ? {
            ...variante,
            tranchen: [
              ...variante.tranchen,
              {
                name: '',
                kreditinstitut: '',
                bruttoDarlehensbetrag: 0,
                startDatum: new Date(),
                endDatum: addYears(new Date(), 10),
                zinslaufzeit: 10,
                sollzins: 0,
                tilgungsraten: [],
                sondertilgungen: []
              }
            ]
          }
        : variante
    ))
  }

  const tilgungsrateHinzufügen = (varianteId: number, trancheIndex: number) => {
    setVarianten(varianten.map(variante => 
      variante.id === varianteId 
        ? {
            ...variante,
            tranchen: variante.tranchen.map((tranche, index) => 
              index === trancheIndex
                ? {
                    ...tranche,
                    tilgungsraten: [
                      ...tranche.tilgungsraten.map(rate => ({
                        ...rate,
                        endDatum: subMonths(neueTilgungsrate.startDatum, 1)
                      })),
                      neueTilgungsrate
                    ].sort((a, b) => a.startDatum.getTime() - b.startDatum.getTime())
                  }
                : tranche
            )
          }
        : variante
    ))
    setNeueTilgungsrate({
      startDatum: new Date(),
      endDatum: addYears(new Date(), 10),
      rate: 0
    })
  }

  const sondertilgungHinzufügen = (varianteId: number, trancheIndex: number) => {
    setVarianten(varianten.map(variante => 
      variante.id === varianteId 
        ? {
            ...variante,
            tranchen: variante.tranchen.map((tranche, index) => 
              index === trancheIndex
                ? {
                    ...tranche,
                    sondertilgungen: [
                      ...tranche.sondertilgungen.map(tilgung => ({
                        ...tilgung,
                        endDatum: subMonths(neueSondertilgung.startDatum, 1)
                      })),
                      {
                        ...neueSondertilgung,
                        betrag: Math.min(Math.floor(neueSondertilgung.betrag), tranche.bruttoDarlehensbetrag),
                        endDatum: neueSondertilgung.endDatum || tranche.endDatum
                      }
                    ].sort((a, b) => a.startDatum.getTime() - b.startDatum.getTime())
                  }
                : tranche
            )
          }
        : variante
    ))
    setNeueSondertilgung({
      startDatum: new Date(),
      endDatum: null,
      betrag: 0
    })
  }

  const updateTranche = (varianteId: number, trancheIndex: number, updatedTranche: Partial<Tranche>) => {
    setVarianten(varianten.map(variante => 
      variante.id === varianteId 
        ? {
            ...variante,
            tranchen: variante.tranchen.map((tranche, index) => 
              index === trancheIndex
                ? { ...tranche, ...updatedTranche }
                : tranche
            )
          }
        : variante
    ))
  }

  const handleDateChange = (value: string, setter: (date: Date) => void) => {
    const parsedDate = parse(value, 'dd.MM.yyyy', new Date())
    if (isValid(parsedDate)) {
      setter(parsedDate)
    }
  }

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
                  <Input id="kundenName" placeholder="Name eingeben" />
                </div>
                <div>
                  <Label htmlFor="objektart">Objektart:</Label>
                  <Select>
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
                  <Select>
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
                  <Input id="kaufpreis" type="text" placeholder="0,00 €" />
                </div>
                <div>
                  <Label htmlFor="grunderwerbssteuer">Grunderwerbssteuer:</Label>
                  <Input id="grunderwerbssteuer" type="text" placeholder="6,00 %" />
                </div>
                <div>
                  <Label htmlFor="notarkosten">Notar- und Gerichtskosten:</Label>
                  <Input id="notarkosten" type="text" placeholder="2,00 %" />
                </div>
                <div>
                  <Label htmlFor="eigenkapital">Eigenkapital:</Label>
                  <Input id="eigenkapital" type="text" placeholder="971,00 €" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div>
                  <Label>Gesamtaufwand:</Label>
                  <Input readOnly value="203.971,00 €" />
                </div>
                <div>
                  <Label>Netto-Darlehensbetrag:</Label>
                  <Input readOnly value="203.000,00 €" />
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
                  {varianten.map((variante) => (
                    <TabsTrigger key={variante.id} value={`variante-${variante.id}`}>
                      Variante {variante.id}
                    </TabsTrigger>
                  ))}
                  <Button variant="outline" onClick={varianteHinzufügen}>+</Button>
                </TabsList>
                {varianten.map((variante) => (
                  <TabsContent key={variante.id} value={`variante-${variante.id}`}>
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
                                    value={tranche.name}
                                    onChange={(e) => updateTranche(variante.id, trancheIndex, { name: e.target.value })}
                                    placeholder="Name eingeben"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`institut-${trancheIndex}`}>Name des Kreditinstitutes:</Label>
                                  <Input
                                    id={`institut-${trancheIndex}`}
                                    value={tranche.kreditinstitut}
                                    onChange={(e) => updateTranche(variante.id, trancheIndex, { kreditinstitut: e.target.value })}
                                    placeholder="z.B. Deutsche Bank"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`betrag-${trancheIndex}`}>Brutto Darlehensbetrag:</Label>
                                  <Input
                                    id={`betrag-${trancheIndex}`}
                                    type="number"
                                    value={tranche.bruttoDarlehensbetrag}
                                    onChange={(e) => updateTranche(variante.id, trancheIndex, { bruttoDarlehensbetrag: Number(e.target.value) })}
                                    placeholder="0,00 €"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`startDatum-${trancheIndex}`}>Startdatum:</Label>
                                  <div className="flex items-center space-x-2">
                                    <Input
                                      type="text"
                                      value={format(tranche.startDatum, "dd.MM.yyyy")}
                                      onChange={(e) => handleDateChange(e.target.value, (date) => updateTranche(variante.id, trancheIndex, { startDatum: date }))}
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
                                          selected={tranche.startDatum}
                                          onSelect={(date) => updateTranche(variante.id, trancheIndex, { startDatum: date || new Date() })}
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
                                      value={format(tranche.endDatum, "dd.MM.yyyy")}
                                      onChange={(e) => handleDateChange(e.target.value, (date) => updateTranche(variante.id, trancheIndex, { endDatum: date }))}
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
                                          selected={tranche.endDatum}
                                          onSelect={(date) => updateTranche(variante.id, trancheIndex, { endDatum: date || addYears(new Date(), 10) })}
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
                                    value={tranche.zinslaufzeit}
                                    onChange={(e) => updateTranche(variante.id, trancheIndex, { zinslaufzeit: Number(e.target.value) })}
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
                                    value={tranche.sollzins}
                                    onChange={(e) => updateTranche(variante.id, trancheIndex, { sollzins: Number(e.target.value) })}
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
                                                value={format(neueTilgungsrate.startDatum, "dd.MM.yyyy")}
                                                onChange={(e) => handleDateChange(e.target.value, (date) => setNeueTilgungsrate({...neueTilgungsrate, startDatum: date}))}
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
                                                    selected={neueTilgungsrate.startDatum}
                                                    onSelect={(date) => setNeueTilgungsrate({...neueTilgungsrate, startDatum: date || new Date()})}
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
                                                value={format(neueTilgungsrate.endDatum, "dd.MM.yyyy")}
                                                onChange={(e) => handleDateChange(e.target.value, (date) => setNeueTilgungsrate({...neueTilgungsrate, endDatum: date}))}
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
                                                    selected={neueTilgungsrate.endDatum}
                                                    onSelect={(date) => setNeueTilgungsrate({...neueTilgungsrate, endDatum: date || addYears(new Date(), 10)})}
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
                                        <Button onClick={() => tilgungsrateHinzufügen(variante.id, trancheIndex)}>Zeitraum hinzufügen</Button>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                  <div className="mt-2 space-y-2">
                                    {tranche.tilgungsraten.map((rate, index) => (
                                      <div key={index} className="text-sm">
                                        <span>{format(rate.startDatum, "dd.MM.yyyy")} - {format(rate.endDatum, "dd.MM.yyyy")}: </span>
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
                                              value={format(neueSondertilgung.startDatum, "dd.MM.yyyy")}
                                              onChange={(e) => handleDateChange(e.target.value, (date) => setNeueSondertilgung({...neueSondertilgung, startDatum: date}))}
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
                                                  selected={neueSondertilgung.startDatum}
                                                  onSelect={(date) => setNeueSondertilgung({...neueSondertilgung, startDatum: date || new Date()})}
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
                                              value={neueSondertilgung.endDatum ? format(neueSondertilgung.endDatum, "dd.MM.yyyy") : ""}
                                              onChange={(e) => handleDateChange(e.target.value, (date) => setNeueSondertilgung({...neueSondertilgung, endDatum: date}))}
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
                                                  selected={neueSondertilgung.endDatum || undefined}
                                                  onSelect={(date) => setNeueSondertilgung({...neueSondertilgung, endDatum: date || null})}
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
                                        <Button onClick={() => sondertilgungHinzufügen(variante.id, trancheIndex)}>Sondertilgung hinzufügen</Button>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                  <div className="mt-2 space-y-2">
                                    {tranche.sondertilgungen.map((sondertilgung, index) => (
                                      <div key={index} className="text-sm">
                                        <span>{format(sondertilgung.startDatum, "dd.MM.yyyy")} - {sondertilgung.endDatum ? format(sondertilgung.endDatum, "dd.MM.yyyy") : "Ende der Finanzierung"}: </span>
                                        <span className="font-semibold">{sondertilgung.betrag} €</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-4 bg-muted p-4 rounded-lg">
                                <div>
                                  <Label>Monatliche Abzahlung:</Label>
                                  <Input readOnly value="449,46 €" />
                                </div>
                                <div>
                                  <Label>Restschuld nach Zinsbindung:</Label>
                                  <Input readOnly value="107.495,35 €" />
                                </div>
                                <div>
                                  <Label>Voraussichtliche Laufzeit:</Label>
                                  <Input readOnly value="38,2 Jahre" />
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      <Button onClick={() => trancheHinzufügen(variante.id)}>Tranche hinzufügen</Button>
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