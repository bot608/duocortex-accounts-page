import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    console.log("Payment callback received:", body);

    // Forward the callback to your backend
    const backendUrl = "http://localhost:4000/api/payment-callback";

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      return NextResponse.json({ success: true });
    } else {
      throw new Error(`Backend callback failed: ${response.status}`);
    }
  } catch (error) {
    console.error("Payment callback error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  // Handle GET requests for testing
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("order_id");

  console.log("Payment callback GET request:", { orderId });

  return NextResponse.json({
    success: true,
    message: "Payment callback received",
    orderId,
  });
}
