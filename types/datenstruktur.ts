export type Tilgungsrate = {
  startdatum: string;
  enddatum: string;
  rate: number;
}

export type Sondertilgung = {
  datum: string;
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
  grafikGesamtentwicklung: { jahr: number; restschuld: number; immobilienwert: number }[]; // Add this line
  grafikMonatlicheRaten: { jahr: number, zinsanteil: number, tilgungsanteil: number }[]; // Add this line
}

export type Kunde = {
  objektnutzung: string;
  objektArt: string;
  darlehensnehmer: string;
}

export type Kostenaufstellung = {
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
}

export type Datenstruktur = {
  kunde: Kunde;
  kostenaufstellung: Kostenaufstellung;
  finanzierungsvarianten: Variante[];
};

export type stringJson = { [key: string]: string }