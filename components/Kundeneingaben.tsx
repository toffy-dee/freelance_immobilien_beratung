import { useStateContext } from '@/context/StateContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Kunde } from '@/types/datenstruktur';

const objektArten = [  
  "ETW", "Einfamilienhaus", "Zweifamilienhaus", "Mehrfamilienhaus", "Wohn- und Geschäftshaus", "Gewerbeobjekt", "Volle Eigennutzung", "Eigennutzung und Vermietung", "Volle Vermietung"
];

export function Kundeneingaben() {
  const { datenstruktur, setDatenstruktur } = useStateContext();

  const updateKunde = (field: keyof Kunde, value: string) => {
    setDatenstruktur(prev => ({
      ...prev,
      kunde: {
        ...prev.kunde,
        [field]: value
      }
    }));
  };

  return (
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
              onChange={(e) => updateKunde('darlehensnehmer', e.target.value)}
              placeholder="Name eingeben" 
            />
          </div>
          <div>
            <Label htmlFor="objektart">Objektart:</Label>
            <Select 
              value={datenstruktur.kunde.objektArt}
              onValueChange={(value) => updateKunde('objektArt', value)}
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
              onValueChange={(value) => updateKunde('objektnutzung', value)}
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
  );
}