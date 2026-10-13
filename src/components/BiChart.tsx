"use client";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function BiChart({ data }: { data: { mes: string; saidas: number; entradas: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data}>
        <CartesianGrid stroke="#2a3452" strokeDasharray="3 3" />
        <XAxis dataKey="mes" stroke="#8a93ad" fontSize={12} />
        <YAxis stroke="#8a93ad" fontSize={12} />
        <Tooltip contentStyle={{ background: "#151c30", border: "1px solid #2a3452" }} />
        <Area dataKey="saidas" name="Saídas" stroke="#14c8b0" fill="#14c8b0" fillOpacity={0.3} />
        <Area dataKey="entradas" name="Entradas" stroke="#8b6cf6" fill="#8b6cf6" fillOpacity={0.3} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
