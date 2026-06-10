import { apiRequest } from "@/lib/api";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: unknown) => void) => void;
    };
  }
}

const DEFAULT_RAZORPAY_KEY_ID = "rzp_test_Sz5olofeeZ5C7u";
const RAZORPAY_CHECKOUT_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

let razorpayScriptPromise: Promise<void> | null = null;

export function getRazorpayKeyId() {
  return String(import.meta.env.VITE_RAZORPAY_KEY_ID || DEFAULT_RAZORPAY_KEY_ID).trim();
}

export function loadRazorpayCheckoutScript() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay checkout is only available in the browser."));
  }

  if (window.Razorpay) return Promise.resolve();
  if (razorpayScriptPromise) return razorpayScriptPromise;

  razorpayScriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${RAZORPAY_CHECKOUT_SCRIPT}"]`);
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Unable to load Razorpay checkout.")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_CHECKOUT_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to load Razorpay checkout."));
    document.head.appendChild(script);
  }).catch((error) => {
    razorpayScriptPromise = null;
    throw error;
  });

  return razorpayScriptPromise;
}

export async function createRazorpayOrder(amountInPaise: number, receipt: string, productIds: string[]) {
  return apiRequest<{
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
  }>("/api/payments/razorpay/order", {
    method: "POST",
    body: {
      amount: amountInPaise,
      receipt,
      productIds,
    },
  });
}

export async function verifyRazorpayPayment(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  return apiRequest<{ ok: true }>("/api/payments/razorpay/verify", {
    method: "POST",
    body: input,
  });
}
