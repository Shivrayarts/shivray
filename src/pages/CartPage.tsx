import { Link } from "@/lib/spa-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { getCategoryLabel } from "@/data/products";
import { useCart } from "@/hooks/use-cart";
import { useStoredProducts } from "@/lib/content-store";
import { isValidEmail, isValidName, isValidPhone, normalizeDigits } from "@/lib/form-validation";
import { resolveLocalizedText, useLanguage } from "@/lib/language";
import { normalizeDisplayCase, parseCurrencyAmount } from "@/lib/utils";
import {
  type CustomerProfile,
  getStoredCustomers,
  loginCustomer,
  placeOrder,
  updateCustomerProfile,
  useCustomerSession,
} from "@/lib/customer-orders";

export default function CartPage() {
  const { resolvedLocale } = useLanguage();
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const catalog = useStoredProducts();
  const customerSession = useCustomerSession();
  const [checkoutForm, setCheckoutForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    paymentMethod: "Online Payment" as "Online Payment",
  });
  const [orderMessage, setOrderMessage] = useState("");
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
    address: false,
  });
  const items = cart.map((entry) => {
    const product = catalog.find((p) => p.id === entry.id);
    return product ? { product, quantity: entry.quantity } : null;
  }).filter((item): item is NonNullable<typeof item> => item !== null);
  const currentCustomer = useMemo<CustomerProfile | null>(() => {
    if (!customerSession) return null;
    return getStoredCustomers().find((customer) => customer.id === customerSession.customerId) ?? null;
  }, [customerSession]);

  const orderTotal = useMemo(
    () =>
      items.reduce((sum, item) => {
        const unitPrice = parseCurrencyAmount(item.product.price);
        return sum + unitPrice * item.quantity;
      }, 0),
    [items],
  );
  const resolvedName = (checkoutForm.name || currentCustomer?.name || customerSession?.name || "").trim();
  const resolvedEmail = (checkoutForm.email || currentCustomer?.email || customerSession?.email || "").trim();
  const resolvedPhone = (checkoutForm.phone || currentCustomer?.phone || "").trim();
  const resolvedAddress = (checkoutForm.address || currentCustomer?.address || "").trim();

  async function handlePlaceOrder() {
    if (
      !isValidName(resolvedName) ||
      !isValidEmail(resolvedEmail) ||
      !isValidPhone(resolvedPhone) ||
      resolvedAddress.length < 10
    ) {
      setTouched({ name: true, email: true, phone: true, address: true });
      setOrderMessage("Please enter a valid name, email, 10-digit phone number, and full address.");
      return;
    }

    try {
      const customer =
        currentCustomer ??
        (await loginCustomer({
          name: resolvedName,
          email: resolvedEmail,
          phone: resolvedPhone,
          address: resolvedAddress,
        }));

      await updateCustomerProfile(customer.id, {
        name: resolvedName,
        email: resolvedEmail,
        phone: resolvedPhone,
        address: resolvedAddress,
        lastLoginAt: new Date().toISOString(),
      });

      const order = await placeOrder({
        customer: {
          ...customer,
          name: resolvedName,
          email: resolvedEmail,
          phone: resolvedPhone,
          address: resolvedAddress,
        },
        items: items.map(({ product, quantity }) => ({
          productId: product.id,
          productName: resolveLocalizedText(product.name, resolvedLocale),
          price: product.price,
          quantity,
          image: product.image,
        })),
        paymentMethod: checkoutForm.paymentMethod,
      });

      clearCart();
      setOrderMessage(`Order ${order.id} placed successfully. We will contact you shortly.`);
    } catch (error) {
      setOrderMessage(error instanceof Error ? error.message : "Unable to place the order right now.");
    }
  }

  return (
    <div>
      <section className="bg-primary py-6 text-primary-foreground md:py-6">
        <div className="layout-shell px-4"><h1 className="font-heading text-3xl font-bold md:text-4xl">Your Cart</h1>
        {/* <p className="mt-2 text-sm opacity-90 md:text-base">Review your selected products before proceeding.</p> */}
        </div>
        </section>
      <section className="py-12 md:py-16">
        <div className="layout-shell px-4">
          {items.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-8 text-center"><p className="text-muted-foreground">Your cart is currently empty.</p><Link to="/products" className="mt-4 inline-flex rounded-md bg-primary px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground">Browse Products</Link></div>
          ) : (
            <div className="space-y-4">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="grid grid-cols-1 gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-[96px_1fr_auto]">
                  <img src={product.image} alt={normalizeDisplayCase(resolveLocalizedText(product.name, resolvedLocale))} className="h-24 w-24 rounded-md object-cover" loading="lazy" />
                  <div><p className="text-xs uppercase tracking-wide text-gold">{getCategoryLabel(product.category, resolvedLocale)}</p><Link to="/products/$productId" params={{ productId: product.id }} className="mt-1 block font-heading text-base font-semibold text-foreground hover:text-primary">{normalizeDisplayCase(resolveLocalizedText(product.name, resolvedLocale))}</Link><p className="mt-1 text-sm font-bold text-primary">{product.price}</p></div>
                  <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                    <div className="flex items-center gap-2 rounded-md border border-border p-1">
                      <button onClick={() => updateQuantity(product.id, quantity - 1)} className="rounded p-1 hover:bg-muted" aria-label={`${resolvedLocale === "mr" ? "प्रमाण कमी करा" : "Decrease quantity of"} ${normalizeDisplayCase(resolveLocalizedText(product.name, resolvedLocale))}`}><Minus className="h-4 w-4" /></button>
                      <span className="min-w-8 text-center text-sm font-medium">{quantity}</span>
                      <button onClick={() => updateQuantity(product.id, quantity + 1)} className="rounded p-1 hover:bg-muted" aria-label={`${resolvedLocale === "mr" ? "प्रमाण वाढवा" : "Increase quantity of"} ${normalizeDisplayCase(resolveLocalizedText(product.name, resolvedLocale))}`}><Plus className="h-4 w-4" /></button>
                    </div>
                    <button onClick={() => removeFromCart(product.id)} className="inline-flex items-center gap-1 text-xs text-destructive hover:opacity-80"><Trash2 className="h-3.5 w-3.5" />{resolvedLocale === "mr" ? "काढा" : "Remove"}</button>
                  </div>
                </div>
              ))}
              <div className="flex flex-wrap gap-3 pt-2">
                <button onClick={clearCart} className="rounded-md border border-border px-4 py-2 text-sm font-semibold uppercase tracking-wider hover:bg-muted">{resolvedLocale === "mr" ? "कार्ट साफ करा" : "Clear Cart"}</button>
                <Link to="/contact" className="rounded-md bg-primary px-5 py-2 text-sm font-semibold uppercase tracking-wider text-primary-foreground">{resolvedLocale === "mr" ? "चौकशी / ऑर्डर" : "Enquire / Order"}</Link>
              </div>
              <div className="rounded-lg border border-border bg-card p-5">
                <h2 className="font-heading text-2xl font-semibold text-foreground">Place Order</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Share your details and we will confirm payment and availability with you.
                </p>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <input
                    type="text"
                    value={checkoutForm.name || currentCustomer?.name || customerSession?.name || ""}
                    onBlur={() => setTouched((value) => ({ ...value, name: true }))}
                    onChange={(event) => setCheckoutForm((value) => ({ ...value, name: event.target.value }))}
                    placeholder="Customer name"
                    className={`rounded-md border bg-background px-4 py-3 text-sm ${
                      touched.name && !isValidName(resolvedName) ? "border-[#b42318]" : "border-border"
                    }`}
                  />
                  <input
                    type="email"
                    value={checkoutForm.email || currentCustomer?.email || customerSession?.email || ""}
                    onBlur={() => setTouched((value) => ({ ...value, email: true }))}
                    onChange={(event) => setCheckoutForm((value) => ({ ...value, email: event.target.value }))}
                    placeholder="Email"
                    className={`rounded-md border bg-background px-4 py-3 text-sm ${
                      touched.email && !isValidEmail(resolvedEmail) ? "border-[#b42318]" : "border-border"
                    }`}
                  />
                  <input
                    type="tel"
                    value={checkoutForm.phone || currentCustomer?.phone || ""}
                    onBlur={() => setTouched((value) => ({ ...value, phone: true }))}
                    onChange={(event) => setCheckoutForm((value) => ({ ...value, phone: normalizeDigits(event.target.value, 10) }))}
                    placeholder="Phone number"
                    className={`rounded-md border bg-background px-4 py-3 text-sm ${
                      touched.phone && !isValidPhone(resolvedPhone) ? "border-[#b42318]" : "border-border"
                    }`}
                  />
                  <textarea
                    value={checkoutForm.address || currentCustomer?.address || ""}
                    onBlur={() => setTouched((value) => ({ ...value, address: true }))}
                    onChange={(event) => setCheckoutForm((value) => ({ ...value, address: event.target.value }))}
                    placeholder="Delivery address"
                    rows={4}
                    className={`rounded-md border bg-background px-4 py-3 text-sm md:col-span-2 ${
                      touched.address && resolvedAddress.length < 10 ? "border-[#b42318]" : "border-border"
                    }`}
                  />
                </div>
                <div className="mt-3 space-y-1 text-sm text-[#b42318]">
                  {touched.name && !isValidName(resolvedName) ? <p>Please enter your full name.</p> : null}
                  {touched.email && !isValidEmail(resolvedEmail) ? <p>Please enter a valid email address.</p> : null}
                  {touched.phone && !isValidPhone(resolvedPhone) ? <p>Please enter a valid 10-digit phone number.</p> : null}
                  {touched.address && resolvedAddress.length < 10 ? <p>Please enter a complete delivery address.</p> : null}
                </div>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">
                    Order total: Rs. {orderTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    className="rounded-md bg-primary px-5 py-2 text-sm font-semibold uppercase tracking-wider text-primary-foreground"
                  >
                    Place Order
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
