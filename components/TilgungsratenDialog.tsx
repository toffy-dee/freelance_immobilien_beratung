import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NumberInput } from './NumberInput'
import { Tilgungsrate } from '@/types/datenstruktur'
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, parse } from 'date-fns';

type TilgungsratenDialogProps = {
  tilgungsraten: Tilgungsrate[];
  neueTilgungsrate: Tilgungsrate;
  onTilgungsrateChange: (field: keyof Tilgungsrate, value: string | number) => void;
  onTilgungsrateDateChange: (field: 'startdatum' | 'enddatum', value: string) => void;
  onAddTilgungsrate: () => void;
  onRemoveTilgungsrate: (index: number) => void;
};

export function TilgungsratenDialog({
  tilgungsraten,
  neueTilgungsrate,
  onTilgungsrateChange,
  onTilgungsrateDateChange,
  onAddTilgungsrate,
  onRemoveTilgungsrate
}: TilgungsratenDialogProps) {
  const handleDateChange = (field: 'startdatum' | 'enddatum', date: Date | null) => {
    if (date) {
      onTilgungsrateDateChange(field, format(date, 'yyyy-MM'));
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="mt-2">Tilgungsraten bearbeiten</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tilgungsraten für Zeiträume</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="startdatum">Startdatum:</Label>
              <DatePicker
                selected={parse(neueTilgungsrate.startdatum, 'yyyy-MM', new Date())}
                onChange={(date) => handleDateChange('startdatum', date)}
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
              <Label htmlFor="enddatum">Enddatum:</Label>
              <DatePicker
                selected={parse(neueTilgungsrate.enddatum, 'yyyy-MM', new Date())}
                onChange={(date) => handleDateChange('enddatum', date)}
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
              <Label htmlFor="rate">Tilgungsrate:</Label>
              <NumberInput
                id="rate"
                value={neueTilgungsrate.rate}
                onChange={(value) => onTilgungsrateChange('rate', value)}
                placeholder="0,00"
              />
              <span className="text-sm text-gray-500 ml-2">%</span>
            </div>
          </div>
          <Button onClick={onAddTilgungsrate}>Tilgungsrate hinzufügen</Button>
        </div>
        <div className="mt-4 space-y-2">
          {tilgungsraten.map((rate, index) => (
            <div key={index} className="text-sm flex justify-between items-center">
              <span>
                {rate.startdatum} - {rate.enddatum}: {rate.rate.toFixed(2)} %
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onRemoveTilgungsrate(index)}
              >
                Entfernen
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}