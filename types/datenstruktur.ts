export type Tilgungsrate = {
  startDatum: string;
  endDatum: string;
  rate: number;
}

export type Sondertilgung = {
  startDatum: string;
  endDatum: string | null;
  betrag: number;
}

export type Tranche = {
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

export type Variante = {
  name: string;
  tranchen: Tranche[];
}

export type Datenstruktur = {
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