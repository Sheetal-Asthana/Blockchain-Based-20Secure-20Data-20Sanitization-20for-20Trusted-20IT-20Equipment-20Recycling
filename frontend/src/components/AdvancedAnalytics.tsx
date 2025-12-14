import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Leaf, 
  Shield, 
  Clock, 
  Users, 
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Activity
} from "lucide-react";

interface AnalyticsDashboard {
  totalAssetsProcessed: number;
  carbonCreditsEarned: number;
  complianceRate: number;
  monthlyTrends: TrendData[];
  topDeviceTypes: DeviceStats[];
  sanitizationMethods: MethodStats[];
  performanceMetrics: PerformanceMetrics;
  environmentalImpact: EnvironmentalImpact;
}

interface TrendData {
  month: string;
  assetsProcessed: number;
  carbonCredits: number;
  revenue: number;
  complianceRate: number;
}

interface DeviceStats {
  deviceType: string;
  count: number;
  percentage: number;
  avgProcessingTime: number;
  carbonCreditsPerDevice: number;
}

interface MethodStats {
  method: string;
  count: number;
  successRate: number;
  avgTime: number;
  standard: string;
}

interface PerformanceMetrics {
  avgProcessingTime: number;
  throughputPerDay: number;
  errorRate: number;
  customerSatisfaction: number;
  operatorEfficiency: number;
}

interface EnvironmentalImpact {
  totalCarbonCredits: number;
  co2Equivalent: number;
  materialsRecycled: number;
  energySaved: number;
  wasteReduced: number;
}

interface RealTimeMetrics {
  activeProcesses: number;
  queueLength: number;
  avgProcessingTime: number;
  systemLoad: number;
  errorRate: number;
}

export default function AdvancedAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsDashboard | null>(null);
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    loadAnalytics();
    loadRealTimeMetrics();
    
    // Set up real-time updates
    const interval = setInterval(loadRealTimeMetrics, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [selectedPeriod]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Mock API call - replace with actual API
      const mockAnalytics: AnalyticsDashboard = {
        totalAssetsProcessed: 1247,
        carbonCreditsEarned: 12470,
        complianceRate: 98.5,
        monthlyTrends: generateMockTrends(),
        topDeviceTypes: generateMockDeviceStats(),
        sanitizationMethods: generateMockMethodStats(),
        performanceMetrics: {
          avgProcessingTime: 67.5,
          throughputPerDay: 45.2,
          errorRate: 0.8,
          customerSatisfaction: 96.3,
          operatorEfficiency: 94.7
        },
        environmentalImpact: {
          totalCarbonCredits: 12470,
          co2Equivalent: 156.8,
          materialsRecycled: 89.2,
          energySaved: 234.5,
          wasteReduced: 78.9
        }
      };
      
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRealTimeMetrics = async () => {
    try {
      // Mock real-time data
      const mockRealTime: RealTimeMetrics = {
        activeProcesses: Math.floor(Math.random() * 10) + 1,
        queueLength: Math.floor(Math.random() * 25),
        avgProcessingTime: 45 + Math.random() * 30,
        systemLoad: 60 + Math.random() * 30,
        errorRate: Math.random() * 2
      };
      
      setRealTimeMetrics(mockRealTime);
    } catch (error) {
      console.error('Failed to load real-time metrics:', error);
    }
  };

  const exportReport = async (format: 'csv' | 'pdf' | 'json') => {
    try {
      console.log(`Exporting analytics report as ${format}`);
      // Mock export - in production, call API
      const blob = new Blob([JSON.stringify(analytics, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Advanced Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your IT asset recycling operations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => loadAnalytics()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => exportReport('json')}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Real-time Metrics */}
      {realTimeMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Real-time Operations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{realTimeMetrics.activeProcesses}</div>
                <div className="text-sm text-muted-foreground">Active Processes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{realTimeMetrics.queueLength}</div>
                <div className="text-sm text-muted-foreground">Queue Length</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{realTimeMetrics.avgProcessingTime.toFixed(1)}m</div>
                <div className="text-sm text-muted-foreground">Avg Processing Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{realTimeMetrics.systemLoad.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">System Load</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{realTimeMetrics.errorRate.toFixed(2)}%</div>
                <div className="text-sm text-muted-foreground">Error Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Assets Processed</p>
                <p className="text-2xl font-bold">{analytics.totalAssetsProcessed.toLocaleString()}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500">+12.5% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Carbon Credits Earned</p>
                <p className="text-2xl font-bold">{analytics.carbonCreditsEarned.toLocaleString()}</p>
              </div>
              <Leaf className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500">+8.3% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Compliance Rate</p>
                <p className="text-2xl font-bold">{analytics.complianceRate}%</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2">
              <Progress value={analytics.complianceRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Processing Time</p>
                <p className="text-2xl font-bold">{analytics.performanceMetrics.avgProcessingTime}m</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500">-5.2% improvement</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="devices">Device Types</TabsTrigger>
          <TabsTrigger value="methods">Sanitization Methods</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="environmental">Environmental Impact</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Processing Trends</CardTitle>
              <CardDescription>Monthly asset processing and carbon credits over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={analytics.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="assetsProcessed"
                    stackId="1"
                    stroke="#8884d8"
                    fill="#8884d8"
                    name="Assets Processed"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="complianceRate"
                    stroke="#ff7300"
                    name="Compliance Rate (%)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Device Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.topDeviceTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ deviceType, percentage }) => `${deviceType} (${percentage}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analytics.topDeviceTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Processing Time by Device Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.topDeviceTypes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="deviceType" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avgProcessingTime" fill="#8884d8" name="Avg Time (min)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Device Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topDeviceTypes.map((device, index) => (
                  <div key={device.deviceType} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-4 h-4 rounded`} style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <div>
                        <p className="font-medium">{device.deviceType}</p>
                        <p className="text-sm text-muted-foreground">{device.count} devices processed</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{device.avgProcessingTime} min avg</p>
                      <p className="text-sm text-muted-foreground">{device.carbonCreditsPerDevice} credits each</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="methods" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sanitization Methods Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics.sanitizationMethods}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="method" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="count" fill="#8884d8" name="Usage Count" />
                  <Bar yAxisId="right" dataKey="successRate" fill="#82ca9d" name="Success Rate (%)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analytics.sanitizationMethods.map((method) => (
              <Card key={method.method}>
                <CardHeader>
                  <CardTitle className="text-lg">{method.method}</CardTitle>
                  <CardDescription>Standard: {method.standard}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Usage Count:</span>
                      <Badge variant="secondary">{method.count}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Success Rate:</span>
                      <Badge variant={method.successRate > 99 ? "default" : "secondary"}>
                        {method.successRate}%
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Time:</span>
                      <span>{method.avgTime} minutes</span>
                    </div>
                    <Progress value={method.successRate} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Throughput</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {analytics.performanceMetrics.throughputPerDay}
                  </div>
                  <div className="text-sm text-muted-foreground">Assets per day</div>
                  <Progress value={analytics.performanceMetrics.throughputPerDay} className="mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">
                    {analytics.performanceMetrics.errorRate}%
                  </div>
                  <div className="text-sm text-muted-foreground">Processing errors</div>
                  <Progress value={100 - analytics.performanceMetrics.errorRate} className="mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Satisfaction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {analytics.performanceMetrics.customerSatisfaction}%
                  </div>
                  <div className="text-sm text-muted-foreground">Satisfaction score</div>
                  <Progress value={analytics.performanceMetrics.customerSatisfaction} className="mt-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="environmental" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-green-500" />
                  CO₂ Reduction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {analytics.environmentalImpact.co2Equivalent}
                  </div>
                  <div className="text-sm text-muted-foreground">Tons CO₂ equivalent</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Materials Recycled</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {analytics.environmentalImpact.materialsRecycled}
                  </div>
                  <div className="text-sm text-muted-foreground">Tons of materials</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Energy Saved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {analytics.environmentalImpact.energySaved}
                  </div>
                  <div className="text-sm text-muted-foreground">MWh saved</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Environmental Impact Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {analytics.environmentalImpact.totalCarbonCredits}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Carbon Credits</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {analytics.environmentalImpact.wasteReduced}
                  </div>
                  <div className="text-sm text-muted-foreground">Waste Reduced (tons)</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {((analytics.environmentalImpact.co2Equivalent / analytics.totalAssetsProcessed) * 1000).toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">kg CO₂ per asset</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {((analytics.environmentalImpact.energySaved / analytics.totalAssetsProcessed) * 1000).toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">kWh saved per asset</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper functions for mock data
function generateMockTrends(): TrendData[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map(month => ({
    month,
    assetsProcessed: Math.floor(Math.random() * 150) + 50,
    carbonCredits: Math.floor(Math.random() * 1500) + 500,
    revenue: Math.floor(Math.random() * 50000) + 20000,
    complianceRate: 95 + Math.random() * 5
  }));
}

function generateMockDeviceStats(): DeviceStats[] {
  return [
    { deviceType: 'Laptops', count: 456, percentage: 36.6, avgProcessingTime: 45, carbonCreditsPerDevice: 8 },
    { deviceType: 'Desktops', count: 312, percentage: 25.0, avgProcessingTime: 60, carbonCreditsPerDevice: 12 },
    { deviceType: 'Servers', count: 189, percentage: 15.2, avgProcessingTime: 120, carbonCreditsPerDevice: 25 },
    { deviceType: 'Mobile Devices', count: 234, percentage: 18.8, avgProcessingTime: 30, carbonCreditsPerDevice: 5 },
    { deviceType: 'Storage Devices', count: 56, percentage: 4.4, avgProcessingTime: 90, carbonCreditsPerDevice: 15 }
  ];
}

function generateMockMethodStats(): MethodStats[] {
  return [
    { method: 'DBAN (DoD 5220.22-M)', count: 678, successRate: 99.2, avgTime: 180, standard: 'DoD 5220.22-M' },
    { method: 'ATA Secure Erase', count: 345, successRate: 98.8, avgTime: 45, standard: 'ATA-8' },
    { method: 'Cryptographic Erase', count: 156, successRate: 99.8, avgTime: 5, standard: 'NIST SP 800-88' },
    { method: 'Physical Destruction', count: 68, successRate: 100, avgTime: 15, standard: 'NSA/CSS 9-12' }
  ];
}