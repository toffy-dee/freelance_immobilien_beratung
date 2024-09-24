import { useStateContext } from '@/context/StateContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Kostenaufstellung } from '@/types/datenstruktur';
import { useEffect, useState } from 'react';
import { stringJson } from '@/types/datenstruktur';

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
};

const parseNumber = (value: string): number => {
  return Number(value.replace(/\./g, '').replace(',', '.'));
};

export function KostenAufstellung() {
  const { datenstruktur, setDatenstruktur } = useStateContext();
  const [inputValues, setInputValues] = useState<stringJson>({});

  useEffect(() => {
    setInputValues({
      kaufpreis: formatNumber(datenstruktur.kostenaufstellung.kaufpreis),
      grunderwerbssteuer: formatNumber(datenstruktur.kostenaufstellung.grunderwerbssteuer),
      notarUndGerichtskosten: formatNumber(datenstruktur.kostenaufstellung.notarUndGerichtskosten),
      vermittlerprovision: formatNumber(datenstruktur.kostenaufstellung.vermittlerprovision),
      eigenkapital: formatNumber(datenstruktur.kostenaufstellung.eigenkapital),
    });
  }, []);

  const updateKostenaufstellung = (field: keyof Kostenaufstellung, value: string) => {
    console.log('updateKostenaufstellung: ', value);
    setInputValues(prev => ({ ...prev, [field]: value }));
    
    const numericValue = parseNumber(value);
    if (!isNaN(numericValue)) {
      setDatenstruktur(prev => ({
        ...prev,
        kostenaufstellung: {
          ...prev.kostenaufstellung,
          [field]: numericValue
        }
      }));
    }
  };

  const handleInputBlur = (field: keyof Kostenaufstellung) => {
    const numericValue = parseNumber(inputValues[field]);
    if (!isNaN(numericValue)) {
      setInputValues(prev => ({ ...prev, [field]: formatNumber(numericValue) }));
    }
  };

  const calculateRisikoanalyse = (nettoDarlehensbetrag: number, kaufpreis: number): number => {
    if (kaufpreis === 0) return 0;
    return (nettoDarlehensbetrag / kaufpreis) * 100;
  };

  useEffect(() => {
    const { kaufpreis, grunderwerbssteuer, notarUndGerichtskosten, vermittlerprovision } = datenstruktur.kostenaufstellung;
    
    const grunderwerbssteuerPreis = (grunderwerbssteuer / 100) * kaufpreis;
    const notarUndGerichtskostenPreis = (notarUndGerichtskosten / 100) * kaufpreis;
    const vermittlerprovisionPreis = (vermittlerprovision / 100) * kaufpreis;
    
    const gesamtaufwand = kaufpreis + grunderwerbssteuerPreis + notarUndGerichtskostenPreis + vermittlerprovisionPreis;
    const nettoDarlehensbetrag = gesamtaufwand - datenstruktur.kostenaufstellung.eigenkapital;
    const risikoanalyse = calculateRisikoanalyse(nettoDarlehensbetrag, kaufpreis);

    setDatenstruktur(prev => ({
      ...prev,
      kostenaufstellung: {
        ...prev.kostenaufstellung,
        grunderwerbssteuerPreis,
        notarUndGerichtskostenPreis,
        vermittlerprovisionPreis,
        gesamtaufwand,
        nettoDarlehensbetrag,
        risikoanalyse
      }
    }));
  }, [datenstruktur.kostenaufstellung.kaufpreis, datenstruktur.kostenaufstellung.grunderwerbssteuer, 
      datenstruktur.kostenaufstellung.notarUndGerichtskosten, datenstruktur.kostenaufstellung.vermittlerprovision,
      datenstruktur.kostenaufstellung.eigenkapital]);

  return (
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
              value={inputValues.kaufpreis || ''}
              onChange={(e) => updateKostenaufstellung('kaufpreis', e.target.value)}
              onBlur={() => handleInputBlur('kaufpreis')}
              placeholder="0,00" 
            />
          </div>
          <div>
            <Label htmlFor="grunderwerbssteuer">Grunderwerbssteuer (%):</Label>
            <Input 
              id="grunderwerbssteuer" 
              value={inputValues.grunderwerbssteuer || ''}
              onChange={(e) => updateKostenaufstellung('grunderwerbssteuer', e.target.value)}
              onBlur={() => handleInputBlur('grunderwerbssteuer')}
              placeholder="0,00" 
            />
            <div className="text-sm mt-1">
              {formatNumber(datenstruktur.kostenaufstellung.grunderwerbssteuerPreis)} €
            </div>
          </div>
          <div>
            <Label htmlFor="notarkosten">Notar- und Gerichtskosten (%):</Label>
            <Input 
              id="notarkosten" 
              value={inputValues.notarUndGerichtskosten || ''}
              onChange={(e) => updateKostenaufstellung('notarUndGerichtskosten', e.target.value)}
              onBlur={() => handleInputBlur('notarUndGerichtskosten')}
              placeholder="0,00" 
            />
            <div className="text-sm mt-1">
              {formatNumber(datenstruktur.kostenaufstellung.notarUndGerichtskostenPreis)} €
            </div>
          </div>
          <div>
            <Label htmlFor="vermittlerprovision">Vermittlerprovision (%):</Label>
            <Input 
              id="vermittlerprovision" 
              value={inputValues.vermittlerprovision || ''}
              onChange={(e) => updateKostenaufstellung('vermittlerprovision', e.target.value)}
              onBlur={() => handleInputBlur('vermittlerprovision')}
              placeholder="0,00" 
            />
            <div className="text-sm mt-1">
              {formatNumber(datenstruktur.kostenaufstellung.vermittlerprovisionPreis)} €
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="eigenkapital">Eigenkapital:</Label>
            <Input 
              id="eigenkapital" 
              value={inputValues.eigenkapital || ''}
              onChange={(e) => updateKostenaufstellung('eigenkapital', e.target.value)}
              onBlur={() => handleInputBlur('eigenkapital')}
              placeholder="0,00" 
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div>
            <Label>Gesamtaufwand:</Label>
            <Input readOnly value={formatNumber(datenstruktur.kostenaufstellung.gesamtaufwand)} />
          </div>
          <div>
            <Label>Netto-Darlehensbetrag:</Label>
            <Input readOnly value={formatNumber(datenstruktur.kostenaufstellung.nettoDarlehensbetrag)} />
          </div>
          <div className="bg-yellow-100 p-2 rounded">
            <Label className="font-bold">Risikoanalyse:</Label>
            <Input 
              readOnly 
              value={`${datenstruktur.kostenaufstellung.risikoanalyse.toFixed(2)} %`} 
              className="bg-yellow-50 border-yellow-300"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}