import { Crown, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface PremiumOverlayProps {
  isBlocked: boolean;
  title: string;
  description?: string;
  requiredPlan: string;
  className?: string;
  children: React.ReactNode;
  variant?: "overlay" | "badge" | "disabled";
}

export const PremiumOverlay = ({
  isBlocked,
  title,
  description,
  requiredPlan,
  className,
  children,
  variant = "overlay"
}: PremiumOverlayProps) => {
  if (!isBlocked) {
    return <>{children}</>;
  }

  if (variant === "badge") {
    return (
      <div className={cn("relative", className)}>
        {children}
        <div className="absolute -top-2 -right-2 z-10">
          <div className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Crown className="w-3 h-3" />
            {requiredPlan}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "disabled") {
    return (
      <div className={cn("relative", className)}>
        <div className="opacity-40 pointer-events-none">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-lg">
          <div className="bg-black/80 rounded-lg px-3 py-2 text-center border border-orange-500/30">
            <Crown className="w-5 h-5 text-orange-400 mx-auto mb-1" />
            <p className="text-white text-xs font-medium">{requiredPlan}</p>
          </div>
        </div>
      </div>
    );
  }

  // Default overlay variant
  return (
    <div className={cn("relative", className)}>
      {children}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] rounded-lg z-20 flex items-center justify-center">
        <div className="bg-black/80 rounded-xl p-4 mx-4 text-center border border-orange-500/30">
          <Crown className="w-8 h-8 text-orange-400 mx-auto mb-2" />
          <h3 className="text-white font-semibold text-sm mb-1">{title}</h3>
          {description && (
            <p className="text-white/70 text-xs mb-3">{description}</p>
          )}
          <div className="bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full text-xs font-medium">
            {requiredPlan}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumOverlay;