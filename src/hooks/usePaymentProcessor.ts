import { useState } from "react";

export interface PaymentData {
  amount: number;
  currency: string;
  planId: string;
  planName: string;
  paymentMethod: {
    type: 'card';
    card: {
      number: string;
      expMonth: number;
      expYear: number;
      cvc: string;
    };
    billingDetails: {
      name: string;
      email: string;
      phone: string;
      address: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
      };
    };
  };
  subscription: {
    interval: 'month' | 'year';
    intervalCount: number;
  };
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  subscriptionId?: string;
  error?: string;
}

// Mock payment processor that simulates real payment gateway behavior
export const usePaymentProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processPayment = async (paymentData: PaymentData): Promise<PaymentResult> => {
    setIsProcessing(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      // Validate card number (basic Luhn algorithm check)
      const isValidCard = validateCardNumber(paymentData.paymentMethod.card.number);
      
      // Validate expiry date
      const isValidExpiry = validateExpiryDate(
        paymentData.paymentMethod.card.expMonth,
        paymentData.paymentMethod.card.expYear
      );
      
      // Validate CVV
      const isValidCvv = validateCvv(paymentData.paymentMethod.card.cvc);
      
      // Mock different scenarios based on card number
      const cardNumber = paymentData.paymentMethod.card.number;
      
      // Test cards that always fail
      if (cardNumber.startsWith('4000000000000002')) {
        return {
          success: false,
          error: "Cartão recusado pela operadora"
        };
      }
      
      if (cardNumber.startsWith('4000000000000127')) {
        return {
          success: false,
          error: "CVV inválido"
        };
      }
      
      if (cardNumber.startsWith('4000000000000069')) {
        return {
          success: false,
          error: "Cartão expirado"
        };
      }
      
      if (cardNumber.startsWith('4000000000000119')) {
        return {
          success: false,
          error: "Erro de processamento"
        };
      }
      
      // Validate all fields
      if (!isValidCard) {
        return {
          success: false,
          error: "Número do cartão inválido"
        };
      }
      
      if (!isValidExpiry) {
        return {
          success: false,
          error: "Data de vencimento inválida"
        };
      }
      
      if (!isValidCvv) {
        return {
          success: false,
          error: "CVV inválido"
        };
      }
      
      // Validate required fields
      if (!paymentData.paymentMethod.billingDetails.email || 
          !paymentData.paymentMethod.billingDetails.name) {
        return {
          success: false,
          error: "Dados de cobrança incompletos"
        };
      }
      
      // Success case - generate mock IDs
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('Mock Payment Processed:', {
        transactionId,
        subscriptionId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        planId: paymentData.planId,
        customerEmail: paymentData.paymentMethod.billingDetails.email,
        cardLast4: paymentData.paymentMethod.card.number.slice(-4),
      });
      
      return {
        success: true,
        transactionId,
        subscriptionId
      };
      
    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        error: "Erro interno do sistema"
      };
    } finally {
      setIsProcessing(false);
    }
  };
  
  return {
    processPayment,
    isProcessing
  };
};

// Luhn algorithm for basic card validation
function validateCardNumber(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '');
  
  if (digits.length < 13 || digits.length > 19) {
    return false;
  }
  
  let sum = 0;
  let isEven = false;
  
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

// Validate expiry date
function validateExpiryDate(month: number, year: number): boolean {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  
  if (month < 1 || month > 12) {
    return false;
  }
  
  if (year < currentYear) {
    return false;
  }
  
  if (year === currentYear && month < currentMonth) {
    return false;
  }
  
  return true;
}

// Validate CVV
function validateCvv(cvv: string): boolean {
  const digits = cvv.replace(/\D/g, '');
  return digits.length >= 3 && digits.length <= 4;
}