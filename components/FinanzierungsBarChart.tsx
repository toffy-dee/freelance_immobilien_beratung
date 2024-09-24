import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type FinanzierungsBarChartProps = {
  data: { jahr: number; zinsanteil: number; tilgungsanteil: number }[];
};

export function FinanzierungsBarChart({ data }: FinanzierungsBarChartProps) {
  console.log('FinanzierungsBarChart data:', data);

  // Calculate the min and max values for the Y-axis
  const minY = 0;
  const maxY = Math.max(...data.map(d => d.zinsanteil + d.tilgungsanteil));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="jahr" />
        <YAxis domain={[minY, maxY]} />
        <Tooltip />
        <Legend />
        <Bar dataKey="zinsanteil" stackId="a" fill="#ff0000" name="Zinsanteil" />
        <Bar dataKey="tilgungsanteil" stackId="a" fill="#0000ff" name="Tilgungsanteil" />
      </BarChart>
    </ResponsiveContainer>
  );
}