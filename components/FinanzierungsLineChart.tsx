import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type FinanzierungsLineChartProps = {
  data: { jahr: number; restschuld: number; immobilienwert: number }[];
};

export function FinanzierungsLineChart({ data }: FinanzierungsLineChartProps) {
  console.log('FinanzierungsLineChart data:', data);

  // Calculate the min and max values for the Y-axis
  const minRestschuld = Math.min(...data.map(d => d.restschuld));
  const maxRestschuld = Math.max(...data.map(d => d.restschuld));
  const minImmobilienwert = Math.min(...data.map(d => d.immobilienwert));
  const maxImmobilienwert = Math.max(...data.map(d => d.immobilienwert));

  // Determine the overall min and max values
  const minY = Math.min(minRestschuld, minImmobilienwert);
  const maxY = Math.max(maxRestschuld, maxImmobilienwert);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="jahr" />
        <YAxis domain={[minY, maxY]} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="restschuld" stroke="#8884d8" name="Restschuld" />
        <Line type="monotone" dataKey="immobilienwert" stroke="#82ca9d" name="Immobilienwert" />
      </LineChart>
    </ResponsiveContainer>
  );
}