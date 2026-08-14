import { Link, useNavigate } from "@/lib/spa-router";
import { LockKeyhole, Minus, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getCategoryLabel, getProductPaymentMode } from "@/lib/product-model";
import { useCart } from "@/hooks/use-cart";
import { getCategoryDisplayLabel } from "@/lib/category-matching";
import { useStoredCatalogueTypes, useStoredProducts } from "@/lib/content-store";
import { isValidEmail, isValidName, isValidPhone, normalizeDigits } from "@/lib/form-validation";
import { resolveLocalizedText, useLanguage } from "@/lib/language";
import { siteConfig } from "@/lib/site-config";
import { getProductPricing, normalizeDisplayCase, parseCurrencyAmount } from "@/lib/utils";
import { createRazorpayOrder, getRazorpayKeyId, loadRazorpayCheckoutScript, verifyRazorpayPayment } from "@/lib/payments";
import { buildWhatsappUrl, getGeneralWhatsappMessage } from "@/lib/whatsapp-messages";
import {
  type CustomerProfile,
  getStoredCustomers,
  loginCustomer,
  placeOrder,
  updateCustomerProfile,
  useCustomerSession,
} from "@/lib/customer-orders";

type RazorpaySuccessResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export default function CartPage() {
  const { resolvedLocale } = useLanguage();
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const catalog = useStoredProducts();
  const catalogueTypes = useStoredCatalogueTypes();
  const customerSession = useCustomerSession();
  const [checkoutForm, setCheckoutForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    pincode: "",
    paymentMethod: "Online Payment" as const,
  });
  const [orderMessage, setOrderMessage] = useState("");
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
    address: false,
    pincode: false,
  });
  const items = cart.map((entry) => {
    const product = catalog.find((p) => p.id === entry.id);
    return product ? { product, quantity: entry.quantity } : null;
  }).filter((item): item is NonNullable<typeof item> => item !== null);
  const currentCustomer = useMemo<CustomerProfile | null>(() => {
    if (!customerSession) return null;
    return getStoredCustomers().find((customer) => customer.id === customerSession.customerId) ?? null;
  }, [customerSession]);
  const isLoggedIn = Boolean(customerSession && currentCustomer);

  useEffect(() => {
    if (!currentCustomer) return;

    const [addressLine = "", pincodeLine = ""] = String(currentCustomer.address || "").split("\nPIN Code: ");
    setCheckoutForm((value) => ({
      ...value,
      name: currentCustomer.name || value.name,
      email: currentCustomer.email || value.email,
      phone: currentCustomer.phone || value.phone,
      address: addressLine || value.address,
      pincode: pincodeLine || value.pincode,
    }));
  }, [currentCustomer]);

  const orderTotal = useMemo(
    () =>
      items.reduce((sum, item) => {
        const unitPrice = parseCurrencyAmount(getProductPricing(item.product).finalPrice);
        return sum + unitPrice * item.quantity;
      }, 0),
    [items],
  );
  const resolvedName = checkoutForm.name.trim();
  const resolvedEmail = checkoutForm.email.trim();
  const resolvedPhone = checkoutForm.phone.trim();
  const resolvedAddress = checkoutForm.address.trim();
  const resolvedPincode = checkoutForm.pincode.trim();
  const isPincodeValid = /^\d{6}$/.test(resolvedPincode);
  const shippingAddress = `${resolvedAddress}${resolvedPincode ? `\nPIN Code: ${resolvedPincode}` : ""}`;
  const hasWhatsappOnlyItems = items.some(({ product }) => getProductPaymentMode(product) === "whatsapp");

  function ensureValidCheckoutDetails() {
    if (
      !isValidName(resolvedName) ||
      !isValidEmail(resolvedEmail) ||
      !isValidPhone(resolvedPhone) ||
      resolvedAddress.length < 10 ||
      !isPincodeValid
    ) {
      setTouched({ name: true, email: true, phone: true, address: true, pincode: true });
      setOrderMessage("Please enter a valid name, email, 10-digit phone number, complete address, and 6-digit PIN code.");
      return false;
    }

    return true;
  }

  async function persistCustomerProfile() {
    const customer =
      currentCustomer ??
      (await loginCustomer({
        name: resolvedName,
        email: resolvedEmail,
        phone: resolvedPhone,
        address: shippingAddress,
      }));

    await updateCustomerProfile(customer.id, {
      name: resolvedName,
      email: resolvedEmail,
      phone: resolvedPhone,
      address: shippingAddress,
      lastLoginAt: new Date().toISOString(),
    });

    return customer;
  }

  function buildWhatsappOrderLink() {
    const productLines = items.map(({ product, quantity }) => {
      const name = resolveLocalizedText(product.name, resolvedLocale);
      const price = getProductPricing(product).finalPrice;
      return `- ${name} x${quantity} (${price})`;
    });

    const message = [
      getGeneralWhatsappMessage(resolvedLocale),
      "",
      resolvedLocale === "mr" ? "ग्राहक तपशील:" : "Customer Details:",
      `${resolvedLocale === "mr" ? "नाव" : "Name"}: ${resolvedName}`,
      `${resolvedLocale === "mr" ? "फोन" : "Phone"}: ${resolvedPhone}`,
      `${resolvedLocale === "mr" ? "ईमेल" : "Email"}: ${resolvedEmail}`,
      `${resolvedLocale === "mr" ? "पत्ता" : "Address"}: ${shippingAddress}`,
      "",
      resolvedLocale === "mr" ? "उत्पादने:" : "Items:",
      ...productLines,
      "",
      `${resolvedLocale === "mr" ? "एकूण रक्कम" : "Order Total"}: Rs. ${orderTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    ].join("\n");

    return buildWhatsappUrl(siteConfig.whatsappHref, message);
  }

  async function handlePlaceOrder() {
    if (!isLoggedIn) {
      setOrderMessage("Please log in first to continue with checkout.");
      navigate({
        to: "/login",
        search: { redirect: "/cart" },
      });
      return;
    }

    if (!ensureValidCheckoutDetails()) return;

    if (hasWhatsappOnlyItems) {
      window.open(buildWhatsappOrderLink(), "_blank", "noopener,noreferrer");
      setOrderMessage("This cart includes WhatsApp-only products. We opened the order message for you.");
      return;
    }

    try {
      const customer = await persistCustomerProfile();
      await loadRazorpayCheckoutScript();

      const razorpayOrder = await createRazorpayOrder(
        Math.round(orderTotal * 100),
        `order_${Date.now()}`,
        items.map(({ product }) => product.id),
      );

      if (!window.Razorpay) {
        throw new Error("Razorpay checkout could not be initialized.");
      }

      const razorpayKeyId = razorpayOrder.keyId || getRazorpayKeyId();
      const orderItems = items.map(({ product, quantity }) => ({
        productId: product.id,
        productName: resolveLocalizedText(product.name, resolvedLocale),
        price: getProductPricing(product).finalPrice,
        quantity,
        image: product.image,
      }));

      const options = {
        key: razorpayKeyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: siteConfig.brandName.en,
        description: "Shivray Art order payment",
        order_id: razorpayOrder.orderId,
        prefill: {
          name: resolvedName,
          email: resolvedEmail,
          contact: `+91${resolvedPhone}`,
        },
        theme: {
          color: "#34180e",
        },
        handler: async (response: RazorpaySuccessResponse) => {
          try {
            await verifyRazorpayPayment({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });

            const order = await placeOrder({
              customer: {
                ...customer,
                name: resolvedName,
                email: resolvedEmail,
                phone: resolvedPhone,
                address: shippingAddress,
              },
              items: orderItems,
              paymentMethod: checkoutForm.paymentMethod,
              paymentInfo: `Online Payment Paid (${response.razorpay_payment_id})`,
            });

            clearCart();
            setOrderMessage(`Payment successful. Order ${order.id} has been placed successfully.`);
          } catch (paymentError) {
            setOrderMessage(
              paymentError instanceof Error
                ? paymentError.message
                : "Payment was received but order confirmation could not be completed.",
            );
          }
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      setOrderMessage(error instanceof Error ? error.message : "Unable to place the order right now.");
    }
  }

  return (
    <div>
      <section className="border-b border-[#eadbc8] bg-[#f7f1e7] py-6 text-[#34180e] md:py-6">
        <div className="layout-shell px-4"><h1 className="font-heading text-3xl font-bold md:text-4xl">{resolvedLocale === "mr" ? "तुमचे कार्ट" : "Your Cart"}</h1>
        {/* <p className="mt-2 text-sm opacity-90 md:text-base">Review your selected products before proceeding.</p> */}
        </div>
        </section>
      <section className="py-12 md:py-16">
        <div className="layout-shell px-4">
          {items.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-8 text-center"><p className="text-muted-foreground">{resolvedLocale === "mr" ? "तुमचे कार्ट सध्या रिकामे आहे." : "Your cart is currently empty."}</p><Link to="/products" className="mt-4 inline-flex rounded-md bg-primary px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground">{resolvedLocale === "mr" ? "उत्पादने पहा" : "Browse Products"}</Link></div>
          ) : (
            <div className="space-y-4">
              {items.map(({ product, quantity }) => {
                const pricing = getProductPricing(product);
                const isWhatsappOnlyProduct = getProductPaymentMode(product) === "whatsapp";
                return (
                <div key={product.id} className="grid grid-cols-1 gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-[96px_1fr_auto]">
                  <img src={product.image} alt={normalizeDisplayCase(resolveLocalizedText(product.name, resolvedLocale))} className="h-24 w-24 rounded-md object-cover" loading="lazy" />
                  <div><p className="text-xs uppercase tracking-wide text-gold">{getCategoryDisplayLabel(product.category, resolvedLocale, catalogueTypes) || getCategoryLabel(product.category, resolvedLocale)}</p><Link to="/products/$productId" params={{ productId: product.id }} className="mt-1 block font-heading text-base font-semibold text-foreground hover:text-primary">{normalizeDisplayCase(resolveLocalizedText(product.name, resolvedLocale))}</Link><p className="mt-1 text-sm font-bold text-primary">{pricing.finalPrice}</p>{pricing.hasDiscount ? <div className="mt-1 flex items-center gap-2"><p className="text-xs text-muted-foreground line-through">{pricing.originalPrice}</p><p className="rounded-full bg-[#45ae4a] px-2 py-0.5 text-[10px] font-semibold text-white">{pricing.discountPercentage.toFixed(0)}% OFF</p></div> : null}{isWhatsappOnlyProduct ? <p className="mt-2 inline-flex rounded-full border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#166534]">{resolvedLocale === "mr" ? "हा उत्पाद WhatsApp वर ऑर्डर होईल" : "This product will be ordered on WhatsApp"}</p> : null}</div>
                  <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                    <div className="flex items-center gap-2 rounded-md border border-border p-1">
                      <button onClick={() => updateQuantity(product.id, quantity - 1)} className="rounded p-1 hover:bg-muted" aria-label={`${resolvedLocale === "mr" ? "प्रमाण कमी करा" : "Decrease quantity of"} ${normalizeDisplayCase(resolveLocalizedText(product.name, resolvedLocale))}`}><Minus className="h-4 w-4" /></button>
                      <span className="min-w-8 text-center text-sm font-medium">{quantity}</span>
                      <button onClick={() => updateQuantity(product.id, quantity + 1)} className="rounded p-1 hover:bg-muted" aria-label={`${resolvedLocale === "mr" ? "प्रमाण वाढवा" : "Increase quantity of"} ${normalizeDisplayCase(resolveLocalizedText(product.name, resolvedLocale))}`}><Plus className="h-4 w-4" /></button>
                    </div>
                    <button onClick={() => removeFromCart(product.id)} className="inline-flex items-center gap-1 text-xs text-destructive hover:opacity-80"><Trash2 className="h-3.5 w-3.5" />{resolvedLocale === "mr" ? "काढा" : "Remove"}</button>
                  </div>
                </div>
              )})}
              <div className="flex flex-wrap gap-3 pt-2">
                <button onClick={clearCart} className="rounded-md border border-border px-4 py-2 text-sm font-semibold uppercase tracking-wider hover:bg-muted">{resolvedLocale === "mr" ? "कार्ट साफ करा" : "Clear Cart"}</button>
                <Link to="/contact" className="rounded-md bg-primary px-5 py-2 text-sm font-semibold uppercase tracking-wider text-primary-foreground">{resolvedLocale === "mr" ? "चौकशी / ऑर्डर" : "Enquire / Order"}</Link>
              </div>
              <div className="rounded-lg border border-border bg-card p-5">
                <h2 className="font-heading text-2xl font-semibold text-foreground">Place Order</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {hasWhatsappOnlyItems
                    ? "This cart includes WhatsApp-only products. Share your details and continue the order on WhatsApp."
                    : "Share your details and continue with secure online payment."}
                </p>
                <div className={`mt-4 rounded-lg border p-4 text-sm ${isLoggedIn ? "border-[#d8e7c8] bg-[#f4fbf0] text-[#305724]" : "border-[#eadbc8] bg-[#fcf8f2] text-[#6c4b33]"}`}>
                  {isLoggedIn ? (
                    <p>
                      Signed in as <span className="font-semibold">{currentCustomer?.email}</span>. You can continue with checkout.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="flex items-center gap-2">
                        <LockKeyhole className="h-4 w-4" />
                        Please log in before placing an order.
                      </p>
                      <Link
                        to="/login"
                        search={{ redirect: "/cart" }}
                        className="inline-flex items-center justify-center rounded-md bg-[#34180e] px-4 py-2 text-sm font-semibold text-white"
                      >
                        Login to Continue
                      </Link>
                    </div>
                  )}
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <input
                    type="text"
                    value={checkoutForm.name}
                    onBlur={() => setTouched((value) => ({ ...value, name: true }))}
                    onChange={(event) => setCheckoutForm((value) => ({ ...value, name: event.target.value }))}
                    placeholder="Customer name"
                    disabled={!isLoggedIn}
                    className={`rounded-md border bg-background px-4 py-3 text-sm ${
                      touched.name && !isValidName(resolvedName) ? "border-[#b42318]" : "border-border"
                    }`}
                  />
                  <input
                    type="email"
                    value={checkoutForm.email}
                    onBlur={() => setTouched((value) => ({ ...value, email: true }))}
                    onChange={(event) => setCheckoutForm((value) => ({ ...value, email: event.target.value }))}
                    placeholder="Email"
                    disabled={!isLoggedIn}
                    className={`rounded-md border bg-background px-4 py-3 text-sm ${
                      touched.email && !isValidEmail(resolvedEmail) ? "border-[#b42318]" : "border-border"
                    }`}
                  />
                  <input
                    type="tel"
                    value={checkoutForm.phone}
                    onBlur={() => setTouched((value) => ({ ...value, phone: true }))}
                    onChange={(event) => setCheckoutForm((value) => ({ ...value, phone: normalizeDigits(event.target.value, 10) }))}
                    placeholder="Phone number"
                    disabled={!isLoggedIn}
                    className={`rounded-md border bg-background px-4 py-3 text-sm ${
                      touched.phone && !isValidPhone(resolvedPhone) ? "border-[#b42318]" : "border-border"
                    }`}
                  />
                  <textarea
                    value={checkoutForm.address}
                    onBlur={() => setTouched((value) => ({ ...value, address: true }))}
                    onChange={(event) => setCheckoutForm((value) => ({ ...value, address: event.target.value }))}
                    placeholder="Delivery address"
                    rows={4}
                    disabled={!isLoggedIn}
                    className={`rounded-md border bg-background px-4 py-3 text-sm md:col-span-2 ${
                      touched.address && resolvedAddress.length < 10 ? "border-[#b42318]" : "border-border"
                    }`}
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={checkoutForm.pincode}
                    onBlur={() => setTouched((value) => ({ ...value, pincode: true }))}
                    onChange={(event) => setCheckoutForm((value) => ({ ...value, pincode: normalizeDigits(event.target.value, 6) }))}
                    placeholder="PIN code"
                    disabled={!isLoggedIn}
                    className={`rounded-md border bg-background px-4 py-3 text-sm md:col-span-2 ${
                      touched.pincode && !isPincodeValid ? "border-[#b42318]" : "border-border"
                    }`}
                  />
                </div>
                <div className="mt-4 rounded-lg border border-[#eadbc8] bg-[#fcf8f2] p-4 text-sm text-[#6c4b33]">
                  <p className="font-semibold text-[#34180e]">Shipping & Payment</p>
                  <p className="mt-2">
                    Payment method: {hasWhatsappOnlyItems ? "Offline WhatsApp Order" : "Online Payment"}
                  </p>
                  <p className="mt-1">
                    {hasWhatsappOnlyItems
                      ? "WhatsApp-only products are completed after manual order review."
                      : "Shipping charges, payment confirmation, and delivery timeline will be shared with you after order review."}
                  </p>
                </div>
                <div className="mt-3 space-y-1 text-sm text-[#b42318]">
                  {touched.name && !isValidName(resolvedName) ? <p>Please enter your full name.</p> : null}
                  {touched.email && !isValidEmail(resolvedEmail) ? <p>Please enter a valid email address.</p> : null}
                  {touched.phone && !isValidPhone(resolvedPhone) ? <p>Please enter a valid 10-digit phone number.</p> : null}
                  {touched.address && resolvedAddress.length < 10 ? <p>Please enter a complete delivery address.</p> : null}
                  {touched.pincode && !isPincodeValid ? <p>Please enter a valid 6-digit PIN code.</p> : null}
                </div>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">
                    Order total: Rs. {orderTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={!isLoggedIn}
                    className="rounded-md bg-primary px-5 py-2 text-sm font-semibold uppercase tracking-wider text-primary-foreground"
                  >
                    {!isLoggedIn ? "Login to Place Order" : hasWhatsappOnlyItems ? "Order on WhatsApp" : "Pay with Razorpay"}
                  </button>
                </div>
                {orderMessage ? <p className="mt-4 text-sm font-medium text-green-700">{orderMessage}</p> : null}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
