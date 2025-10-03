import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Copy, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PixPaymentProps {
  planName: string;
  amount: string;
  onPaymentConfirmed: () => void;
  onCancel: () => void;
}

const PixPayment = ({ planName, amount, onPaymentConfirmed, onCancel }: PixPaymentProps) => {
  const [pixCode, setPixCode] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "confirmed">("pending");
  const [timeRemaining, setTimeRemaining] = useState(15 * 60); // 15 minutos
  const { toast } = useToast();

  useEffect(() => {
    // Gerar código PIX simulado
    const simulatedPixCode = `00020126360014BR.GOV.BCB.PIX0114+5511999999999520400005303986540${amount.replace('R$', '')}5802BR5925MigraBook6009SAO PAULO62070503***6304`;
    setPixCode(simulatedPixCode);

    // Gerar QR Code usando API pública
    const qrCodeData = encodeURIComponent(simulatedPixCode);
    setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrCodeData}`);

    // Timer para expiração
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Simular confirmação de pagamento após 30 segundos (para demonstração)
    const paymentTimer = setTimeout(() => {
      setPaymentStatus("confirmed");
      toast({
        title: "Pagamento Confirmado!",
        description: `Pagamento do plano ${planName} foi aprovado.`,
      });
    }, 30000);

    return () => {
      clearInterval(timer);
      clearTimeout(paymentTimer);
    };
  }, [amount, planName, toast]);

  const copyPixCode = () => {
    navigator.clipboard.writeText(pixCode);
    toast({
      title: "Código PIX copiado!",
      description: "Cole o código no seu app bancário para efetuar o pagamento.",
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (paymentStatus === "confirmed") {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-800">
            Pagamento Confirmado!
          </CardTitle>
          <CardDescription className="text-green-700">
            Seu plano {planName} foi ativado com sucesso.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button 
            onClick={onPaymentConfirmed}
            className="w-full h-12 text-lg font-semibold bg-green-600 hover:bg-green-700"
          >
            Acessar o App
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (timeRemaining === 0) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-red-800">
            PIX Expirado
          </CardTitle>
          <CardDescription className="text-red-700">
            O código PIX expirou. Tente novamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={onCancel} variant="outline" className="w-full">
            Voltar aos Planos
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-foreground">
          Pagamento PIX
        </CardTitle>
        <CardDescription>
          Plano {planName} - {amount}
        </CardDescription>
        <div className="flex items-center justify-center mt-4 p-3 bg-orange-100 rounded-lg">
          <Clock className="w-5 h-5 text-orange-600 mr-2" />
          <span className="text-orange-800 font-semibold">
            Tempo restante: {formatTime(timeRemaining)}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* QR Code */}
        <div className="text-center">
          <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
            {qrCodeUrl ? (
              <img 
                src={qrCodeUrl} 
                alt="QR Code PIX" 
                className="w-48 h-48 mx-auto"
              />
            ) : (
              <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">
                <QrCode className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Escaneie o QR Code com seu app bancário
          </p>
        </div>

        {/* Código PIX */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Ou copie o código PIX:
          </label>
          <div className="flex gap-2">
            <div className="flex-1 p-3 bg-gray-50 border rounded-lg">
              <code className="text-xs text-gray-700 break-all">
                {pixCode}
              </code>
            </div>
            <Button 
              onClick={copyPixCode}
              variant="outline"
              size="icon"
              className="shrink-0"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Instruções */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Como pagar:</h4>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Abra seu app bancário</li>
            <li>2. Escaneie o QR Code ou cole o código PIX</li>
            <li>3. Confirme o pagamento de {amount}</li>
            <li>4. Aguarde a confirmação (até 30 segundos)</li>
          </ol>
        </div>

        {/* Botões */}
        <div className="flex gap-4">
          <Button 
            onClick={onCancel}
            variant="outline"
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button 
            onClick={() => {
              setPaymentStatus("confirmed");
              toast({
                title: "Pagamento simulado!",
                description: "Para demonstração, o pagamento foi confirmado automaticamente.",
              });
            }}
            className="flex-1"
          >
            Simular Pagamento
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PixPayment;