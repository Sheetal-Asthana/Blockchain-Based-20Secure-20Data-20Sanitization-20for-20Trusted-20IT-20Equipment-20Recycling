import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Activity, Cpu, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";
import Layout from "@/components/Layout";

const barData = [
  { month: "Jan", sanitized: 24, pending: 4 },
  { month: "Feb", sanitized: 30, pending: 5 },
  { month: "Mar", sanitized: 28, pending: 6 },
  { month: "Apr", sanitized: 35, pending: 3 },
  { month: "May", sanitized: 32, pending: 4 },
  { month: "Jun", sanitized: 38, pending: 2 },
];

const pieData = [
  { name: "Secure Erase", value: 45, color: "#0EA5E9" },
  { name: "DBAN", value: 25, color: "#3B82F6" },
  { name: "Wiping", value: 20, color: "#60A5FA" },
  { name: "Physical Destruction", value: 10, color: "#93C5FD" },
];

const recentActivity = [
  {
    id: 1,
    action: "Device Sanitized",
    device: "DEV-001",
    operator: "John Doe",
    timestamp: "2 hours ago",
    status: "completed",
  },
  {
    id: 2,
    action: "Certificate Issued",
    device: "DEV-002",
    operator: "Jane Smith",
    timestamp: "4 hours ago",
    status: "completed",
  },
  {
    id: 3,
    action: "Certificate Verified",
    device: "DEV-003",
    operator: "Mike Johnson",
    timestamp: "6 hours ago",
    status: "completed",
  },
  {
    id: 4,
    action: "Device Added",
    device: "DEV-004",
    operator: "Sarah Connor",
    timestamp: "8 hours ago",
    status: "completed",
  },
  {
    id: 5,
    action: "Sanitization Failed",
    device: "DEV-005",
    operator: "Tom Harris",
    timestamp: "10 hours ago",
    status: "failed",
  },
];

const COLORS = {
  primary: "#0EA5E9",
  secondary: "#3B82F6",
  accent: "#60A5FA",
  muted: "#93C5FD",
};

interface MetricCard {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
}

const MetricCard = ({ icon, label, value, change, changeType }: MetricCard) => (
  <div className="bg-card border border-border rounded-xl p-6">
    <div className="flex items-start justify-between mb-4">
      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
        {icon}
      </div>
      {change && (
        <div
          className={`text-xs font-semibold px-3 py-1 rounded-full ${
            changeType === "positive"
              ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : changeType === "negative"
                ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                : "bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
          }`}
        >
          {change}
        </div>
      )}
    </div>
    <p className="text-muted-foreground text-sm mb-1">{label}</p>
    <p className="text-3xl font-bold text-card-foreground">{value}</p>
  </div>
);

export default function Dashboard() {
  return (
    <Layout>
      <div className="p-4 lg:p-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your device sanitization activities and blockchain certifications
          </p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            icon={<Cpu className="w-6 h-6" />}
            label="Total Devices"
            value="248"
            change="+12%"
            changeType="positive"
          />
          <MetricCard
            icon={<CheckCircle2 className="w-6 h-6" />}
            label="Sanitized"
            value="186"
            change="+8%"
            changeType="positive"
          />
          <MetricCard
            icon={<AlertCircle className="w-6 h-6" />}
            label="Pending"
            value="42"
            change="-5%"
            changeType="positive"
          />
          <MetricCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Certificates Issued"
            value="156"
            change="+23%"
            changeType="positive"
          />
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Bar Chart */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-card-foreground">
                Monthly Sanitizations
              </h2>
              <p className="text-sm text-muted-foreground">
                Completed vs Pending sanitizations over time
              </p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Legend wrapperStyle={{ paddingTop: "1rem" }} />
                <Bar dataKey="sanitized" fill={COLORS.primary} name="Sanitized" />
                <Bar dataKey="pending" fill={COLORS.accent} name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-card-foreground">
                Sanitization Methods
              </h2>
              <p className="text-sm text-muted-foreground">Distribution of methods used</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-sm font-medium text-muted-foreground py-3 px-4">
                    Action
                  </th>
                  <th className="text-left text-sm font-medium text-muted-foreground py-3 px-4">
                    Device
                  </th>
                  <th className="text-left text-sm font-medium text-muted-foreground py-3 px-4">
                    Operator
                  </th>
                  <th className="text-left text-sm font-medium text-muted-foreground py-3 px-4">
                    Status
                  </th>
                  <th className="text-left text-sm font-medium text-muted-foreground py-3 px-4">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((activity) => (
                  <tr
                    key={activity.id}
                    className="border-b border-border hover:bg-secondary/30 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-card-foreground font-medium">
                      {activity.action}
                    </td>
                    <td className="py-3 px-4 text-sm text-card-foreground">
                      {activity.device}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {activity.operator}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          activity.status === "completed"
                            ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {activity.status === "completed" ? "✓" : "✗"} {activity.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {activity.timestamp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
