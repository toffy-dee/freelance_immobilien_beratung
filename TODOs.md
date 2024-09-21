Diese App hilt Immobilienberatern dabei, die Beratung durchzuführen. 

Dateneingabe:
Klientdaten

Finanzierungsdaten
  - Beleihungsauslauf relevant vs. not:
    relevant:
      - Wertsteigerung
    nicht relevant
      - alles andere fließt nur ins darlehen ein

Facts:
Auslauf = (Kaufpreis + wertsteigerung) / Darlehensbedarf

Fragen:

- Excel EingabeMaske
  - warum nur 2 von möglichen sonstigen extrakosten?


Value of App:
Tranchen erstellung mit graphiken 
was passiert wenn tilgung anpassen?
  - kann man Tilgungsanteil beliebig unabhängig von der bank einstellen?
was passiert wenn sollzins anpassung?


## Zusammenfassung
Ich mache hier mal ein brainstorming wenns nicht stört. 

Du willst Finanzierungsvarianten, angepasst an den Kunden, einfach erstellen und darstellen können

--- Finanzierungsvarianten ---
Eine Finazierungsvariante besteht aus Tranchen

  --- Tranchen ---
  Jede Tranche hat folgende Eingabeparameter:
  - Darlehen
  - Sollzins
  - Zinslaufzeit
  - angenommner Zinswert nach Zinslaufzeit
  - Sondertilgungsereignisse
  - Tilgungsverlauf (wie viel % in welchen Jahr)

  Ausgabe einer einzelnen Tranche:
  - Abzahlung/Monat
  - Restschuld nach Zinsbindung
  - Absolute Laufzeit gemäß KPD nach Laufzeit 
  --- Tranchen Ende ---

Ausgabe einer Finanzierungsvariante
- Grafische Darstellungen wie im Tool 2
- Jahresüberblick mit Tilgungsereignissen
- Endsumme
- etc..
--- Finanzierungsvarianten Ende---


  Fragen:
  1. Soll man Sondertilgungen auf Tranchen-level oder auf Finanzierungsvarianten-level eingeben können? oder beides?
  2. Soll das Tool automatisch Finanzierungsvarianten erstellen?
  3. Würde ein Bausparvertrag immer auf einer Tranche laufen oder geht das auch Tranchen übergreifend?

 Antworten:
  1. Sondertilgung auf jede Tranche einzeln
  2. ⁠bisher nicht angedacht, kommt auf die Lösungen an
  3. ⁠Ein Bausparvertrag pro tranche

 Vorschlag:
 - Was hälst du davon wenn du mit dem Tool quasi reden oder in Fließtext schreiben kannst und das Tool dir anhand der Kundenbeschreibung Finanzierungsvarianten automatisch erstellt? Du würdest die Vorteile jeder Variante einsehen, aber natürlich auch alle Anpassungen machen können. Das könnte sehr viele manuelle Eingaben ersparen.



## App componenten

Finanzberatung
  Tranche
    Eingabe Parameter für Tranche:
      Netto Auszahlungsbetrag: 161.000,00€
      Sollzins p. a.: 1,35%
      Zinslaufzeit:  15 Jahre
      Anfängliche Tilgung 2,00%
      Sondertilgungsrecht (bis zu 5% möglich)
      KPD nach Zinsbindung: Z: 8,00% T: 0,00%

    Ausgabe per Tranche:
      monatliche Abzahlung: 449,46€
      Restschuld nach Zinsbindung: 107.495,35€
      Voraussichtliche Laufzeit: 38,2 Jahre

    

DONE:
tool nachbauen
  -zahlen im video nachvollziehen


OPEN:
tool nachbauen
  -test graphiken erstellen
  -MUI components research
  -Figma AI tutorial
Finanzvarianten erstellen basierend of LLM interaction

