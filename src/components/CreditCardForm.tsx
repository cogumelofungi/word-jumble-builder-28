import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// Validation schema for credit card form
const creditCardSchema = z.object({
  // Card details
  cardNumber: z.string()
    .min(16, "Número do cartão deve ter 16 dígitos")
    .max(19, "Número do cartão inválido")
    .regex(/^[\d\s]+$/, "Apenas números são permitidos"),
  cardName: z.string()
    .min(2, "Nome no cartão é obrigatório")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras"),
  expiryMonth: z.string().min(1, "Mês é obrigatório"),
  expiryYear: z.string().min(1, "Ano é obrigatório"),
  cvv: z.string()
    .min(3, "CVV deve ter 3 ou 4 dígitos")
    .max(4, "CVV deve ter 3 ou 4 dígitos")
    .regex(/^\d+$/, "CVV deve conter apenas números"),
  
  // Billing cycle
  billingCycle: z.enum(["monthly", "yearly"]),
  
  // Billing details
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  
  // Address
  zipCode: z.string().min(8, "CEP inválido").max(9, "CEP inválido"),
  address: z.string().min(5, "Endereço é obrigatório"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, "Bairro é obrigatório"),
  city: z.string().min(2, "Cidade é obrigatória"),
  state: z.string().min(2, "Estado é obrigatório"),
});

type CreditCardFormData = z.infer<typeof creditCardSchema>;

interface CreditCardFormProps {
  planName: string;
  amount: string;
  planId: string;
  billing?: string;
  monthlyPrice: number;
  onPaymentSuccess: () => void;
  onCancel: () => void;
}

const CreditCardForm = ({ planName, amount, planId, billing = 'monthly', monthlyPrice, onPaymentSuccess, onCancel }: CreditCardFormProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<CreditCardFormData>({
    resolver: zodResolver(creditCardSchema),
    defaultValues: {
      cardNumber: "",
      cardName: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
      billingCycle: billing === 'annual' ? 'yearly' : 'monthly',
      email: "",
      phone: "",
      zipCode: "",
      address: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
    },
  });

  const billingCycle = form.watch('billingCycle');
  const currentAmount = billingCycle === 'yearly' ? `R$${monthlyPrice * 10}` : `R$${monthlyPrice}`;
  const periodSuffix = billingCycle === 'yearly' ? '/ano' : '/mês';

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // Format expiry date
  const formatExpiryDate = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
  };

  const onSubmit = async (data: CreditCardFormData) => {
    if (!user) {
      toast({
        title: "Erro de Autenticação",
        description: "Você precisa estar logado para assinar um plano.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Call Stripe checkout edge function
      const { data: checkoutData, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          planId: planId,
          billingCycle: data.billingCycle
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!checkoutData?.url) {
        throw new Error("No checkout URL returned");
      }

      // Redirect to Stripe Checkout
      window.open(checkoutData.url, '_blank');
      
      toast({
        title: "Redirecionando para pagamento",
        description: "Você será redirecionado para o Stripe para completar o pagamento.",
      });

      // Close the form since payment will be handled in Stripe
      onCancel();
      
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Erro no Pagamento",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const months = Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString().padStart(2, '0');
    return { value: month, label: month };
  });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => {
    const year = (currentYear + i).toString();
    return { value: year, label: year };
  });

  const brazilianStates = [
    { value: "AC", label: "Acre" },
    { value: "AL", label: "Alagoas" },
    { value: "AP", label: "Amapá" },
    { value: "AM", label: "Amazonas" },
    { value: "BA", label: "Bahia" },
    { value: "CE", label: "Ceará" },
    { value: "DF", label: "Distrito Federal" },
    { value: "ES", label: "Espírito Santo" },
    { value: "GO", label: "Goiás" },
    { value: "MA", label: "Maranhão" },
    { value: "MT", label: "Mato Grosso" },
    { value: "MS", label: "Mato Grosso do Sul" },
    { value: "MG", label: "Minas Gerais" },
    { value: "PA", label: "Pará" },
    { value: "PB", label: "Paraíba" },
    { value: "PR", label: "Paraná" },
    { value: "PE", label: "Pernambuco" },
    { value: "PI", label: "Piauí" },
    { value: "RJ", label: "Rio de Janeiro" },
    { value: "RN", label: "Rio Grande do Norte" },
    { value: "RS", label: "Rio Grande do Sul" },
    { value: "RO", label: "Rondônia" },
    { value: "RR", label: "Roraima" },
    { value: "SC", label: "Santa Catarina" },
    { value: "SP", label: "São Paulo" },
    { value: "SE", label: "Sergipe" },
    { value: "TO", label: "Tocantins" },
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold text-foreground">
          Finalizar Assinatura
        </CardTitle>
        <CardDescription className="space-y-2">
          <div>Plano {planName} - {currentAmount}{periodSuffix}</div>
          <div className="text-xs text-muted-foreground">
            * Valores podem variar conforme o ciclo de cobrança selecionado
          </div>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Billing Cycle Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <CreditCard className="w-5 h-5" />
                Ciclo de Cobrança
              </div>
              
              <FormField
                control={form.control}
                name="billingCycle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Escolha seu ciclo de pagamento</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o ciclo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="monthly">
                          <div className="flex flex-col text-left">
                            <span>Mensal - R${monthlyPrice}</span>
                            <span className="text-xs text-muted-foreground">Cobrado mensalmente</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="yearly">
                          <div className="flex flex-col text-left">
                            <span>Anual - R${monthlyPrice * 10} (2 meses grátis)</span>
                            <span className="text-xs text-muted-foreground">Cobrado anualmente</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* Card Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <CreditCard className="w-5 h-5" />
                Dados do Cartão
              </div>
              
              <FormField
                control={form.control}
                name="cardNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número do Cartão</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="1234 5678 9012 3456"
                        {...field}
                        onChange={(e) => {
                          const formatted = formatCardNumber(e.target.value);
                          field.onChange(formatted);
                        }}
                        maxLength={19}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cardName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome no Cartão</FormLabel>
                    <FormControl>
                      <Input placeholder="João Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="expiryMonth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mês</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="MM" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {months.map((month) => (
                            <SelectItem key={month.value} value={month.value}>
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expiryYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ano</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="AAAA" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year.value} value={year.value}>
                              {year.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cvv"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CVV</FormLabel>
                      <FormControl>
                        <Input placeholder="123" {...field} maxLength={4} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Billing Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <Lock className="w-5 h-5" />
                Dados de Cobrança
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="joao@example.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="(11) 99999-9999" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <Input placeholder="00000-000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input placeholder="Rua das Flores" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input placeholder="123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="complement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complemento</FormLabel>
                      <FormControl>
                        <Input placeholder="Apto 456 (opcional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="neighborhood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input placeholder="Centro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input placeholder="São Paulo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {brazilianStates.map((state) => (
                            <SelectItem key={state.value} value={state.value}>
                              {state.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800">
                <Lock className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Seus dados estão protegidos com criptografia SSL
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isProcessing}
                className="flex-1"
              >
                Cancelar
              </Button>
              
              <Button
                type="submit"
                disabled={isProcessing}
                className="flex-1 h-12 text-lg font-semibold"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Assinar por {currentAmount}{periodSuffix}
                  </div>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CreditCardForm;