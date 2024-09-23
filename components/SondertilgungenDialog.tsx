import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NumberInput } from './NumberInput'
import { Sondertilgung } from '@/types/datenstruktur'
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, parse } from 'date-fns';

type SondertilgungenDialogProps = {
  neueSondertilgung: Sondertilgung;
  onSondertilgungChange: (field: keyof Sondertilgung, value: string | number) => void;
  onSondertilgungDateChange: (value: string) => void;
  onAddSondertilgung: () => void;
};

export function SondertilgungenDialog({
  neueSondertilgung,
  onSondertilgungChange,
  onSondertilgungDateChange,
  onAddSondertilgung
}: SondertilgungenDialogProps) {
  const handleDateChange = (date: Date | null) => {
    if (date) {
      onSondertilgungDateChange(format(date, 'yyyy-MM'));
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="mt-2">Sondertilgung hinzufügen</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sondertilgung hinzufügen</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="sondertilgungDatum">Datum:</Label>
            <DatePicker
              selected={parse(neueSondertilgung.datum, 'yyyy-MM', new Date())}
              onChange={handleDateChange}
              dateFormat="yyyy-MM"
              showMonthYearPicker
              showFullMonthYearPicker
              className="input"
              renderCustomHeader={({ date, changeYear }) => (
                <div className="flex justify-between">
                  <button onClick={() => changeYear(date.getFullYear() - 1)}>&lt;</button>
                  <select
                    value={date.getFullYear()}
                    onChange={({ target: { value } }) => changeYear(parseInt(value))}
                  >
                    {Array.from({ length: 100 }, (_, i) => (
                      <option key={i} value={currentYear - 50 + i}>
                        {currentYear - 50 + i}
                      </option>
                    ))}
                  </select>
                  <button onClick={() => changeYear(date.getFullYear() + 1)}>&gt;</button>
                </div>
              )}
              popperClassName="react-datepicker-popper"
              calendarClassName="react-datepicker-calendar"
              dayClassName={(date) =>
                date.getDate() === new Date().getDate() &&
                date.getMonth() === new Date().getMonth() &&
                date.getFullYear() === new Date().getFullYear()
                  ? 'react-datepicker-day--today'
                  : ''
              }
            />
          </div>
          <div>
            <Label htmlFor="sondertilgungBetrag">Betrag:</Label>
            <NumberInput
              id="sondertilgungBetrag"
              value={neueSondertilgung.betrag}
              onChange={(value) => onSondertilgungChange('betrag', value)}
              placeholder="0,00"
            />
            <span className="text-sm text-gray-500 ml-2">€</span>
          </div>
          <Button onClick={onAddSondertilgung}>Sondertilgung hinzufügen</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}