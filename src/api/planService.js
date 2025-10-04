// Mock data structured for future Supabase integration
const mockPlans = [
  {
    id: "032abf21-7e33-4f8f-95fd-ef5663657b77",
    name: "Essencial",
    price_monthly: 19.00,
    price_yearly: 190.00,
    currency: "BRL",
    description: "Ideal para iniciantes",
    app_limit: 3,
    features: [
      "Personalização do app",
      "Suporte por email"
    ],
    premium_templates_access: false,
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: "7f0d0db4-e737-49be-ab41-f2003f908f9e", 
    name: "Profissional",
    price_monthly: 49.00,
    price_yearly: 490.00,
    currency: "BRL",
    description: "Mais flexibilidade",
    app_limit: 5,
    features: [
      "Personalização do app",
      "Suporte por email",
      "Importação de apps existentes",
      "Análises e estatísticas"
    ],
    premium_templates_access: true,
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: "d5d63472-a5a6-4fec-a4e0-1abb12fe9cb7",
    name: "Empresarial", 
    price_monthly: 99.00,
    price_yearly: 990.00,
    currency: "BRL",
    description: "Uso corporativo e avançado",
    app_limit: 10,
    features: [
      "Personalização do app",
      "Suporte por email",
      "Importação de apps existentes", 
      "Análises e estatísticas",
      "Acesso multi-dispositivo",
      "Backup automático"
    ],
    premium_templates_access: true,
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  }
];

let mockSubscriptions = [];
let mockPayments = [];

export const getPlans = async () => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return { data: mockPlans, error: null };
};

export const getPlanById = async (planId) => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const plan = mockPlans.find(p => p.id === planId);
  return plan ? { data: plan, error: null } : { data: null, error: { message: "Plano não encontrado" } };
};

export const subscribeToPlan = async (planId, userId, paymentData) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const plan = mockPlans.find(p => p.id === planId);
  if (!plan) {
    return { data: null, error: { message: "Plano não encontrado" } };
  }
  
  // Mock payment processing
  const paymentResult = await processPaymentMock(paymentData, plan);
  if (!paymentResult.success) {
    return { data: null, error: { message: paymentResult.error } };
  }
  
  const subscription = {
    id: generateUUID(),
    user_id: userId,
    plan_id: planId,
    status: "active",
    billing_cycle: paymentData.billing_cycle || "monthly",
    current_period_start: new Date().toISOString(),
    current_period_end: calculatePeriodEnd(paymentData.billing_cycle),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  mockSubscriptions.push(subscription);
  return { data: { subscription, plan }, error: null };
};

export const getUserSubscription = async (userId) => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const subscription = mockSubscriptions.find(s => s.user_id === userId && s.status === "active");
  if (!subscription) return { data: null, error: null };
  const plan = mockPlans.find(p => p.id === subscription.plan_id);
  return { data: { ...subscription, plan }, error: null };
};

const processPaymentMock = async (paymentData, plan) => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  const cardNumber = paymentData.paymentMethod.card.number;
  
  if (cardNumber.startsWith('4000000000000002')) {
    return { success: false, error: "Cartão recusado pela operadora" };
  }
  
  return {
    success: true,
    payment_id: `pay_${generateMockId()}`,
    subscription_id: `sub_${generateMockId()}`
  };
};

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const generateMockId = () => Math.random().toString(36).substr(2, 9);

const calculatePeriodEnd = (billingCycle) => {
  const now = new Date();
  if (billingCycle === "yearly") {
    now.setFullYear(now.getFullYear() + 1);
  } else {
    now.setMonth(now.getMonth() + 1);
  }
  return now.toISOString();
};