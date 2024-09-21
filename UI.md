User Interface Beschreibung

Zweck der UI APP:
Ein Finanzierungsberater für Immobilien möchte während seiner Beratung mit dem Kunden eine UI benutzen, um die Finanzierungsoptionen durchzugehen. 

Sektionen

--- Sektion 1 Kundeneingabe ---
Eingabefelder:
1. Name des Kunden

2. Dropdown Menu für Immobilientyp
- Einfamilienhaus
- Zweifamilienhaus
- Mehrfamilienhaus

3. Dropdown Menu für Art der Objektnutzung
  - Volle Eigennutzung
  - Eigennutzung und Vermietung
  - Volle Vermietung


--- Sektion 2: Kostenaufstellung ---
Der User gibt folgende Eingaben ein:
1. Kaufpreis
2. Grunderwerbssteuer: e.g. 6,00%
3. Notar- und Gerichtskosten: e.g.  2,00%
4. Eigenkapital: 971€

Ausgabefelder:
Gesamtaufwand: (Summe aller Kosten) e.g. 203.971€
Netto-Darlehensbetrag: (Gesamtaufwand - Eigenkapital) e.g. 203.000€


--- Sektion 3: Finanzierungsvarianten ---

1. Nummerierte Finanzierungsvarianten in Tabs. Anfangs giibt es nur eine Finanzierungsvariante
2. Eine Finanzierungsvariante wird ausgewählt durch klick auf den jeweiligen Tab.
3. Jede Finanzierungsvariante besteht aus einer oder mehreren Tranchen. 
4. Eine Tranche ist ein Kartenobjekt und hat folgende Eingabe- und Ausgabefelder:
    Eingabe Parameter für Tranche:
      a. Name der Tranche
      b. Name des Kreditinstitutes, e.g. Deutsche Bank
      c. Brutto Darlehensbetrag: e.g. 161.000,00€
      d. Startdatum (Monat und Jahr)
      e. Enddatum (Monat und Jahr)
      f. Zinslaufzeit:  e.g. 15 Jahre
      g. Sollzins p. a.: e.g 1,35%
      h. Tilgungsrate: e.g. 2,00%
      i. Detaillierte Tilgungsraten pro Zeitraum
        Öffnet Modal für detailliertere Tilgungsraten. Genauer beschrieben in Punkt 6.
      j. Sondertilgungsrecht: e.g. 5% per year
      k. Button für detaillierte Sondertilgungen (öffnet ein Modal in React. Weitere Erklärung in Punkt 7)
      l. KPD nach Zinsbindung: Z: 8,00% T: 0,00% (2 Eingabefelder)
      m. Tilgungsfreie Monate: e.g 6
      
    Die Eingabefelder sind vertikal untereinander angeordnet

    Ausgabe per Tranche:
     a. Monatliche Abzahlung: e.g. 449,46€
     b. Restschuld nach Zinsbindung: e.g 107.495,35€
     c. Voraussichtliche Laufzeit: e.g. 38,2 Jahre

    Der Ausgabe-Part ist unter dem Eingabe-Part und ist farblich anders und dunkler als Eingabe-Part

  Kommentar:
  Anfangs gibt es nur eine Tranche aber der User kann mit einem Button-Klick neue Tranchen hinzufügen.

5. Über den Tranchen ist die Summe aller monatlichen Abzahlungen angezeigt.

6. Das Modal für detaillierte Tilgunsraten Pro Zeitraum.
  Wähle Zeitraum für Start und Ende mit jeweils Jahr und Monat und gebe Tilgungsrate für diesen Zeitraum ein.  
  Wenn Modal geschlossen, listet es die Tilgungsrate für jeden Zeitraum auf.

6. Das Modal für detaillierte Sondertilgungen zeigt eine Tabelle mit einer Zeile für jedes Jahr. Es hat eine Spalte für Jahr, eine Spalte für Tilgung

7. Zusammenfassung Tilgungstabelle für alle Tranchen
Auch eine Tabelle, vorerst leer.

8. Ereignistabelle
Eine andere Tabelle, vorerst leer.


9. Grafiken
  9.1. Grafik Monatliche Raten
  Durchschnittliche montaliche Raten für jedes Jahr als Balken Diagram. Ein Balken pro Jahr. X axis ist Jahr. Y-Axis ist Rate in €. Der Balken besteht aus rot und blau. rot steht für den Zinsanteil der montalichen Rate. Blau steht für Tilgungsanteil.

  9.2. Grafik Gesamtentwicklung
  X-Axis ist Jahr, Y-Axis ist Restschuld/Immobilienwert
  Zeigt einen kontinuierlichen Graph für Restschuld für jedes Jahr.
  Zeigt einen kontinuierlichen Graph für geschätzten Immobilienwert für jedes jahr.
- 

10. Pdf Ausdruck

