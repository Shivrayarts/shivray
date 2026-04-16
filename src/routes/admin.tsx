import { createFileRoute } from "@tanstack/react-router";
import {
  Boxes,
  CirclePlus,
  IndianRupee,
  LogOut,
  MessageSquare,
  ShoppingBag,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { isAdminAuthenticated, logoutAdmin } from "@/lib/admin-auth";
import { productCategories, type Product } from "@/data/products";
import { useServerFn } from "@tanstack/react-start";
import {
  createProductInDbServer,
  getProductsFromDbServer,
} from "@/lib/server/products.functions";

export const Route = createFileRoute("/admin")({
  component: AdminDashboardPage,
  head: () => ({
    meta: [
      { title: "Admin Dashboard - Shivray" },
      { name: "description", content: "Manage products, orders, and customer inquiries for Shivray." },
    ],
  }),
});

const stats = [
  { label: "Total Orders", value: "248", delta: "+12% this month", icon: ShoppingBag },
  { label: "Revenue", value: "Rs 4,86,300", delta: "+8% this month", icon: IndianRupee },
  { label: "Products", value: "64", delta: "9 low stock", icon: Boxes },
  { label: "Inquiries", value: "17", delta: "5 new today", icon: MessageSquare },
] as const;

const recentOrders = [
  { id: "#SR-2401", customer: "Aniket Patil", item: "Royal Khanjar", amount: "Rs 8,500", status: "Paid" },
  { id: "#SR-2402", customer: "Pooja Deshmukh", item: "Shastradhari Maharaj", amount: "Rs 5,100", status: "Packed" },
  { id: "#SR-2403", customer: "Rahul Jadhav", item: "Brass Dhoop Stand", amount: "Rs 2,200", status: "Pending" },
  { id: "#SR-2404", customer: "Nitin Kulkarni", item: "Ashwarudh Maharaj", amount: "Rs 12,850", status: "Shipped" },
] as const;

const lowStockItems = [
  { name: "Royal Khanjar", stock: 3 },
  { name: "Maharaj Shield Replica", stock: 2 },
  { name: "Brass Dhoop Stand", stock: 5 },
] as const;

const inquiries = [
  { name: "Sonal Pawar", message: "Bulk order for cultural event artifacts.", time: "10 min ago" },
  { name: "Rajesh More", message: "Custom sword engraving request.", time: "32 min ago" },
  { name: "Meera Joshi", message: "Need delivery estimate for Pune.", time: "1 hour ago" },
] as const;

function statusClass(status: string) {
  if (status === "Paid" || status === "Shipped") return "bg-emerald-100 text-emerald-700";
  if (status === "Packed") return "bg-amber-100 text-amber-700";
  return "bg-rose-100 text-rose-700";
}

type ProductFormState = {
  name: string;
  price: string;
  image: string;
  category: Product["category"];
  tag: string;
  shortDescription: string;
  details: string;
  material: string;
  dimensions: string;
};

const initialProductForm: ProductFormState = {
  name: "",
  price: "",
  image: "",
  category: "Statues",
  tag: "",
  shortDescription: "",
  details: "",
  material: "",
  dimensions: "",
};

function AdminDashboardPage() {
  const navigate = useNavigate();
  const [isAllowed, setIsAllowed] = useState(false);
  const [form, setForm] = useState<ProductFormState>(initialProductForm);
  const [createdProducts, setCreatedProducts] = useState<Product[]>([]);
  const [saveMessage, setSaveMessage] = useState("");
  const fetchProducts = useServerFn(getProductsFromDbServer);
  const createProduct = useServerFn(createProductInDbServer);

  useEffect(() => {
    const allowed = isAdminAuthenticated();
    if (!allowed) {
      navigate({ to: "/admin-login" });
      return;
    }
    setIsAllowed(true);
  }, [navigate]);

  useEffect(() => {
    if (!isAllowed) return;
    void (async () => {
      const products = await fetchProducts();
      setCreatedProducts(products.slice(0, 5));
    })();
  }, [fetchProducts, isAllowed]);

  if (!isAllowed) {
    return <div className="min-h-[calc(100vh-5rem)] bg-muted/30" />;
  }

  function handleLogout() {
    logoutAdmin();
    navigate({ to: "/admin-login" });
  }

  function handleFormChange<K extends keyof ProductFormState>(
    key: K,
    value: ProductFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleAddProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await createProduct({
      data: {
        name: form.name.trim(),
        price: form.price.trim(),
        image: form.image.trim(),
        category: form.category,
        tag: form.tag.trim(),
        shortDescription: form.shortDescription.trim(),
        details: form.details.trim(),
        material: form.material.trim(),
        dimensions: form.dimensions.trim(),
      },
    });

    if (!result.success) {
      setSaveMessage(result.message);
      return;
    }

    const products = await fetchProducts();
    setCreatedProducts(products.slice(0, 5));
    setForm(initialProductForm);
    setSaveMessage("Product added successfully. It is now visible on the Products page.");
  }

  return (
    <div className="bg-muted/30 min-h-[calc(100vh-5rem)]">
      <section className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-wider text-gold font-semibold">Admin Panel</p>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mt-1">Shivray Dashboard</h1>
            <p className="text-muted-foreground mt-2">Track orders, products, and customer updates in one place.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-primary-foreground hover:bg-primary/90 transition-colors">
              <TrendingUp className="w-4 h-4" />
              View Reports
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2.5 text-sm font-semibold uppercase tracking-wide text-foreground hover:bg-muted transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-8">
          {stats.map((item) => (
            <div key={item.label} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="mt-1 text-2xl font-heading font-bold text-foreground">{item.value}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gold/15 text-gold flex items-center justify-center">
                  <item.icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-emerald-700 font-medium mt-3">{item.delta}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
          <div className="xl:col-span-2 rounded-xl border border-border bg-card p-5 md:p-6 shadow-sm">
            <h2 className="font-heading text-xl font-semibold text-foreground">Recent Orders</h2>
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    <th className="py-2 font-medium">Order ID</th>
                    <th className="py-2 font-medium">Customer</th>
                    <th className="py-2 font-medium">Item</th>
                    <th className="py-2 font-medium">Amount</th>
                    <th className="py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b last:border-0 border-border/70">
                      <td className="py-3 font-semibold">{order.id}</td>
                      <td className="py-3">{order.customer}</td>
                      <td className="py-3">{order.item}</td>
                      <td className="py-3 font-medium">{order.amount}</td>
                      <td className="py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-5 md:p-6 shadow-sm">
              <h2 className="font-heading text-xl font-semibold text-foreground">Low Stock Alert</h2>
              <div className="space-y-3 mt-4">
                {lowStockItems.map((item) => (
                  <div key={item.name} className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                      <TriangleAlert className="w-3.5 h-3.5" />
                      {item.stock} left
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 md:p-6 shadow-sm">
              <h2 className="font-heading text-xl font-semibold text-foreground">Latest Inquiries</h2>
              <div className="space-y-3 mt-4">
                {inquiries.map((item) => (
                  <div key={item.name} className="rounded-lg border border-border bg-background px-3 py-2.5">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.message}</p>
                    <p className="text-[11px] text-gold mt-2">{item.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-border bg-card p-5 md:p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <CirclePlus className="w-5 h-5 text-gold" />
            <h2 className="font-heading text-xl font-semibold text-foreground">Add Product</h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Add a new product from admin. It will appear on the Products page instantly.
          </p>

          <form onSubmit={handleAddProduct} className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Product Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-gold"
                placeholder="Royal Talwar"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Price</label>
              <input
                type="text"
                value={form.price}
                onChange={(e) => handleFormChange("price", e.target.value)}
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-gold"
                placeholder="Rs. 9,500"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Image URL</label>
              <input
                type="url"
                value={form.image}
                onChange={(e) => handleFormChange("image", e.target.value)}
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-gold"
                placeholder="https://example.com/product-image.jpg"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Category</label>
              <select
                value={form.category}
                onChange={(e) => handleFormChange("category", e.target.value as Product["category"])}
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                {productCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Tag (Optional)</label>
              <input
                type="text"
                value={form.tag}
                onChange={(e) => handleFormChange("tag", e.target.value)}
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-gold"
                placeholder="New / Featured"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Material</label>
              <input
                type="text"
                value={form.material}
                onChange={(e) => handleFormChange("material", e.target.value)}
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-gold"
                placeholder="Steel and brass"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-foreground">Short Description</label>
              <input
                type="text"
                value={form.shortDescription}
                onChange={(e) => handleFormChange("shortDescription", e.target.value)}
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-gold"
                placeholder="Handcrafted heritage collectible for premium decor."
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-foreground">Details</label>
              <textarea
                value={form.details}
                onChange={(e) => handleFormChange("details", e.target.value)}
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-gold min-h-28"
                placeholder="Detailed product information for product detail page."
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Dimensions</label>
              <input
                type="text"
                value={form.dimensions}
                onChange={(e) => handleFormChange("dimensions", e.target.value)}
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-gold"
                placeholder='Approx. 24" length'
                required
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-md bg-primary text-primary-foreground py-2.5 text-sm font-semibold uppercase tracking-wide hover:bg-primary/90 transition-colors"
              >
                Add Product
              </button>
            </div>
          </form>

          {saveMessage ? (
            <p className="mt-3 text-sm font-medium text-emerald-700">{saveMessage}</p>
          ) : null}

          <div className="mt-6">
            <h3 className="font-heading text-lg font-semibold text-foreground">Recently Available Products</h3>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              {createdProducts.slice(0, 4).map((item) => (
                <div key={item.id} className="rounded-lg border border-border bg-background px-3 py-2.5">
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.category}</p>
                  <p className="text-sm text-primary font-semibold mt-1">{item.price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
