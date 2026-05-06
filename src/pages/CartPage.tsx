import { Link } from "@/lib/spa-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { useStoredProducts } from "@/lib/content-store";
import { normalizeDisplayCase, parseCurrencyAmount } from "@/lib/utils";
import {
  getStoredCustomers,
  loginCustomer,
  placeOrder,
  updateCustomerProfile,
  useCustomerSession,
} from "@/lib/customer-orders";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const catalog = useStoredProducts();
  const customerSession = useCustomerSession();
  const [checkoutForm, setCheckoutForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    paymentMethod: "Cash On Delivery" as "Cash On Delivery" | "Online Payment",
  });
  const [orderMessage, setOrderMessage] = useState("");
  const items = cart.map((entry) => {
    const product = catalog.find((p) => p.id === entry.id);
    return product ? { product, quantity: entry.quantity } : null;
  }).filter((item): item is NonNullable<typeof item> => item !== null);
  const currentCustomer = useMemo(() => {
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

  async function handlePlaceOrder() {
    const resolvedName = checkoutForm.name.trim() || currentCustomer?.name || customerSession?.name || "";
    const resolvedEmail = checkoutForm.email.trim() || currentCustomer?.email || customerSession?.email || "";
    const resolvedPhone = checkoutForm.phone.trim() || currentCustomer?.phone || "";
    const resolvedAddress = checkoutForm.address.trim() || currentCustomer?.address || "";

    if (!resolvedName || !resolvedEmail || !resolvedPhone || !resolvedAddress) {
      setOrderMessage("Please complete name, email, phone, and address before placing the order.");
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
          productName: product.name,
          price: product.price,
          quantity,
          image: product.image,
        })),
        paymentMethod: checkoutForm.paymentMethod,
      });

      clearCart();
      setOrderMessage(`Order ${order.id} placed successfully. It now appears in admin orders.`);
    } catch (error) {
      setOrderMessage(error instanceof Error ? error.message : "Unable to place the order right now.");
    }
  }

  return (
    <div>
      <section className="bg-primary py-14 text-primary-foreground md:py-16"><div className="layout-shell px-4"><h1 className="font-heading text-3xl font-bold md:text-4xl">Your Cart</h1><p className="mt-2 text-sm opacity-90 md:text-base">Review your selected products before proceeding.</p></div></section>
      <section className="py-12 md:py-16">
        <div className="layout-shell px-4">
          {items.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-8 text-center"><p className="text-muted-foreground">Your cart is currently empty.</p><Link to="/products" className="mt-4 inline-flex rounded-md bg-primary px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground">Browse Products</Link></div>
          ) : (
            <div className="space-y-4">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="grid grid-cols-1 gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-[96px_1fr_auto]">
                  <img src={product.image} alt={normalizeDisplayCase(product.name)} className="h-24 w-24 rounded-md object-cover" loading="lazy" />
                  <div><p className="text-xs uppercase tracking-wide text-gold">{product.category}</p><Link to="/products/$productId" params={{ productId: product.id }} className="mt-1 block font-heading text-base font-semibold text-foreground hover:text-primary">{normalizeDisplayCase(product.name)}</Link><p className="mt-1 text-sm font-bold text-primary">{product.price}</p></div>
                  <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                    <div className="flex items-center gap-2 rounded-md border border-border p-1">
                      <button onClick={() => updateQuantity(product.id, quantity - 1)} className="rounded p-1 hover:bg-muted" aria-label={`Decrease quantity of ${normalizeDisplayCase(product.name)}`}><Minus className="h-4 w-4" /></button>
                      <span className="min-w-8 text-center text-sm font-medium">{quantity}</span>
                      <button onClick={() => updateQuantity(product.id, quantity + 1)} className="rounded p-1 hover:bg-muted" aria-label={`Increase quantity of ${normalizeDisplayCase(product.name)}`}><Plus className="h-4 w-4" /></button>
                    </div>
                    <button onClick={() => removeFromCart(product.id)} className="inline-flex items-center gap-1 text-xs text-destructive hover:opacity-80"><Trash2 className="h-3.5 w-3.5" />Remove</button>
                  </div>
                </div>
              ))}
              <div className="flex flex-wrap gap-3 pt-2">
                <button onClick={clearCart} className="rounded-md border border-border px-4 py-2 text-sm font-semibold uppercase tracking-wider hover:bg-muted">Clear Cart</button>
                <Link to="/contact" className="rounded-md bg-primary px-5 py-2 text-sm font-semibold uppercase tracking-wider text-primary-foreground">Enquire / Order</Link>
              </div>
              <div className="rounded-lg border border-border bg-card p-5">
                <h2 className="font-heading text-2xl font-semibold text-foreground">Place Order</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  This creates an order record that appears in the admin `Orders` section.
                </p>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <input
                    type="text"
                    value={checkoutForm.name || currentCustomer?.name || customerSession?.name || ""}
                    onChange={(event) => setCheckoutForm((value) => ({ ...value, name: event.target.value }))}
                    placeholder="Customer name"
                    className="rounded-md border border-border bg-background px-4 py-3 text-sm"
                  />
                  <input
                    type="email"
                    value={checkoutForm.email || currentCustomer?.email || customerSession?.email || ""}
                    onChange={(event) => setCheckoutForm((value) => ({ ...value, email: event.target.value }))}
                    placeholder="Email"
                    className="rounded-md border border-border bg-background px-4 py-3 text-sm"
                  />
                  <input
                    type="tel"
                    value={checkoutForm.phone || currentCustomer?.phone || ""}
                    onChange={(event) => setCheckoutForm((value) => ({ ...value, phone: event.target.value }))}
                    placeholder="Phone number"
                    className="rounded-md border border-border bg-background px-4 py-3 text-sm"
                  />
                  <select
                    value={checkoutForm.paymentMethod}
                    onChange={(event) =>
                      setCheckoutForm((value) => ({
                        ...value,
                        paymentMethod: event.target.value as "Cash On Delivery" | "Online Payment",
                      }))
                    }
                    className="rounded-md border border-border bg-background px-4 py-3 text-sm"
                  >
                    <option value="Cash On Delivery">Cash On Delivery</option>
                    <option value="Online Payment">Online Payment</option>
                  </select>
                  <textarea
                    value={checkoutForm.address || currentCustomer?.address || ""}
                    onChange={(event) => setCheckoutForm((value) => ({ ...value, address: event.target.value }))}
                    placeholder="Delivery address"
                    rows={4}
                    className="rounded-md border border-border bg-background px-4 py-3 text-sm md:col-span-2"
                  />
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
