import crypto from 'crypto';

export interface TripayPaymentChannel {
  code: string;
  name: string;
  icon: string;
  active: boolean;
  fee: {
    flat: number;
    percent: string;
  };
  total_fee: {
    flat: number;
    percent: string;
  };
  instructions: {
    title: string;
    steps: string[];
  }[];
}

export interface TripayTransactionRequest {
  method: string;
  merchant_ref: string;
  amount: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  order_items: Array<{
    sku: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  callback_url: string;
  return_url: string;
  expired_time: number;
  signature: string;
}

export interface TripayTransactionResponse {
  success: boolean;
  message: string;
  data: {
    reference: string;
    merchant_ref: string;
    payment_method: string;
    payment_name: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    callback_url: string;
    return_url: string;
    amount: number;
    fee_merchant: number;
    fee_customer: number;
    total_fee: number;
    amount_received: number;
    pay_code: number;
    pay_url: string;
    checkout_url: string;
    status: string;
    note: string;
    created_at: number;
    expired_at: number;
  };
}

export class TripayService {
  private apiKey: string;
  private privateKey: string;
  private merchantCode: string;
  private isProduction: boolean;

  constructor(apiKey: string, privateKey: string, merchantCode: string, isProduction = false) {
    this.apiKey = apiKey;
    this.privateKey = privateKey;
    this.merchantCode = merchantCode;
    this.isProduction = isProduction;
  }

  private getBaseUrl(): string {
    return this.isProduction ? 'https://tripay.co.id' : 'https://tripay.co.id/api-sandbox';
  }

  private generateSignature(data: TripayTransactionRequest): string {
    const rawSignature = `${this.merchantCode}${data.merchant_ref}${data.amount}`;
    return crypto.createHmac('sha256', this.privateKey).update(rawSignature).digest('hex');
  }

  async getPaymentChannels(): Promise<TripayPaymentChannel[]> {
    try {
      const response = await fetch(`${this.getBaseUrl()}/api/payment-channel`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      const result = await response.json();
      return result.success ? result.data : [];
    } catch (error) {
      console.error('Error fetching payment channels:', error);
      return [];
    }
  }

  async createTransaction(data: Omit<TripayTransactionRequest, 'signature'>): Promise<TripayTransactionResponse> {
    try {
      const transactionData = {
        ...data,
        signature: this.generateSignature(data as TripayTransactionRequest),
      };

      const response = await fetch(`${this.getBaseUrl()}/api/transaction/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  async getTransactionDetail(reference: string): Promise<any> {
    try {
      const response = await fetch(`${this.getBaseUrl()}/api/transaction/detail?reference=${reference}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching transaction detail:', error);
      throw error;
    }
  }

  validateCallbackSignature(data: any, signature: string): boolean {
    const rawSignature = `${data.tripay_ref}${data.merchant_ref}${data.status}`;
    const expectedSignature = crypto.createHmac('sha256', this.privateKey).update(rawSignature).digest('hex');
    return signature === expectedSignature;
  }
}

export function createTripayService(paymentSettings: any): TripayService | null {
  if (!paymentSettings.tripayEnabled || !paymentSettings.tripayApiKey || !paymentSettings.tripayPrivateKey || !paymentSettings.tripayMerchantCode) {
    return null;
  }

  return new TripayService(
    paymentSettings.tripayApiKey,
    paymentSettings.tripayPrivateKey,
    paymentSettings.tripayMerchantCode,
    paymentSettings.tripayMode === 'PRODUCTION'
  );
}