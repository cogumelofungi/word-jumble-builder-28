import { AlertTriangle } from "lucide-react";

interface DeactivatedAppProps {
  appName?: string;
  appColor?: string;
}

const DeactivatedApp = ({ appName = "App", appColor = "#4783F6" }: DeactivatedAppProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      {/* Tarja superior minimalista */}
      <div className="fixed top-0 left-0 right-0 bg-amber-500/90 backdrop-blur-sm text-white py-3 px-4 text-center font-medium z-50">
        <div className="flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm">Este aplicativo foi temporariamente desativado - Entre em contato com o suporte do seu app</span>
        </div>
      </div>

      <div className="max-w-md w-full mt-16 text-center">
        <div 
          className="mx-auto mb-6 w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
          style={{ backgroundColor: `${appColor}20` }}
        >
          <AlertTriangle 
            className="w-10 h-10" 
            style={{ color: appColor }}
          />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          App Temporariamente Indisponível
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          O aplicativo "{appName}" está temporariamente desativado.
        </p>
        
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Entre em contato com o suporte para mais informações.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeactivatedApp;