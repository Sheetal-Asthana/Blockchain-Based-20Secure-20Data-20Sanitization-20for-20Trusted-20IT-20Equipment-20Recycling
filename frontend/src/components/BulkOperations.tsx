import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  Users,
  Trash2,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";

interface BulkOperationResult {
  success: boolean;
  assetId?: string;
  error?: string;
  data?: any;
}

interface BulkOperationSummary {
  total: number;
  successful: number;
  failed: number;
  results: BulkOperationResult[];
  duration: number;
  startTime: Date;
  endTime: Date;
}

interface BulkAssetData {
  serialNumber: string;
  model: string;
  customer?: string;
  location?: string;
}

export default function BulkOperations() {
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  const [operationProgress, setOperationProgress] = useState(0);
  const [operationResults, setOperationResults] = useState<BulkOperationSummary | null>(null);
  const [csvData, setCsvData] = useState("");
  const [bulkAssets, setBulkAssets] = useState<BulkAssetData[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [operationOptions, setOperationOptions] = useState({
    skipDuplicates: true,
    validateOnly: false,
    batchSize: 50,
    continueOnError: true
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvData(content);
      
      try {
        const assets = parseCSVData(content);
        setBulkAssets(assets);
      } catch (error) {
        console.error('Failed to parse CSV:', error);
      }
    };
    reader.readAsText(file);
  };

  const parseCSVData = (csvContent: string): BulkAssetData[] => {
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) throw new Error('CSV must have header and at least one data row');

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const serialIndex = headers.findIndex(h => h.includes('serial'));
    const modelIndex = headers.findIndex(h => h.includes('model'));
    const customerIndex = headers.findIndex(h => h.includes('customer'));
    const locationIndex = headers.findIndex(h => h.includes('location'));

    if (serialIndex === -1 || modelIndex === -1) {
      throw new Error('CSV must contain serial number and model columns');
    }

    return lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim());
      return {
        serialNumber: values[serialIndex] || `MISSING-${index}`,
        model: values[modelIndex] || 'Unknown Model',
        customer: customerIndex >= 0 ? values[customerIndex] : undefined,
        location: locationIndex >= 0 ? values[locationIndex] : undefined
      };
    });
  };

  const simulateBulkOperation = async (
    operation: string,
    data: any[],
    onProgress: (progress: number) => void
  ): Promise<BulkOperationSummary> => {
    const startTime = new Date();
    const results: BulkOperationResult[] = [];
    
    for (let i = 0; i < data.length; i++) {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Simulate success/failure (95% success rate)
      const success = Math.random() > 0.05;
      
      results.push({
        success,
        assetId: success ? `AST-${Date.now()}-${i}` : undefined,
        error: success ? undefined : 'Simulated processing error',
        data: data[i]
      });
      
      onProgress(((i + 1) / data.length) * 100);
    }
    
    const endTime = new Date();
    const successful = results.filter(r => r.success).length;
    
    return {
      total: data.length,
      successful,
      failed: data.length - successful,
      results,
      duration: endTime.getTime() - startTime.getTime(),
      startTime,
      endTime
    };
  };

  const handleBulkRegister = async () => {
    if (bulkAssets.length === 0) return;
    
    setActiveOperation('register');
    setOperationProgress(0);
    setOperationResults(null);
    
    try {
      const summary = await simulateBulkOperation(
        'register',
        bulkAssets,
        setOperationProgress
      );
      
      setOperationResults(summary);
    } catch (error) {
      console.error('Bulk registration failed:', error);
    } finally {
      setActiveOperation(null);
    }
  };

  const handleBulkSanitization = async () => {
    if (selectedAssets.length === 0) return;
    
    setActiveOperation('sanitize');
    setOperationProgress(0);
    setOperationResults(null);
    
    const sanitizationData = selectedAssets.map(assetId => ({
      assetId,
      sanitizationHash: `Qm${Math.random().toString(36).substr(2, 44)}`,
      method: 'DBAN',
      operator: 'Bulk Operation'
    }));
    
    try {
      const summary = await simulateBulkOperation(
        'sanitize',
        sanitizationData,
        setOperationProgress
      );
      
      setOperationResults(summary);
    } catch (error) {
      console.error('Bulk sanitization failed:', error);
    } finally {
      setActiveOperation(null);
    }
  };

  const handleBulkRecycle = async () => {
    if (selectedAssets.length === 0) return;
    
    setActiveOperation('recycle');
    setOperationProgress(0);
    setOperationResults(null);
    
    try {
      const summary = await simulateBulkOperation(
        'recycle',
        selectedAssets,
        setOperationProgress
      );
      
      setOperationResults(summary);
    } catch (error) {
      console.error('Bulk recycling failed:', error);
    } finally {
      setActiveOperation(null);
    }
  };

  const exportTemplate = () => {
    const template = `Serial Number,Model,Customer,Location
DEMO-001,Dell OptiPlex 7090,Acme Corp,Building A
DEMO-002,HP EliteBook 840,Tech Solutions,Floor 2
DEMO-003,Lenovo ThinkPad T14,Global Inc,Warehouse`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportResults = () => {
    if (!operationResults) return;
    
    const csvContent = [
      'Asset ID,Serial Number,Status,Error',
      ...operationResults.results.map(result => 
        `${result.assetId || 'N/A'},${result.data?.serialNumber || 'N/A'},${result.success ? 'Success' : 'Failed'},${result.error || ''}`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulk-operation-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Bulk Operations</h1>
          <p className="text-muted-foreground">
            Process multiple assets efficiently with bulk operations
          </p>
        </div>
        <Button onClick={exportTemplate} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download Template
        </Button>
      </div>

      {/* Active Operation Progress */}
      {activeOperation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 animate-spin" />
              {activeOperation === 'register' && 'Registering Assets...'}
              {activeOperation === 'sanitize' && 'Proving Sanitization...'}
              {activeOperation === 'recycle' && 'Recycling Assets...'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{operationProgress.toFixed(1)}%</span>
              </div>
              <Progress value={operationProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Operation Results */}
      {operationResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Operation Results</span>
              <Button onClick={exportResults} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Results
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{operationResults.total}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{operationResults.successful}</div>
                <div className="text-sm text-muted-foreground">Successful</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{operationResults.failed}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{(operationResults.duration / 1000).toFixed(1)}s</div>
                <div className="text-sm text-muted-foreground">Duration</div>
              </div>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {operationResults.results.slice(0, 10).map((result, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">{result.data?.serialNumber || result.assetId}</span>
                  </div>
                  <div className="text-right">
                    {result.success ? (
                      <Badge variant="default">Success</Badge>
                    ) : (
                      <Badge variant="destructive">Failed</Badge>
                    )}
                  </div>
                </div>
              ))}
              {operationResults.results.length > 10 && (
                <div className="text-center text-sm text-muted-foreground">
                  ... and {operationResults.results.length - 10} more results
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="import" className="space-y-4">
        <TabsList>
          <TabsTrigger value="import">Import & Register</TabsTrigger>
          <TabsTrigger value="sanitize">Bulk Sanitization</TabsTrigger>
          <TabsTrigger value="recycle">Bulk Recycling</TabsTrigger>
          <TabsTrigger value="export">Export Data</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import Assets from CSV</CardTitle>
              <CardDescription>
                Upload a CSV file to register multiple assets at once
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="csv-upload">CSV File</Label>
                <div className="flex gap-2">
                  <Input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="csv-data">CSV Data (or paste directly)</Label>
                <Textarea
                  id="csv-data"
                  placeholder="Serial Number,Model,Customer,Location&#10;DEMO-001,Dell OptiPlex,Acme Corp,Building A"
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  rows={6}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="skip-duplicates"
                    checked={operationOptions.skipDuplicates}
                    onCheckedChange={(checked) =>
                      setOperationOptions(prev => ({ ...prev, skipDuplicates: !!checked }))
                    }
                  />
                  <Label htmlFor="skip-duplicates">Skip duplicates</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="validate-only"
                    checked={operationOptions.validateOnly}
                    onCheckedChange={(checked) =>
                      setOperationOptions(prev => ({ ...prev, validateOnly: !!checked }))
                    }
                  />
                  <Label htmlFor="validate-only">Validate only</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="continue-on-error"
                    checked={operationOptions.continueOnError}
                    onCheckedChange={(checked) =>
                      setOperationOptions(prev => ({ ...prev, continueOnError: !!checked }))
                    }
                  />
                  <Label htmlFor="continue-on-error">Continue on error</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batch-size">Batch Size</Label>
                  <Input
                    id="batch-size"
                    type="number"
                    min="1"
                    max="500"
                    value={operationOptions.batchSize}
                    onChange={(e) =>
                      setOperationOptions(prev => ({ ...prev, batchSize: parseInt(e.target.value) || 50 }))
                    }
                  />
                </div>
              </div>

              {bulkAssets.length > 0 && (
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    Parsed {bulkAssets.length} assets from CSV data. Ready to import.
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleBulkRegister}
                disabled={bulkAssets.length === 0 || !!activeOperation}
                className="w-full"
              >
                <Users className="h-4 w-4 mr-2" />
                Register {bulkAssets.length} Assets
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sanitize" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Sanitization Proof</CardTitle>
              <CardDescription>
                Prove sanitization for multiple assets simultaneously
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="asset-ids">Asset IDs (one per line)</Label>
                <Textarea
                  id="asset-ids"
                  placeholder="AST-001&#10;AST-002&#10;AST-003"
                  rows={6}
                  onChange={(e) => {
                    const ids = e.target.value.split('\n').filter(id => id.trim());
                    setSelectedAssets(ids);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sanitization-method">Sanitization Method</Label>
                <select className="w-full p-2 border rounded">
                  <option value="dban">DBAN (DoD 5220.22-M)</option>
                  <option value="ata">ATA Secure Erase</option>
                  <option value="crypto">Cryptographic Erase</option>
                  <option value="physical">Physical Destruction</option>
                </select>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This will generate IPFS hashes for sanitization proofs and record them on the blockchain.
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleBulkSanitization}
                disabled={selectedAssets.length === 0 || !!activeOperation}
                className="w-full"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Prove Sanitization for {selectedAssets.length} Assets
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recycle" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Recycling</CardTitle>
              <CardDescription>
                Mark multiple assets as recycled and award carbon credits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recycle-asset-ids">Asset IDs to Recycle</Label>
                <Textarea
                  id="recycle-asset-ids"
                  placeholder="AST-001&#10;AST-002&#10;AST-003"
                  rows={6}
                  onChange={(e) => {
                    const ids = e.target.value.split('\n').filter(id => id.trim());
                    setSelectedAssets(ids);
                  }}
                />
              </div>

              <Alert>
                <Trash2 className="h-4 w-4" />
                <AlertDescription>
                  Each recycled asset will earn 10 carbon credits. This action is irreversible.
                </AlertDescription>
              </Alert>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Estimated Impact</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Carbon Credits: {selectedAssets.length * 10}</div>
                  <div>CO₂ Reduction: {(selectedAssets.length * 0.125).toFixed(2)} tons</div>
                </div>
              </div>

              <Button
                onClick={handleBulkRecycle}
                disabled={selectedAssets.length === 0 || !!activeOperation}
                className="w-full"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Recycle {selectedAssets.length} Assets
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export Asset Data</CardTitle>
              <CardDescription>
                Export asset data in various formats for reporting and analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <FileText className="h-6 w-6 mb-2" />
                  Export CSV
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <FileText className="h-6 w-6 mb-2" />
                  Export PDF Report
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <FileText className="h-6 w-6 mb-2" />
                  Export JSON
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Export Filters</Label>
                <div className="grid grid-cols-2 gap-4">
                  <select className="p-2 border rounded">
                    <option value="">All Statuses</option>
                    <option value="registered">Registered</option>
                    <option value="sanitized">Sanitized</option>
                    <option value="recycled">Recycled</option>
                    <option value="sold">Sold</option>
                  </select>
                  <Input type="date" placeholder="Start Date" />
                </div>
              </div>

              <Alert>
                <Download className="h-4 w-4" />
                <AlertDescription>
                  Exports include blockchain verification hashes and IPFS links for complete audit trails.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}