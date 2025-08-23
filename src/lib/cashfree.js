import api, { endpoints } from "./axios";

// Cashfree configuration matching React Native app
const CASHFREE_CONFIG = {
  clientId: process.env.CASHFREE_CLIENT_ID,
  clientSecret: process.env.CASHFREE_CLIENT_SECRET,
  environment: "SANDBOX", // Change to 'PRODUCTION' for live
};

/**
 * Create payment order using the same API as React Native app
 * @param {Object} orderData - Order information
 * @returns {Promise<Object>} Payment session data
 */
export async function createPaymentSession(orderData) {
  try {
    const response = await api.post(
      endpoints.createOrder,
      {
        customer_id: orderData.customer_id,
        customer_name: orderData.customer_name,
        customer_email: orderData.customer_email,
        customer_phone: orderData.customer_phone || "N/A",
        order_amount: orderData.amount,
      },
      {
        headers: {
          "x-client-id": CASHFREE_CONFIG.clientId,
          "x-client-secret": CASHFREE_CONFIG.clientSecret,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error creating payment session:", error);
    throw new Error(
      error.response?.data?.message || "Failed to create payment order"
    );
  }
}

/**
 * Initialize Cashfree Web SDK and handle payment
 * @param {string} sessionId - Payment session ID
 * @param {Object} options - Payment options
 * @returns {Promise<Object>} Payment result
 */
export async function initiatePayment(sessionId, options = {}) {
  try {
    // Load Cashfree SDK dynamically
    const { load } = await import("@cashfreepayments/cashfree-js");

    const cashfree = await load({
      mode: CASHFREE_CONFIG.environment.toLowerCase(),
    });

    const checkoutOptions = {
      paymentSessionId: sessionId,
      redirectTarget: "_self",
    };

    // Handle the checkout
    const result = await cashfree.checkout(checkoutOptions);

    if (result.error) {
      if (options.onFailure) {
        options.onFailure(result.error);
      }
      throw new Error(result.error.message || "Payment failed");
    }

    if (result.redirect) {
      // Payment was successful, call success handler
      if (options.onSuccess) {
        options.onSuccess({
          order_id: result.order?.orderId,
          payment_id: result.order?.paymentSessionId,
          status: "SUCCESS",
        });
      }
      return result;
    }

    return result;
  } catch (error) {
    console.error("Payment initiation failed:", error);
    if (options.onFailure) {
      options.onFailure({ error: error.message });
    }
    throw error;
  }
}

/**
 * Verify payment status using the same API as React Native app
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} Payment verification result
 */
export async function verifyPayment(orderId) {
  try {
    const response = await api.get(
      `${endpoints.getOrderStatus}?order_id=${orderId}`
    );

    return {
      status: response.data.order_status === "PAID" ? "SUCCESS" : "FAILED",
      order_id: orderId,
      payment_status: response.data.order_status,
    };
  } catch (error) {
    console.error("Error verifying payment:", error);
    throw new Error("Payment verification failed");
  }
}

export { CASHFREE_CONFIG };
