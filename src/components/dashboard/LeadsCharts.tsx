import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Lead } from "@/pages/Dashboard";
import { startOfWeek, format } from "date-fns";

interface LeadsChartsProps {
  leads: Lead[];
}

export const LeadsCharts = ({ leads }: LeadsChartsProps) => {
  // Data for bar chart: Leads by type
  const typeData = leads.reduce((acc, lead) => {
    const existing = acc.find((item) => item.name === lead.type_travaux);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: lead.type_travaux, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  // Data for line chart: Leads per week
  const weeklyData = leads.reduce((acc, lead) => {
    const weekStart = startOfWeek(new Date(lead.timestamp));
    const weekLabel = format(weekStart, "dd/MM");
    const existing = acc.find((item) => item.name === weekLabel);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: weekLabel, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]).slice(-8);

  // Data for pie chart: Hot vs Total
  const hotCount = leads.filter((lead) => lead.lead_chaud === "oui").length;
  const coldCount = leads.length - hotCount;
  const pieData = [
    { name: "Chauds", value: hotCount },
    { name: "Autres", value: coldCount },
  ];

  const COLORS = ["hsl(var(--success))", "hsl(var(--muted))"];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Leads par Type</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={typeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fill: "hsl(var(--foreground))" }} />
              <YAxis tick={{ fill: "hsl(var(--foreground))" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                }}
              />
              <Bar dataKey="value" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Évolution Hebdomadaire</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fill: "hsl(var(--foreground))" }} />
              <YAxis tick={{ fill: "hsl(var(--foreground))" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                }}
              />
              <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Distribution Chauds</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={60}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
