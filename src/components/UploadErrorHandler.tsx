import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UploadErrorHandlerProps {
  error: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

export const UploadErrorHandler = ({ error, onRetry, isRetrying = false }: UploadErrorHandlerProps) => {
  const showRetryButton = error.includes('Tentar novamente') || 
                          error.includes('servidor') || 
                          error.includes('Falha no envio');

  return (
    <Alert variant="destructive" className="my-2">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{error}</span>
        {showRetryButton && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            disabled={isRetrying}
            className="ml-2 border-destructive text-destructive hover:bg-destructive hover:text-white"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                Tentando...
              </>
            ) : (
              <>
                <RefreshCw className="w-3 h-3 mr-1" />
                Tentar novamente
              </>
            )}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};