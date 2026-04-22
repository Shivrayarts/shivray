import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CirclePlus, ImagePlus, LogOut, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { isAdminAuthenticated, logoutAdmin } from "@/lib/admin-auth";
import { productCategories, type Product } from "@/data/products";
import { useServerFn } from "@tanstack/react-start";
import {
  createProductInDbServer,
  deleteProductFromDbServer,
  getAdminProductsFromDbServer,
  type AdminProduct,
  updateProductInDbServer,
} from "@/lib/server/products.functions";

export const Route = createFileRoute("/admin")({
  component: AdminDashboardPage,
  head: () => ({
    meta: [
      { title: "Admin Dashboard - Shivray" },
      { name: "description", content: "Manage products for Shivray." },
    ],
  }),
});

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
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  const fetchAdminProducts = useServerFn(getAdminProductsFromDbServer);
  const createProduct = useServerFn(createProductInDbServer);
  const updateProduct = useServerFn(updateProductInDbServer);
  const deleteProduct = useServerFn(deleteProductFromDbServer);

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
  async function handleDeleteProduct(product: AdminProduct) {
    if (!product.fromDb) {
      setEditMessage("This is a static product and cannot be deleted from database.");
      return;
    }

    const confirmed = window.confirm(`Delete "${product.name}" permanently?`);
    if (!confirmed) return;

    setDeletingProductId(product.id);
    const result = await deleteProduct({
      data: {
        id: product.id,
      },
    });
    setDeletingProductId(null);

    if (!result.success) {
      setEditMessage(result.message);
      return;
    }

    if (editForm?.id === product.id) {
      setEditForm(null);
      setEditImageName("");
    }

    await refreshProducts();
    setEditMessage("Product deleted successfully.");
  }

  return (
    <div className="bg-muted/30 min-h-[calc(100vh-5rem)]">
      <section className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-6 flex items-center justify-end">
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2.5 text-sm font-semibold uppercase tracking-wide text-foreground hover:bg-muted transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 md:p-6 shadow-sm">
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

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => startEditing(item)}
                      className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-muted"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit / Restock
                    </button>
                    <button
                      type="button"
                      disabled={deletingProductId === item.id || !item.fromDb}
                      onClick={() => handleDeleteProduct(item)}
                      className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {deletingProductId === item.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
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
