import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Boxes,
  CirclePlus,
  ImagePlus,
  IndianRupee,
  LogOut,
  MessageSquare,
  Pencil,
  ShoppingBag,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { isAdminAuthenticated, logoutAdmin } from "@/lib/admin-auth";
import { productCategories, type Product } from "@/data/products";
import { useServerFn } from "@tanstack/react-start";
import {
  createProductInDbServer,
  getAdminProductsFromDbServer,
  type AdminProduct,
  updateProductInDbServer,
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

const recentOrders = [
  { id: "#SR-2401", customer: "Aniket Patil", item: "Royal Khanjar", amount: "Rs 8,500", status: "Paid" },
  { id: "#SR-2402", customer: "Pooja Deshmukh", item: "Shastradhari Maharaj", amount: "Rs 5,100", status: "Packed" },
  { id: "#SR-2403", customer: "Rahul Jadhav", item: "Brass Dhoop Stand", amount: "Rs 2,200", status: "Pending" },
  { id: "#SR-2404", customer: "Nitin Kulkarni", item: "Ashwarudh Maharaj", amount: "Rs 12,850", status: "Shipped" },
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
  stockQuantity: string;
};

type EditProductFormState = ProductFormState & {
  id: string;
  isPublished: boolean;
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
  stockQuantity: "0",
};

function toEditForm(product: AdminProduct): EditProductFormState {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    category: product.category,
    tag: product.tag,
    shortDescription: product.shortDescription,
    details: product.details,
    material: product.material,
    dimensions: product.dimensions,
    stockQuantity: String(product.stockQuantity),
    isPublished: product.isPublished,
  };
}

function AdminDashboardPage() {
  const navigate = useNavigate();
  const [isAllowed, setIsAllowed] = useState(false);
  const [form, setForm] = useState<ProductFormState>(initialProductForm);
  const [selectedImageName, setSelectedImageName] = useState("");
  const [editImageName, setEditImageName] = useState("");
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [editForm, setEditForm] = useState<EditProductFormState | null>(null);
  const [saveMessage, setSaveMessage] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchAdminProducts = useServerFn(getAdminProductsFromDbServer);
  const createProduct = useServerFn(createProductInDbServer);
  const updateProduct = useServerFn(updateProductInDbServer);

  const lowStockItems = useMemo(
    () => products.filter((item) => item.isPublished && item.stockQuantity <= 5).slice(0, 3),
    [products],
  );

  const dashboardStats = useMemo(() => {
    const publishedProducts = products.filter((item) => item.isPublished).length;
    const lowStockCount = products.filter((item) => item.isPublished && item.stockQuantity <= 5).length;
    return [
      { label: "Total Orders", value: "248", delta: "+12% this month", icon: ShoppingBag },
      { label: "Revenue", value: "Rs 4,86,300", delta: "+8% this month", icon: IndianRupee },
      { label: "Products", value: String(publishedProducts), delta: `${lowStockCount} low stock`, icon: Boxes },
      { label: "Inquiries", value: "17", delta: "5 new today", icon: MessageSquare },
    ] as const;
  }, [products]);

  useEffect(() => {
    const allowed = isAdminAuthenticated();
    if (!allowed) {
      navigate({ to: "/admin-login" });
      return;
    }
    setIsAllowed(true);
  }, [navigate]);

  async function refreshProducts() {
    const latest = await fetchAdminProducts();
    setProducts(latest);
  }

  useEffect(() => {
    if (!isAllowed) return;
    void refreshProducts();
  }, [isAllowed]);

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

  function handleEditFormChange<K extends keyof EditProductFormState>(
    key: K,
    value: EditProductFormState[K],
  ) {
    setEditForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function readImageFile(
    file: File,
    onSuccess: (base64: string, fileName: string) => void,
    onError: (message: string) => void,
  ) {
    if (!file.type.startsWith("image/")) {
      onError("Please upload a valid image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      onError("Image file must be 2MB or smaller.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        onSuccess(result, file.name);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedImageName("");
      handleFormChange("image", "");
      return;
    }

    readImageFile(
      file,
      (base64, fileName) => {
        handleFormChange("image", base64);
        setSelectedImageName(fileName);
        setSaveMessage("");
      },
      (message) => setSaveMessage(message),
    );
  }

  function handleEditImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !editForm) return;

    readImageFile(
      file,
      (base64, fileName) => {
        handleEditFormChange("image", base64);
        setEditImageName(fileName);
        setEditMessage("");
      },
      (message) => setEditMessage(message),
    );
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
        stockQuantity: Number(form.stockQuantity || 0),
      },
    });

    if (!result.success) {
      setSaveMessage(result.message);
      return;
    }

    await refreshProducts();
    setForm(initialProductForm);
    setSelectedImageName("");
    setSaveMessage("Product added successfully.");
  }

  function startEditing(product: AdminProduct) {
    setEditForm(toEditForm(product));
    setEditImageName("");
    setEditMessage("");
  }

  async function handleUpdateProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editForm) return;

    setIsUpdating(true);
    const result = await updateProduct({
      data: {
        id: editForm.id,
        name: editForm.name.trim(),
        price: editForm.price.trim(),
        image: editForm.image.trim(),
        category: editForm.category,
        tag: editForm.tag.trim(),
        shortDescription: editForm.shortDescription.trim(),
        details: editForm.details.trim(),
        material: editForm.material.trim(),
        dimensions: editForm.dimensions.trim(),
        stockQuantity: Number(editForm.stockQuantity || 0),
        isPublished: editForm.isPublished,
      },
    });

    setIsUpdating(false);

    if (!result.success) {
      setEditMessage(result.message);
      return;
    }

    await refreshProducts();
    setEditMessage("Product updated successfully.");
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
          {dashboardStats.map((item) => (
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
                {lowStockItems.length ? (
                  lowStockItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
                      <p className="text-sm font-medium text-foreground">{item.name}</p>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                        <TriangleAlert className="w-3.5 h-3.5" />
                        {item.stockQuantity} left
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No low-stock items right now.</p>
                )}
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
              <label className="text-sm font-medium text-foreground">Upload Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary-foreground hover:file:bg-primary/90 focus-visible:ring-2 focus-visible:ring-gold"
                required
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                {selectedImageName ? `Selected: ${selectedImageName}` : "Max size: 2MB"}
              </p>
              {form.image ? (
                <div className="mt-2 flex items-center gap-2 rounded-md border border-border bg-background p-2">
                  <ImagePlus className="h-4 w-4 text-gold" />
                  <img src={form.image} alt="Product preview" className="h-12 w-12 rounded object-cover" />
                  <span className="text-xs text-muted-foreground">Image ready</span>
                </div>
              ) : null}
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
              <label className="text-sm font-medium text-foreground">Stock Quantity</label>
              <input
                type="number"
                min={0}
                value={form.stockQuantity}
                onChange={(e) => handleFormChange("stockQuantity", e.target.value)}
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-gold"
                placeholder="10"
                required
              />
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

          {saveMessage ? <p className="mt-3 text-sm font-medium text-emerald-700">{saveMessage}</p> : null}
        </div>

        <div className="mt-8 rounded-xl border border-border bg-card p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-heading text-xl font-semibold text-foreground">Manage Existing Products</h3>
            <p className="text-xs text-muted-foreground">Edit old products, restock, and publish/unpublish.</p>
          </div>

          {editMessage ? <p className="mt-3 text-sm font-medium text-emerald-700">{editMessage}</p> : null}

          <div className="mt-4 space-y-4">
            {products.map((item) => (
              <div key={item.id} className="rounded-lg border border-border bg-background p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="h-14 w-14 rounded object-cover" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.category} · {item.price}</p>
                      <p className="text-xs mt-1">
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">Stock: {item.stockQuantity}</span>
                        <span className={`ml-2 rounded-full px-2 py-0.5 ${item.isPublished ? "bg-emerald-100 text-emerald-700" : "bg-zinc-200 text-zinc-700"}`}>
                          {item.isPublished ? "Published" : "Draft"}
                        </span>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => startEditing(item)}
                    className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-muted"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit / Restock
                  </button>
                </div>

                {editForm?.id === item.id ? (
                  <form onSubmit={handleUpdateProduct} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-border pt-4">
                    <div>
                      <label className="text-xs font-medium">Product Name</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => handleEditFormChange("name", e.target.value)}
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium">Price</label>
                      <input
                        type="text"
                        value={editForm.price}
                        onChange={(e) => handleEditFormChange("price", e.target.value)}
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium">Stock Quantity (Restock)</label>
                      <input
                        type="number"
                        min={0}
                        value={editForm.stockQuantity}
                        onChange={(e) => handleEditFormChange("stockQuantity", e.target.value)}
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium">Category</label>
                      <select
                        value={editForm.category}
                        onChange={(e) => handleEditFormChange("category", e.target.value as Product["category"])}
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        {productCategories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-xs font-medium">Upload New Image (Optional)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditImageUpload}
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        {editImageName ? `Selected: ${editImageName}` : "Keep empty to use current image"}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-medium">Tag</label>
                      <input
                        type="text"
                        value={editForm.tag}
                        onChange={(e) => handleEditFormChange("tag", e.target.value)}
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium">Material</label>
                      <input
                        type="text"
                        value={editForm.material}
                        onChange={(e) => handleEditFormChange("material", e.target.value)}
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium">Dimensions</label>
                      <input
                        type="text"
                        value={editForm.dimensions}
                        onChange={(e) => handleEditFormChange("dimensions", e.target.value)}
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        required
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-6">
                      <input
                        id={`publish-${item.id}`}
                        type="checkbox"
                        checked={editForm.isPublished}
                        onChange={(e) => handleEditFormChange("isPublished", e.target.checked)}
                        className="h-4 w-4"
                      />
                      <label htmlFor={`publish-${item.id}`} className="text-xs font-medium">Published</label>
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-xs font-medium">Short Description</label>
                      <input
                        type="text"
                        value={editForm.shortDescription}
                        onChange={(e) => handleEditFormChange("shortDescription", e.target.value)}
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-xs font-medium">Details</label>
                      <textarea
                        value={editForm.details}
                        onChange={(e) => handleEditFormChange("details", e.target.value)}
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-24"
                        required
                      />
                    </div>

                    <div className="md:col-span-2 flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="rounded-md bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wide text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                      >
                        {isUpdating ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditForm(null);
                          setEditImageName("");
                          setEditMessage("");
                        }}
                        className="rounded-md border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-muted"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
