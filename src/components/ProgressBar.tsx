import { Check } from "lucide-react";
import { useAppBuilder } from "@/hooks/useAppBuilder";
import { useLanguage } from "@/hooks/useLanguage";

interface ProgressStep {
  id: number;
  title: string;
  completed: boolean;
  active: boolean;
}

interface ProgressBarProps {
  appBuilder: ReturnType<typeof useAppBuilder>;
}

const ProgressBar = ({ appBuilder }: ProgressBarProps) => {
  const { t } = useLanguage();
  const { appData } = appBuilder;

  // Calcular progresso baseado no estado do app
  const hasUploads = !!(appData.mainProduct?.url || appData.bonus1?.url || appData.bonus2?.url || appData.bonus3?.url || appData.bonus4?.url);
  
  // Verificar se houve personalização (alterações nos campos padrão)
  const hasCustomization = !!(
    (appData.appName && appData.appName !== 'Meu App') ||
    (appData.appDescription && appData.appDescription !== 'Descrição do App') ||
    (appData.appColor && appData.appColor !== '#4783F6') ||
    appData.customLink ||
    appData.appIcon?.url ||
    appData.appCover?.url
  );
  
  const steps: ProgressStep[] = [
    { 
      id: 1, 
      title: t("progress.upload"), 
      completed: hasUploads, 
      active: !hasUploads 
    },
    { 
      id: 2, 
      title: t("progress.customization"), 
      completed: hasUploads && hasCustomization, 
      active: hasUploads && !hasCustomization 
    },
    { 
      id: 3, 
      title: t("progress.publish"), 
      completed: false, 
      active: hasUploads && hasCustomization 
    },
  ];

  return (
    <div className="bg-app-bg border-b border-app-border py-4">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-center max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              {/* Step Circle and Label */}
              <div className="flex flex-col items-center sm:flex-row sm:items-center">
                <div className={`progress-step ${step.completed ? 'completed' : step.active ? 'active' : ''}`}>
                  <div className="step-circle">
                    {step.completed ? (
                      <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                    ) : (
                      <span className="text-xs sm:text-sm">{step.id}</span>
                    )}
                  </div>
                </div>
                <span className={`mt-2 sm:mt-0 sm:ml-3 text-xs sm:text-sm font-medium text-center sm:text-left whitespace-nowrap ${
                  step.active ? 'text-primary' : 
                  step.completed ? 'text-foreground' : 'text-app-muted'
                }`}>
                  {step.title}
                </span>
              </div>

              {/* Connector Line - Centered with circles */}
              {index < steps.length - 1 && (
                <div className="flex items-center mx-2 sm:mx-4">
                  <div className={`w-8 sm:w-12 md:w-16 lg:w-20 h-px transition-all duration-500 ${
                    steps[index + 1].completed || steps[index + 1].active 
                      ? 'bg-gradient-neon' 
                      : 'bg-app-border'
                  }`} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;