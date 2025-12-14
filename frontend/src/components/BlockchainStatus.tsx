/**
 * Blockchain Status Component
 * Shows current blockchain connection status
 */

import { useBlockchain } from '../hooks/useBlockchain';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export function BlockchainStatus() {
  const { status, loading, error, isAvailable, checkStatus } = useBlockchain();

  const getStatusColor = () => {
    if (loading) return 'secondary';
    if (error || !isAvailable) return 'destructive';
    return 'default';
  };

  const getStatusIcon = () => {
    if (loading) return <RefreshCw className="h-4 w-4 animate-spin" />;
    if (error || !isAvailable) return <XCircle className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (loading) return 'Checking...';
    if (error) return 'Error';
    if (!isAvailable) return 'Unavailable';
    return 'Connected';
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Blockchain Status</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={checkStatus}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-3">
          <Badge variant={getStatusColor()} className="flex items-center space-x-1">
            {getStatusIcon()}
            <span>{getStatusText()}</span>
          </Badge>
        </div>

        {error && (
          <div className="flex items-center space-x-2 text-sm text-destructive mb-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {status && (
          <div className="space-y-2 text-sm">
            {status.network && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network:</span>
                <span className="font-medium">{status.network.name}</span>
              </div>
            )}
            
            {status.network && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Chain ID:</span>
                <span className="font-medium">{status.network.chainId}</span>
              </div>
            )}
            
            {status.contractAddress && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contract:</span>
                <span className="font-mono text-xs">
                  {status.contractAddress.slice(0, 6)}...{status.contractAddress.slice(-4)}
                </span>
              </div>
            )}
          </div>
        )}

        {!isAvailable && !loading && (
          <p className="text-xs text-muted-foreground mt-2">
            Blockchain features are currently unavailable. Check your configuration.
          </p>
        )}
      </CardContent>
    </Card>
  );
}