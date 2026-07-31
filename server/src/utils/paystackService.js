import axios from 'axios';

/**
 * Paystack Service - Handle all Paystack transactions
 * Uses TEST keys by default (configurable via PAYSTACK_SECRET_KEY env var)
 * Switching to LIVE keys later only requires changing env var
 */

const PAYSTACK_BASE_URL = 'https://api.paystack.co';
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

if (!PAYSTACK_SECRET_KEY) {
  throw new Error('PAYSTACK_SECRET_KEY environment variable is required');
}

// Create axios instance with default headers
const paystackClient = axios.create({
  baseURL: PAYSTACK_BASE_URL,
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
});

/**
 * Initialize a Paystack transaction
 * @param {number} amount - Amount in kobo (NGN amount * 100)
 * @param {string} email - Customer email
 * @param {string} reference - Unique transaction reference
 * @param {object} metadata - Additional data (e.g., enrollment_id, course_id)
 * @returns {object} - Authorization URL and transaction data
 */
export async function initializeTransaction({
  amount,
  email,
  reference,
  metadata = {},
}) {
  try {
    if (!amount || !email || !reference) {
      throw new Error('amount, email, and reference are required');
    }

    // Amount must be in kobo (1 NGN = 100 kobo)
    if (amount < 100) {
      throw new Error('Amount must be at least 1 NGN (100 kobo)');
    }

    console.log(`📤 Initializing Paystack transaction: ${reference} (${email})`);

    // Build callback URL for Paystack to redirect to after payment
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const callbackUrl = `${clientUrl}/payment-callback?reference=${reference}`;

    const response = await paystackClient.post('/transaction/initialize', {
      amount,
      email,
      reference,
      metadata,
      callback_url: callbackUrl, // ✅ CRITICAL: Tell Paystack where to redirect after payment
    });

    if (!response.data.status) {
      console.error('❌ Paystack initialization failed:', response.data);
      throw new Error('Failed to initialize payment');
    }

    console.log(`✅ Transaction initialized: ${reference}`);

    return {
      success: true,
      authorization_url: response.data.data.authorization_url,
      access_code: response.data.data.access_code,
      reference: response.data.data.reference,
      amount: response.data.data.amount,
    };
  } catch (error) {
    console.error('🔴 Paystack initialization error:', error.message);
    throw new Error(error.response?.data?.message || error.message || 'Payment initialization failed');
  }
}

/**
 * Verify a Paystack transaction
 * CRITICAL: This is server-side verification against Paystack API
 * Never trust client-side success messages - always verify on server
 * @param {string} reference - Transaction reference
 * @returns {object} - Verification result with transaction details
 */
export async function verifyTransaction(reference) {
  try {
    if (!reference) {
      throw new Error('reference is required');
    }

    console.log(`🔍 Verifying Paystack transaction: ${reference}`);

    const response = await paystackClient.get(`/transaction/verify/${reference}`);

    if (!response.data.status) {
      console.error('❌ Transaction verification failed:', response.data);
      return {
        success: false,
        status: 'failed',
        message: 'Transaction verification failed',
      };
    }

    const transaction = response.data.data;

    // Check if payment was successful
    const isSuccessful = transaction.status === 'success';

    if (isSuccessful) {
      console.log(`✅ Transaction verified successfully: ${reference}`);
      console.log(`   Amount: ₦${transaction.amount / 100}`);
      console.log(`   Email: ${transaction.customer.email}`);
      console.log(`   Authorization: ${transaction.authorization.authorization_code}`);
    } else {
      console.warn(`⚠️  Transaction not successful: ${reference} - Status: ${transaction.status}`);
    }

    return {
      success: isSuccessful,
      reference: transaction.reference,
      amount: transaction.amount / 100, // Convert from kobo to NGN
      status: transaction.status,
      customer_email: transaction.customer.email,
      paid_at: transaction.paid_at,
      authorization: transaction.authorization,
      message: isSuccessful ? 'Payment successful' : `Payment ${transaction.status}`,
    };
  } catch (error) {
    console.error('🔴 Paystack verification error:', error.message);
    throw new Error(error.response?.data?.message || error.message || 'Payment verification failed');
  }
}

/**
 * Get transaction details from Paystack
 * Useful for checking transaction status without using verify endpoint
 * @param {string} reference - Transaction reference
 * @returns {object} - Transaction details
 */
export async function getTransactionDetails(reference) {
  try {
    if (!reference) {
      throw new Error('reference is required');
    }

    const response = await paystackClient.get(`/transaction/${reference}`);

    if (!response.data.status) {
      throw new Error('Failed to fetch transaction details');
    }

    return response.data.data;
  } catch (error) {
    console.error('🔴 Paystack transaction details error:', error.message);
    throw new Error(error.message);
  }
}

/**
 * Charge authorization - for recurring payments (future feature)
 * Store customer's authorization code and charge it again
 * @param {string} authorizationCode - Stored authorization code
 * @param {string} email - Customer email
 * @param {number} amount - Amount in kobo
 * @returns {object} - Charge result
 */
export async function chargeAuthorization({
  authorizationCode,
  email,
  amount,
}) {
  try {
    if (!authorizationCode || !email || !amount) {
      throw new Error('authorizationCode, email, and amount are required');
    }

    console.log(`📤 Charging authorization: ${email}`);

    const response = await paystackClient.post('/transaction/charge_authorization', {
      authorization_code: authorizationCode,
      email,
      amount,
    });

    if (!response.data.status) {
      throw new Error('Failed to charge authorization');
    }

    return response.data.data;
  } catch (error) {
    console.error('🔴 Paystack charge authorization error:', error.message);
    throw new Error(error.message);
  }
}

export default {
  initializeTransaction,
  verifyTransaction,
  getTransactionDetails,
  chargeAuthorization,
};
