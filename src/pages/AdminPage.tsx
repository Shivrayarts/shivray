import { Link, useNavigate } from "@/lib/spa-router";
import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import {
  ArrowDown,
  ArrowUp,
  Bell,
  Download,
  ChevronDown,
  ChevronRight,
  MessageSquareQuote,
  Film,
  ImagePlus,
  LayoutPanelTop,
  LogOut,
  Package,
  Plus,
  RefreshCcw,
  Save,
  Search,
  SquarePen,
  Shapes,
  ShoppingCart,
  Trash2,
  Upload,
  UserRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { homeContent as defaultHomeContent } from "@/data/home-content";
import type { Product, ProductOption } from "@/data/products";
import type { CatalogueType } from "@/lib/catalogue-types";
import { defaultCatalogueTypes } from "@/lib/catalogue-types";
import { changeAdminPassword, changeAdminUsername, logoutAdmin } from "@/lib/admin-auth";
import { resolveLocalizedText } from "@/lib/language";
import { parseCurrencyAmount } from "@/lib/utils";
import { isValidEmail, isValidName, isValidPhone } from "@/lib/form-validation";
import {
  deleteStoredProduct,
  saveStoredProduct,
  saveStoredCatalogueTypes,
  saveStoredHomeContent,
  saveStoredProducts,
  type HomeBanner,
  type HomeReview,
  type HomeVideo,
  useStoredCatalogueTypes,
  useStoredHomeContent,
  useStoredProducts,
} from "@/lib/content-store";
import {
  type CustomerProfile,
  type OrderStatus,
  saveStoredCustomers,
  updateOrderStatus,
  useStoredCustomers,
  useStoredOrders,
} from "@/lib/customer-orders";
import { toast } from "sonner";

const productTemplate: Product = {
  id: "",
  name: "",
  price: "",
  image: "",
  galleryImages: [],
  category: "Statues",
  tag: "",
  shortDescription: "",
  details: "",
  material: "",
  dimensions: "",
  historicalBackground: "",
  productOptions: [],
};

const catalogueTemplate: CatalogueType = {
  id: "",
  title: "",
  shortLabel: "",
  description: "",
  image: "",
  itemCountLabel: "",
  isActive: true,
  sortOrder: 1,
};

const bannerTemplate: HomeBanner = {
  id: "",
  eyebrow: "",
  titleTop: "",
  titleBottom: "",
  copy: "",
  image: "",
  mediaType: "image",
  videoUrl: "",
};

const reviewTemplate: HomeReview = {
  id: "",
  authorName: "",
  reviewText: "",
  rating: 5,
  location: "",
};

const videoTemplate: HomeVideo = {
  id: "",
  title: "",
  description: "",
  videoType: "reel",
  videoUrl: "",
  thumbnail: "",
};

const customerTemplate = {
  name: "",
  email: "",
  phone: "",
  address: "",
};

type AdminSection =
  | "dashboard"
  | "products"
  | "categories"
  | "banners"
  | "videos"
  | "orders"
  | "customers"
  | "reviews";

type ProductViewMode = "list" | "add";
type ProductSortBy = "newest" | "name-asc" | "name-desc" | "price-low" | "price-high";
type ProductPriceRange = "all" | "under-5000" | "5000-10000" | "10000-15000" | "15000-plus";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniqueId(prefix: string) {
  return `${prefix}-${Date.now()}`;
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(index, 1);
  next.splice(nextIndex, 0, item);
  return next;
}

function parseCurrencyValue(value: string) {
  return parseCurrencyAmount(value);
}

function formatCurrency(value: number) {
  return `Rs. ${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function normalizeDiscountValue(value: string) {
  const normalized = value.replace(/[^\d.]/g, "");
  if (!normalized) return "0";
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) return "0";
  return String(Math.min(parsed, 100));
}

function calculateOptionFinalPrice(price: string, discount: string) {
  const parsedPrice = parseCurrencyValue(price);
  const parsedDiscount = Number(normalizeDiscountValue(discount));
  if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) return "";
  const finalPrice = parsedPrice - parsedPrice * (parsedDiscount / 100);
  return finalPrice > 0 ? finalPrice.toFixed(2) : "0.00";
}

function createEmptyProductOption(): ProductOption {
  return {
    label: "",
    price: "",
    discount: "0",
    finalPrice: "",
  };
}

function cloneProductTemplate(): Product {
  return {
    ...productTemplate,
    galleryImages: [],
    productOptions: [],
    name: "",
    tag: "",
    shortDescription: "",
    details: "",
    material: "",
    dimensions: "",
    historicalBackground: "",
  };
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function escapeTsvValue(value: string) {
  return value.replace(/\t/g, " ").replace(/\r?\n/g, " ").trim();
}

function escapeCsvValue(value: string) {
  const normalized = value.replace(/\r?\n/g, " ").trim();
  return `"${normalized.replace(/"/g, '""')}"`;
}

function normalizeCategoryLabel(value: string) {
  return value.trim();
}

function isYoutubeUrl(value: string) {
  return /(youtube\.com|youtu\.be)/i.test(value);
}

function adminText(value: string | { en?: string; mr?: string }) {
  return typeof value === "string" ? value : value.en ?? value.mr ?? "";
}

function adminLocalizedText(value: string | { en?: string; mr?: string }) {
  if (typeof value === "string") return { en: value, mr: "" };
  return { en: value.en ?? "", mr: value.mr ?? "" };
}

function getStatusBadgeClass(status: OrderStatus) {
  if (status === "Pending") return "bg-[#eef2ff] text-[#4b4bc1]";
  if (status === "Processing") return "bg-[#fff1d0] text-[#a26f12]";
  if (status === "Shipped") return "bg-[#e6f5ff] text-[#2b6ca7]";
  if (status === "Delivered") return "bg-[#e9f7ec] text-[#2f7a34]";
  return "bg-[#ffe1e1] text-[#9f2b2b]";
}

async function fileToDataUrl(file: File, sizeLimitMb?: number) {
  if (sizeLimitMb && file.size > sizeLimitMb * 1024 * 1024) {
    throw new Error(`Please select a file smaller than ${sizeLimitMb} MB.`);
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Unable to read the selected file."));
    reader.readAsDataURL(file);
  });
}

async function imageFileToOptimizedDataUrl(
  file: File,
  {
    maxDimension = 1400,
    quality = 0.86,
    mimeType = "image/webp",
  }: {
    maxDimension?: number;
    quality?: number;
    mimeType?: string;
  } = {},
) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please select an image file.");
  }

  const originalDataUrl = await fileToDataUrl(file, 4);
  return new Promise<string>((resolve) => {
    const image = new Image();
    image.onload = () => {
      const width = image.naturalWidth || image.width;
      const height = image.naturalHeight || image.height;
      const largestSide = Math.max(width, height);
      const scale = largestSide > maxDimension ? maxDimension / largestSide : 1;
      const targetWidth = Math.max(1, Math.round(width * scale));
      const targetHeight = Math.max(1, Math.round(height * scale));

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const context = canvas.getContext("2d");
      if (!context) {
        resolve(originalDataUrl);
        return;
      }
      context.drawImage(image, 0, 0, targetWidth, targetHeight);
      resolve(canvas.toDataURL(mimeType, quality));
    };
    image.onerror = () => resolve(originalDataUrl);
    image.src = originalDataUrl;
  });
}

function ProductForm({
  value,
  categoryOptions,
  onChange,
  onSave,
  onPickFile,
  onPickGalleryFiles,
}: {
  value: Product;
  categoryOptions: string[];
  onChange: (value: Product) => void;
  onSave: () => void;
  onPickFile: (event: ChangeEvent<HTMLInputElement>) => void;
  onPickGalleryFiles: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  const localizedName = adminLocalizedText(value.name);
  const productOptions = value.productOptions ?? [];
  const selectedTag = adminText(value.tag);
  const hasProductOptions = productOptions.some(
    (option) => String(option.label || "").trim() || String(option.price || "").trim(),
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <input
          value={localizedName.en}
          onChange={(event) =>
            onChange({
              ...value,
              name: { ...localizedName, en: event.target.value },
            })
          }
          placeholder="Product name (English)"
          className="rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] outline-none"
        />
        <input
          value={localizedName.mr}
          onChange={(event) =>
            onChange({
              ...value,
              name: { ...localizedName, mr: event.target.value },
            })
          }
          placeholder="Product name (Marathi)"
          className="rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] outline-none"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          type="number"
          min="1"
          step="0.01"
          value={value.price}
          onChange={(event) => onChange({ ...value, price: event.target.value })}
          placeholder={hasProductOptions ? "Auto from options" : "5100"}
          disabled={hasProductOptions}
          className={`rounded-2xl border px-4 py-3 text-sm text-[#34180e] outline-none ${
            hasProductOptions
              ? "cursor-not-allowed border-[#e7ddd0] bg-[#f4efe8] text-[#8b6c52]"
              : "border-[#eadbc8] bg-[#fcf8f2]"
          }`}
        />
      </div>
      {hasProductOptions ? (
        <p className="-mt-1 text-xs text-[#8b6c52]">Base price is calculated automatically from the lowest final option price.</p>
      ) : null}
      <div className="rounded-[24px] border border-[#eadbc8] bg-[#fffdf9] p-4">
        <div className="mb-4">
          <p className="text-sm font-semibold text-[#34180e]">Product Options (Weight/Size, Price, Discount)</p>
          <p className="mt-1 text-xs text-[#8b6c52]">Add multiple rows if this product has different sizes or weights.</p>
        </div>
        <div className="space-y-3">
          {productOptions.map((option, index) => (
            <div key={`product-option-${index}`} className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_1fr_auto] md:items-center">
              <input
                value={option.label}
                onChange={(event) =>
                  onChange({
                    ...value,
                    productOptions: productOptions.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, label: event.target.value } : item,
                    ),
                  })
                }
                placeholder="Weight/Size"
                className="rounded-2xl border border-[#eadbc8] bg-white px-4 py-3 text-sm text-[#34180e] outline-none"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={option.price}
                onChange={(event) => {
                  const nextPrice = event.target.value;
                  onChange({
                    ...value,
                    productOptions: productOptions.map((item, itemIndex) =>
                      itemIndex === index
                        ? {
                            ...item,
                            price: nextPrice,
                            finalPrice: calculateOptionFinalPrice(nextPrice, item.discount),
                          }
                        : item,
                    ),
                  });
                }}
                placeholder="Price"
                className="rounded-2xl border border-[#eadbc8] bg-white px-4 py-3 text-sm text-[#34180e] outline-none"
              />
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={option.discount}
                onChange={(event) => {
                  const nextDiscount = normalizeDiscountValue(event.target.value);
                  onChange({
                    ...value,
                    productOptions: productOptions.map((item, itemIndex) =>
                      itemIndex === index
                        ? {
                            ...item,
                            discount: nextDiscount,
                            finalPrice: calculateOptionFinalPrice(item.price, nextDiscount),
                          }
                        : item,
                    ),
                  });
                }}
                placeholder="Discount %"
                className="rounded-2xl border border-[#eadbc8] bg-white px-4 py-3 text-sm text-[#34180e] outline-none"
              />
              <input
                value={option.finalPrice}
                readOnly
                placeholder="Final Price"
                className="rounded-2xl border border-[#eadbc8] bg-[#f8fafc] px-4 py-3 text-sm text-[#34180e] outline-none"
              />
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...value,
                    productOptions: productOptions.filter((_, itemIndex) => itemIndex !== index),
                  })
                }
                className="rounded-xl border border-[#ffe1e1] bg-[#fff3f3] px-3 py-3 text-xs font-semibold text-[#9f2b2b]"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            onChange({
              ...value,
              productOptions: [...productOptions, createEmptyProductOption()],
            })
          }
          className="mt-4 rounded-xl border border-[#7c5cff] px-4 py-2 text-sm font-semibold text-[#7c5cff]"
        >
          + Add Another Option
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <select
          value={value.category}
          onChange={(event) =>
            onChange({
              ...value,
              category: event.target.value as Product["category"],
            })
          }
          className="rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] outline-none"
        >
          {(categoryOptions.length ? categoryOptions : [value.category || "General"]).map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <select
          value={selectedTag}
          onChange={(event) => onChange({ ...value, tag: event.target.value })}
          className="rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] outline-none"
        >
          <option value="">Select tag</option>
          <option value="Featured">Featured</option>
          <option value="New">New</option>
          <option value="Popular">Popular</option>
        </select>
      </div>
      <input
        type="hidden"
        value={value.image}
        readOnly
      />
      <label className="block rounded-2xl border border-dashed border-[#d8b48b] bg-[#fffaf4] p-4 text-sm text-[#6c4b33]">
        <span className="mb-2 flex items-center gap-2 font-semibold text-[#34180e]">
          <Upload className="h-4 w-4" />
          Choose product cover image
        </span>
        <p className="mb-2 text-xs text-[#8b6c52]">
          Pick a JPG/PNG/WebP image from your device.
        </p>
        <input type="file" accept="image/*" onChange={onPickFile} className="mt-2 block w-full text-sm" />
      </label>
      {value.image ? (
        <div className="rounded-xl border border-[#eadbc8] bg-white p-2">
          <img src={value.image} alt="Product cover" className="h-36 w-full rounded-lg object-cover" />
        </div>
      ) : null}
      <label className="block rounded-2xl border border-dashed border-[#d8b48b] bg-[#fffaf4] p-4 text-sm text-[#6c4b33]">
        <span className="mb-2 flex items-center gap-2 font-semibold text-[#34180e]">
          <ImagePlus className="h-4 w-4" />
          Upload product gallery images (optional, max 4)
        </span>
        <p className="mb-2 text-xs text-[#8b6c52]">
          Select 1-4 images to build product gallery.
        </p>
        <input type="file" accept="image/*" multiple onChange={onPickGalleryFiles} className="mt-2 block w-full text-sm" />
      </label>
      <div className="rounded-xl border border-[#eadbc8] bg-white p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-[#34180e]">Selected gallery images</p>
          <span className="rounded-full bg-[#fff1d9] px-2 py-1 text-xs font-semibold text-[#8b4d1d]">
            {(value.galleryImages ?? []).length}/4
          </span>
        </div>
        {(value.galleryImages ?? []).length ? (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {(value.galleryImages ?? []).map((image, index) => (
              <div key={`${image}-${index}`} className="rounded-xl border border-[#eadbc8] bg-white p-2">
                <div className="mb-2 inline-flex rounded-full bg-[#f4f2ff] px-2 py-1 text-[11px] font-semibold text-[#5e4bb2]">
                  Image {index + 1}
                </div>
                <img src={image} alt={`Gallery ${index + 1}`} className="h-24 w-full rounded-lg object-cover" />
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...value,
                      galleryImages: (value.galleryImages ?? []).filter((_, itemIndex) => itemIndex !== index),
                    })
                  }
                  className="mt-2 w-full rounded-lg border border-[#ffe1e1] bg-[#fff3f3] px-2 py-1 text-xs font-semibold text-[#9f2b2b]"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#8b6c52]">No gallery images selected yet.</p>
        )}
      </div>
      <textarea
        value={adminText(value.shortDescription)}
        onChange={(event) => onChange({ ...value, shortDescription: event.target.value })}
        rows={3}
        placeholder="Short description"
        className="w-full rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] outline-none"
      />
      <textarea
        value={adminText(value.details)}
        onChange={(event) => onChange({ ...value, details: event.target.value })}
        rows={4}
        placeholder="Full details"
        className="w-full rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] outline-none"
      />
      <div className="grid gap-4 md:grid-cols-2">
        <textarea
          value={adminLocalizedText(value.historicalBackground ?? "").en}
          onChange={(event) =>
            onChange({
              ...value,
              historicalBackground: {
                ...adminLocalizedText(value.historicalBackground ?? ""),
                en: event.target.value,
              },
            })
          }
          rows={6}
          placeholder="Historical background (English)"
          className="w-full rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] outline-none"
        />
        <textarea
          value={adminLocalizedText(value.historicalBackground ?? "").mr}
          onChange={(event) =>
            onChange({
              ...value,
              historicalBackground: {
                ...adminLocalizedText(value.historicalBackground ?? ""),
                mr: event.target.value,
              },
            })
          }
          rows={6}
          placeholder="Historical background (Marathi)"
          className="w-full rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] outline-none"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          value={adminText(value.material)}
          onChange={(event) => onChange({ ...value, material: event.target.value })}
          placeholder="Material"
          className="rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] outline-none"
        />
        <input
          value={adminText(value.dimensions)}
          onChange={(event) => onChange({ ...value, dimensions: event.target.value })}
          placeholder="Dimensions"
          className="rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] outline-none"
        />
      </div>
      <button
        type="button"
        onClick={onSave}
        className="inline-flex items-center gap-2 rounded-full bg-[#34180e] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white"
      >
        <Save className="h-4 w-4" />
        Save Product
      </button>
    </div>
  );
}

function CatalogueForm({
  value,
  onChange,
  onSave,
  onPickImageFile,
}: {
  value: CatalogueType;
  onChange: (value: CatalogueType) => void;
  onSave: () => void;
  onPickImageFile: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <input
          value={adminText(value.title)}
          onChange={(event) => onChange({ ...value, title: event.target.value })}
          placeholder="Category title"
          className="rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] outline-none"
        />
        <input
          value={adminText(value.shortLabel)}
          onChange={(event) => onChange({ ...value, shortLabel: event.target.value })}
          placeholder="Short label"
          className="rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] outline-none"
        />
      </div>
      <input
        value={adminText(value.itemCountLabel)}
        onChange={(event) => onChange({ ...value, itemCountLabel: event.target.value })}
        placeholder="170 products"
        className="w-full rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] outline-none"
      />
      <label className="block rounded-2xl border border-dashed border-[#d8b48b] bg-[#fffaf4] p-4 text-sm text-[#6c4b33]">
        <span className="mb-2 flex items-center gap-2 font-semibold text-[#34180e]">
          <Upload className="h-4 w-4" />
          Choose category image
        </span>
        <p className="mb-2 text-xs text-[#8b6c52]">Pick a JPG/PNG/WebP image from your device.</p>
        <input type="file" accept="image/*" onChange={onPickImageFile} className="mt-2 block w-full text-sm" />
      </label>
      {value.image ? (
        <div className="rounded-xl border border-[#eadbc8] bg-white p-2">
          <img src={value.image} alt="Category preview" className="h-36 w-full rounded-lg object-cover" />
        </div>
      ) : null}
      <textarea
        value={adminText(value.description)}
        onChange={(event) => onChange({ ...value, description: event.target.value })}
        rows={4}
        placeholder="Description"
        className="w-full rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] outline-none"
      />
      <label className="flex items-center gap-3 text-sm font-medium text-[#34180e]">
        <input
          type="checkbox"
          checked={value.isActive}
          onChange={(event) => onChange({ ...value, isActive: event.target.checked })}
        />
        Show this category on the storefront
      </label>
      <button
        type="button"
        onClick={onSave}
        className="inline-flex items-center gap-2 rounded-full bg-[#34180e] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white"
      >
        <Save className="h-4 w-4" />
        Save Category
      </button>
    </div>
  );
}

function BannerForm({
  value,
  onChange,
  onSave,
  onPickFile,
}: {
  value: HomeBanner;
  onChange: (value: HomeBanner) => void;
  onSave: () => void;
  onPickFile: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  const selectedType = value.mediaType ?? "image";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] p-1">
        {(["image", "video"] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onChange({ ...value, mediaType: type })}
            className={`rounded-xl px-4 py-3 text-sm font-semibold capitalize transition ${
              selectedType === type ? "bg-[#34180e] text-white" : "text-[#6c4b33] hover:bg-white"
            }`}
          >
            {type} Banner
          </button>
        ))}
      </div>
      <label className="block rounded-2xl border border-dashed border-[#d8b48b] bg-[#fffaf4] p-4 text-sm text-[#6c4b33]">
        <span className="mb-2 flex items-center gap-2 font-semibold text-[#34180e]">
          <Upload className="h-4 w-4" />
          {selectedType === "video" ? "Upload banner video file" : "Upload banner image file"}
        </span>
        <p className="mb-2 text-xs text-[#8b6c52]">
          {selectedType === "video"
            ? "Pick a short MP4/WebM hero video. Large files may not save in browser storage."
            : "Pick a single image file to replace the homepage banner."}
        </p>
        <input type="file" accept={selectedType === "video" ? "video/*" : "image/*"} onChange={onPickFile} className="mt-2 block w-full text-sm" />
      </label>
      <button
        type="button"
        onClick={onSave}
        className="inline-flex items-center gap-2 rounded-full bg-[#34180e] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white"
      >
        <Save className="h-4 w-4" />
        Save Banner
      </button>
    </div>
  );
}

function VideoForm({
  value,
  onChange,
  onSave,
  onPickFile,
  onPickThumbnailFile,
}: {
  value: HomeVideo;
  onChange: (value: HomeVideo) => void;
  onSave: () => void;
  onPickFile: (event: ChangeEvent<HTMLInputElement>) => void;
  onPickThumbnailFile: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-4">
      <input
        value={adminText(value.title)}
        onChange={(event) => onChange({ ...value, title: event.target.value })}
        placeholder="Video title"
        className="w-full rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] outline-none"
      />
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-[#34180e]">
          <span>Content format</span>
          <select
            value={value.videoType}
            onChange={(event) =>
              onChange({
                ...value,
                videoType: event.target.value as HomeVideo["videoType"],
              })
            }
            className="w-full rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] outline-none"
          >
            <option value="reel">Reel / Short Video</option>
            <option value="youtube">YouTube Video</option>
          </select>
        </label>
        <label className="block rounded-2xl border border-dashed border-[#d8b48b] bg-[#fffaf4] p-4 text-sm text-[#6c4b33]">
          <span className="mb-2 flex items-center gap-2 font-semibold text-[#34180e]">
            <ImagePlus className="h-4 w-4" />
            Choose thumbnail image (optional)
          </span>
          <input type="file" accept="image/*" onChange={onPickThumbnailFile} className="mt-2 block w-full text-sm" />
        </label>
      </div>
      {value.thumbnail ? (
        <div className="rounded-xl border border-[#eadbc8] bg-white p-2">
          <img src={value.thumbnail} alt="Video thumbnail preview" className="h-36 w-full rounded-lg object-cover" />
        </div>
      ) : null}
      {value.videoType === "youtube" ? (
        <input
          value={value.videoUrl}
          onChange={(event) => onChange({ ...value, videoUrl: event.target.value })}
          placeholder="Paste YouTube link"
          className="w-full rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] outline-none"
        />
      ) : (
        <input
          value={value.videoUrl}
          onChange={(event) => onChange({ ...value, videoUrl: event.target.value })}
          placeholder="Direct MP4/WebM reel URL or uploaded file data"
          className="w-full rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] outline-none"
        />
      )}
      {value.videoType === "reel" ? (
      <label className="block rounded-2xl border border-dashed border-[#d8b48b] bg-[#fffaf4] p-4 text-sm text-[#6c4b33]">
        <span className="mb-2 flex items-center gap-2 font-semibold text-[#34180e]">
          <Upload className="h-4 w-4" />
          Upload reel file
        </span>
        <p className="mb-2 text-xs text-[#8b6c52]">
          Upload a small vertical MP4/WebM file. Browser storage is limited on static hosting.
        </p>
        <input type="file" accept="video/*" onChange={onPickFile} className="mt-2 block w-full text-sm" />
      </label>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#d8b48b] bg-[#fffaf4] p-4 text-sm text-[#6c4b33]">
          Paste a standard YouTube watch link, share link, or embed link. It will render as an embedded player on the homepage.
        </div>
      )}
      <textarea
        value={adminText(value.description)}
        onChange={(event) => onChange({ ...value, description: event.target.value })}
        rows={4}
        placeholder="Video description"
        className="w-full rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] outline-none"
      />
      <button
        type="button"
        onClick={onSave}
        className="inline-flex items-center gap-2 rounded-full bg-[#34180e] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white"
      >
        <Save className="h-4 w-4" />
        Save Video
      </button>
    </div>
  );
}

function ReviewForm({
  value,
  onChange,
  onSave,
}: {
  value: HomeReview;
  onChange: (value: HomeReview) => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <input
          value={resolveLocalizedText(value.authorName, "en")}
          onChange={(event) => onChange({ ...value, authorName: event.target.value })}
          placeholder="Author name"
          className="rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] outline-none"
        />
        <input
          value={adminText(value.location)}
          onChange={(event) => onChange({ ...value, location: event.target.value })}
          placeholder="Location"
          className="rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] outline-none"
        />
      </div>
      <input
        type="number"
        min={1}
        max={5}
        value={value.rating}
        onChange={(event) =>
          onChange({
            ...value,
            rating: Math.max(1, Math.min(5, Number(event.target.value) || 1)),
          })
        }
        placeholder="Rating"
        className="w-full rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] outline-none"
      />
      <textarea
        value={adminText(value.reviewText)}
        onChange={(event) => onChange({ ...value, reviewText: event.target.value })}
        rows={5}
        placeholder="Review text"
        className="w-full rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] outline-none"
      />
      <button
        type="button"
        onClick={onSave}
        className="inline-flex items-center gap-2 rounded-full bg-[#34180e] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white"
      >
        <Save className="h-4 w-4" />
        Save Review
      </button>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-[10px] border border-[#e4e4e4] bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-[#8f98a4]">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-[#0f172a]">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f2f3ff] text-[#a68acb]">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const navigate = useNavigate();
  const products = useStoredProducts();
  const catalogueTypes = useStoredCatalogueTypes();
  const storedHomeContent = useStoredHomeContent();
  const customers = useStoredCustomers();
  const orders = useStoredOrders();

  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  const [productDraft, setProductDraft] = useState<Product>(productTemplate);
  const [catalogueDraft, setCatalogueDraft] = useState<CatalogueType>(catalogueTemplate);
  const [bannerDraft, setBannerDraft] = useState<HomeBanner>(bannerTemplate);
  const [reviewDraft, setReviewDraft] = useState<HomeReview>(reviewTemplate);
  const [videoDraft, setVideoDraft] = useState<HomeVideo>(videoTemplate);
  const [orderStatusFilter, setOrderStatusFilter] = useState<"All" | OrderStatus>("All");
  const [orderSearch, setOrderSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [productViewMode, setProductViewMode] = useState<ProductViewMode>("list");
  const [showAddCustomerForm, setShowAddCustomerForm] = useState(false);
  const [customerDraft, setCustomerDraft] = useState(customerTemplate);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [productFiltersDraft, setProductFiltersDraft] = useState({
    category: "all",
    brand: "all",
    sortBy: "newest" as ProductSortBy,
    priceRange: "all" as ProductPriceRange,
  });
  const [productFilters, setProductFilters] = useState({
    category: "all",
    brand: "all",
    sortBy: "newest" as ProductSortBy,
    priceRange: "all" as ProductPriceRange,
  });
  const [productFilterPanels, setProductFilterPanels] = useState({
    categories: true,
    brands: true,
    pricing: true,
  });
  const [productsExpanded, setProductsExpanded] = useState(false);
  const [ordersExpanded, setOrdersExpanded] = useState(false);
  const [showLegacyProductList] = useState(false);
  const [mediaNotice, setMediaNotice] = useState("");
  const [bannerNotice, setBannerNotice] = useState("");
  const [showPasswordPanel, setShowPasswordPanel] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [changingUsername, setChangingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [usernameSuccess, setUsernameSuccess] = useState("");
  const [usernameForm, setUsernameForm] = useState({
    newUsername: "",
    currentPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordForm, setPasswordForm] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const orderedCatalogues = useMemo(
    () => [...catalogueTypes].sort((a, b) => a.sortOrder - b.sortOrder),
    [catalogueTypes],
  );

  const orderTotalValue = useMemo(
    () => orders.reduce((sum, order) => sum + parseCurrencyValue(order.totalPrice), 0),
    [orders],
  );

  const averageOrderValue = orders.length ? orderTotalValue / orders.length : 0;

  const enrichedCustomers = useMemo(
    () =>
      customers.map((customer) => {
        const customerOrders = orders.filter((order) => order.customerId === customer.id);
        const totalSpent = customerOrders.reduce(
          (sum, order) => sum + parseCurrencyValue(order.totalPrice),
          0,
        );

        return {
          ...customer,
          ordersCount: customerOrders.length,
          totalSpent,
        };
      }),
    [customers, orders],
  );

  const filteredOrders = useMemo(() => {
    const search = orderSearch.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        orderStatusFilter === "All" ? true : order.status === orderStatusFilter;
      const haystack = [
        order.id,
        order.customerName,
        order.customerEmail,
        order.paymentInfo,
        order.totalPrice,
      ]
        .join(" ")
        .toLowerCase();

      return matchesStatus && (!search || haystack.includes(search));
    });
  }, [orderSearch, orderStatusFilter, orders]);

  const filteredCustomers = useMemo(() => {
    const search = customerSearch.trim().toLowerCase();
    return enrichedCustomers.filter((customer) => {
      if (!search) return true;
      return [customer.name, customer.email, customer.phone, customer.address]
        .join(" ")
        .toLowerCase()
        .includes(search);
    });
  }, [customerSearch, enrichedCustomers]);

  const notifications = useMemo(() => {
    const pendingOrders = orders.filter((order) => order.status === "Pending").length;
    const processingOrders = orders.filter((order) => order.status === "Processing").length;
    const items: string[] = [];
    if (pendingOrders > 0) items.push(`${pendingOrders} pending order(s) need attention.`);
    if (processingOrders > 0) items.push(`${processingOrders} processing order(s) are in progress.`);
    if (mediaNotice) items.push(mediaNotice);
    if (items.length === 0) items.push("No new notifications.");
    return items;
  }, [orders, mediaNotice]);

  const stats = useMemo(
    () => [
      { label: "Customers", value: customers.length, icon: UserRound },
      { label: "Orders", value: orders.length, icon: ShoppingCart },
      { label: "Avg Sale", value: formatCurrency(averageOrderValue), icon: Wallet },
      { label: "Total Sale", value: formatCurrency(orderTotalValue), icon: Wallet },
      { label: "Total Products", value: products.length, icon: Package },
    ],
    [averageOrderValue, customers.length, orderTotalValue, orders.length, products.length],
  );

  const sectionTitle =
    {
    dashboard: "Dashboard",
    products: "Products",
    categories: "Categories",
    banners: "Home Banners",
    videos: "Featured Videos",
    orders: "Orders",
    customers: "Customers",
    reviews: "Customer Reviews",
    }[activeSection] ?? "Dashboard";

  const availableProductBrands = useMemo(() => {
    const brands = Array.from(
      new Set(
        products
          .map((product) => adminText(product.tag).trim())
          .filter(Boolean),
      ),
    );
    return brands.sort((a, b) => a.localeCompare(b));
  }, [products]);

  const availableProductCategories = useMemo(() => {
    const fromCatalogues = orderedCatalogues
      .filter((catalogue) => catalogue.isActive)
      .map((catalogue) => adminText(catalogue.shortLabel).trim())
      .filter(Boolean);
    const fromProducts = products.map((product) => String(product.category || "").trim()).filter(Boolean);
    return Array.from(new Set([...fromCatalogues, ...fromProducts])).sort((a, b) => a.localeCompare(b));
  }, [orderedCatalogues, products]);

  const filteredProducts = useMemo(() => {
    const matchesPriceRange = (priceValue: number) => {
      if (productFilters.priceRange === "under-5000") return priceValue < 5000;
      if (productFilters.priceRange === "5000-10000") return priceValue >= 5000 && priceValue <= 10000;
      if (productFilters.priceRange === "10000-15000") return priceValue > 10000 && priceValue <= 15000;
      if (productFilters.priceRange === "15000-plus") return priceValue > 15000;
      return true;
    };

    const next = products.filter((product) => {
      const categoryMatch =
        productFilters.category === "all" || product.category === productFilters.category;
      const brandValue = adminText(product.tag).trim();
      const brandMatch =
        productFilters.brand === "all" || brandValue === productFilters.brand;
      const priceValue = parseCurrencyValue(product.price);
      return categoryMatch && brandMatch && matchesPriceRange(priceValue);
    });

    next.sort((a, b) => {
      if (productFilters.sortBy === "name-asc") {
        return resolveLocalizedText(a.name, "en").localeCompare(resolveLocalizedText(b.name, "en"));
      }
      if (productFilters.sortBy === "name-desc") {
        return resolveLocalizedText(b.name, "en").localeCompare(resolveLocalizedText(a.name, "en"));
      }
      if (productFilters.sortBy === "price-low") {
        return parseCurrencyValue(a.price) - parseCurrencyValue(b.price);
      }
      if (productFilters.sortBy === "price-high") {
        return parseCurrencyValue(b.price) - parseCurrencyValue(a.price);
      }
      return 0;
    });

    return next;
  }, [productFilters, products]);

  const spotlightOptionProducts = useMemo(() => {
    const byId = new Map<string, Product>();
    for (const item of products) byId.set(item.id, item);

    const draftId = String(productDraft.id || "").trim();
    const draftName = adminText(productDraft.name).trim();
    if (draftId && draftName && !byId.has(draftId)) {
      byId.set(draftId, productDraft);
    }

    return Array.from(byId.values()).sort((a, b) =>
      resolveLocalizedText(a.name, "en").localeCompare(resolveLocalizedText(b.name, "en")),
    );
  }, [products, productDraft]);

  function showSaveError(message: string) {
    setMediaNotice(message);
    toast.error(message);
  }

  function handleLogout() {
    logoutAdmin();
    navigate({ to: "/admin" });
  }

  async function handleAdminPasswordChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    const email = passwordForm.email.trim().toLowerCase();
    if (!isValidEmail(email)) {
      setPasswordError("Enter a valid admin email.");
      return;
    }
    if (!passwordForm.currentPassword.trim()) {
      setPasswordError("Enter your current password.");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (passwordForm.newPassword === passwordForm.currentPassword) {
      setPasswordError("New password must be different from current password.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    setChangingPassword(true);
    try {
      await changeAdminPassword(email, passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordSuccess("Password changed successfully.");
      setPasswordForm({
        email,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : "Unable to change password right now.");
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleAdminUsernameChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUsernameError("");
    setUsernameSuccess("");

    const newUsername = usernameForm.newUsername.trim();
    if (newUsername.length < 2) {
      setUsernameError("New username must be at least 2 characters.");
      return;
    }
    if (!usernameForm.currentPassword.trim()) {
      setUsernameError("Enter your current password to confirm.");
      return;
    }

    setChangingUsername(true);
    try {
      await changeAdminUsername(usernameForm.currentPassword, newUsername);
      setUsernameSuccess("Username changed successfully.");
      setUsernameForm({
        newUsername: "",
        currentPassword: "",
      });
    } catch (error) {
      setUsernameError(error instanceof Error ? error.message : "Unable to change username right now.");
    } finally {
      setChangingUsername(false);
    }
  }

  function applyProductFilters() {
    setProductFilters(productFiltersDraft);
  }

  function resetProductFilters() {
    const reset = {
      category: "all",
      brand: "all",
      sortBy: "newest" as ProductSortBy,
      priceRange: "all" as ProductPriceRange,
    };
    setProductFiltersDraft(reset);
    setProductFilters(reset);
  }

  async function deleteProduct(productId: string) {
    const saved = await deleteStoredProduct(productId);
    if (!saved) {
      setMediaNotice("Unable to delete product right now. Please try again.");
      toast.error("Unable to delete product right now. Please try again.");
      return;
    }
    setMediaNotice("Product deleted successfully.");
    toast.success("Product deleted successfully.");
  }

  async function reorderProduct(index: number, delta: -1 | 1) {
    const nextProducts = moveItem(products, index, delta);
    const saved = await saveStoredProducts(nextProducts);
    if (!saved) {
      setMediaNotice("Unable to reorder products right now. Please try again.");
      return;
    }
    setMediaNotice("Product order updated successfully.");
  }

  async function deleteCategory(catalogueId: string) {
    const categoryToDelete = orderedCatalogues.find((catalogue) => catalogue.id === catalogueId);
    if (!categoryToDelete) return;

    const remainingCategories = orderedCatalogues.filter((catalogue) => catalogue.id !== catalogueId);
    const normalizedRemaining = remainingCategories.map((catalogue, index) => ({
      ...catalogue,
      sortOrder: index + 1,
    }));
    const categorySaved = await saveStoredCatalogueTypes(normalizedRemaining);
    if (!categorySaved) {
      setMediaNotice("Unable to remove category right now. Please try again.");
      return;
    }

    const deletedLabel = normalizeCategoryLabel(adminText(categoryToDelete.shortLabel));
    const fallbackCategory =
      normalizeCategoryLabel(adminText(normalizedRemaining.find((catalogue) => catalogue.isActive)?.shortLabel || "")) ||
      "General";
    if (deletedLabel) {
      const migratedProducts = products.map((product) =>
        normalizeCategoryLabel(String(product.category || "")) === deletedLabel
          ? { ...product, category: fallbackCategory }
          : product,
      );
      const productsSaved = await saveStoredProducts(migratedProducts);
      if (!productsSaved) {
        setMediaNotice("Category removed, but product migration failed to sync. Please retry.");
        return;
      }
    }

    if (catalogueDraft.id === catalogueId) {
      setCatalogueDraft(catalogueTemplate);
    }
    setMediaNotice(`Category removed. Related products moved to "${fallbackCategory}".`);
  }

  async function saveProduct() {
    setMediaNotice("");
    const englishName = adminText(productDraft.name).trim();
    const marathiName = adminLocalizedText(productDraft.name).mr.trim();
    const historicalBackground = adminLocalizedText(productDraft.historicalBackground ?? "");
    const category = normalizeCategoryLabel(String(productDraft.category || ""));
    const coverImage = String(productDraft.image || "").trim();

    if (!englishName) {
      showSaveError("Product name (English) is required.");
      return;
    }
    if (!category) {
      showSaveError("Please select a product category.");
      return;
    }
    if (!coverImage) {
      showSaveError("Please add a cover image for this product.");
      return;
    }

    const normalizedOptions = (productDraft.productOptions ?? [])
      .map((option) => {
        const label = String(option.label || "").trim();
        const price = String(option.price || "").trim();
        const discount = normalizeDiscountValue(String(option.discount || "0"));
        const finalPrice = calculateOptionFinalPrice(price, discount);

        return {
          label,
          price,
          discount,
          finalPrice,
        };
      })
      .filter((option) => option.label || option.price || option.discount !== "0" || option.finalPrice);
    const validOptions = normalizedOptions.filter(
      (option) => option.label && parseCurrencyValue(option.price) > 0 && parseCurrencyValue(option.finalPrice) > 0,
    );

    if (normalizedOptions.length !== validOptions.length) {
      showSaveError("Each product option needs a weight/size and valid price.");
      return;
    }

    const derivedBasePrice =
      validOptions.length > 0
        ? Math.min(...validOptions.map((option) => parseCurrencyValue(option.finalPrice))).toFixed(2)
        : productDraft.price;
    const normalizedPriceValue = parseCurrencyValue(derivedBasePrice);
    if (!Number.isFinite(normalizedPriceValue) || normalizedPriceValue <= 0) {
      showSaveError("Please enter a valid product price greater than 0.");
      return;
    }
    const normalizedPrice = normalizedPriceValue.toFixed(2);

    const baseProductId = productDraft.id || slugify(englishName) || uniqueId("product");
    const nextProductId =
      productDraft.id || !products.some((item) => item.id === baseProductId)
        ? baseProductId
        : `${baseProductId}-${Date.now()}`;

    const nextProduct: Product = {
      ...productDraft,
      name: { en: englishName, mr: marathiName },
      category,
      image: coverImage,
      price: normalizedPrice,
      galleryImages: (productDraft.galleryImages ?? []).filter(Boolean).slice(0, 4),
      productOptions: validOptions,
      historicalBackground: {
        en: historicalBackground.en.trim(),
        mr: historicalBackground.mr.trim(),
      },
      id: nextProductId,
    };

    const saved = await saveStoredProduct(nextProduct);
    if (!saved) {
      setMediaNotice("Unable to save product to backend right now. Please try again.");
      toast.error("Unable to save product to backend right now. Please try again.");
      return;
    }
    setProductDraft(nextProduct);
    setProductViewMode("list");
    setMediaNotice(`Product "${englishName}" saved successfully.`);
    toast.success(`Product "${englishName}" saved successfully.`);
  }

  function downloadCustomersExcel() {
    if (filteredCustomers.length === 0) {
      setMediaNotice("No customers available to export.");
      return;
    }

    const headers = [
      "Customer Name",
      "Email",
      "Phone",
      "Address",
      "Orders",
      "Total Spend",
      "Last Login",
    ];

    const rows = filteredCustomers.map((customer) => [
      escapeCsvValue(customer.name || ""),
      escapeCsvValue(customer.email || ""),
      escapeCsvValue(customer.phone || ""),
      escapeCsvValue(customer.address || ""),
      escapeCsvValue(String(customer.ordersCount ?? 0)),
      escapeCsvValue(formatCurrency(customer.totalSpent ?? 0)),
      escapeCsvValue(formatDate(customer.lastLoginAt || "")),
    ]);

    const csv = [headers.map(escapeCsvValue), ...rows].map((line) => line.join(",")).join("\n");
    const blob = new Blob(["\ufeff", csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const dateStamp = new Date().toISOString().slice(0, 10);
    anchor.href = url;
    anchor.download = `customers-${dateStamp}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    setMediaNotice(`Exported ${filteredCustomers.length} customer(s) to Excel.`);
  }

  function saveCustomer() {
    const name = customerDraft.name.trim();
    const email = customerDraft.email.trim().toLowerCase();
    const phone = customerDraft.phone.trim();
    const address = customerDraft.address.trim();

    if (!isValidName(name)) {
      setMediaNotice("Please enter a valid customer name.");
      return;
    }
    if (!isValidEmail(email)) {
      setMediaNotice("Please enter a valid customer email.");
      return;
    }
    if (phone && !isValidPhone(phone)) {
      setMediaNotice("Please enter a valid 10-digit phone number.");
      return;
    }

    const duplicate = customers.find(
      (customer) =>
        customer.email.trim().toLowerCase() === email &&
        customer.id !== editingCustomerId,
    );
    if (duplicate) {
      setMediaNotice("A customer with this email already exists.");
      return;
    }

    const now = new Date().toISOString();
    if (editingCustomerId) {
      const nextCustomers = customers.map((customer) =>
        customer.id === editingCustomerId
          ? {
              ...customer,
              name,
              email,
              phone,
              address,
              lastLoginAt: customer.lastLoginAt || now,
            }
          : customer,
      );
      saveStoredCustomers(nextCustomers);
      setMediaNotice(`Customer "${name}" updated successfully.`);
    } else {
      const nextCustomer: CustomerProfile = {
        id: `customer-${email.replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
        name,
        email,
        phone,
        address,
        createdAt: now,
        lastLoginAt: now,
      };
      saveStoredCustomers([nextCustomer, ...customers]);
      setMediaNotice(`Customer "${name}" added successfully.`);
    }

    setCustomerDraft(customerTemplate);
    setShowAddCustomerForm(false);
    setEditingCustomerId(null);
  }

  function editCustomer(customer: CustomerProfile) {
    setEditingCustomerId(customer.id);
    setCustomerDraft({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
    });
    setShowAddCustomerForm(true);
  }

  async function updateSpotlightProduct(index: number, productId: string) {
    const nextSpotlight = [...(storedHomeContent.spotlightProductIds ?? [])];
    while (nextSpotlight.length < 4) nextSpotlight.push("");
    nextSpotlight[index] = productId;
    const saved = await saveStoredHomeContent({
      ...storedHomeContent,
      spotlightProductIds: nextSpotlight.filter(Boolean),
    });
    if (!saved) {
      setMediaNotice("Unable to update homepage best-selling products right now. Please try again.");
      return;
    }
    setMediaNotice("Homepage best-selling products updated.");
  }

  async function saveCatalogue() {
    const title = adminText(catalogueDraft.title).trim();
    const shortLabel = normalizeCategoryLabel(adminText(catalogueDraft.shortLabel).trim());
    if (!title) {
      setMediaNotice("Category title is required.");
      return;
    }
    if (!shortLabel) {
      setMediaNotice("Category short label is required.");
      return;
    }

    const duplicateLabel = orderedCatalogues.find(
      (item) =>
        item.id !== catalogueDraft.id &&
        adminText(item.shortLabel).trim().toLowerCase() === shortLabel.toLowerCase(),
    );
    if (duplicateLabel) {
      setMediaNotice("Another category already uses the same short label.");
      return;
    }

    const nextCatalogue: CatalogueType = {
      ...catalogueDraft,
      title,
      shortLabel,
      id:
        catalogueDraft.id ||
        `${slugify(title || shortLabel)}-catalogue` ||
        uniqueId("catalogue"),
      sortOrder: catalogueDraft.sortOrder || orderedCatalogues.length + 1,
    };

    const next = [...orderedCatalogues];
    const existingIndex = next.findIndex((item) => item.id === nextCatalogue.id);
    const previousLabel =
      existingIndex >= 0 ? normalizeCategoryLabel(adminText(next[existingIndex].shortLabel)) : "";

    if (existingIndex >= 0) next[existingIndex] = nextCatalogue;
    else next.push(nextCatalogue);

    const categorySaved = await saveStoredCatalogueTypes(next.map((item, index) => ({ ...item, sortOrder: index + 1 })));
    if (!categorySaved) {
      setMediaNotice("Unable to save category right now. Please try again.");
      toast.error("Unable to save category right now. Please try again.");
      return;
    }
    if (previousLabel && previousLabel !== shortLabel) {
      const migratedProducts = products.map((product) =>
        normalizeCategoryLabel(String(product.category || "")) === previousLabel
          ? { ...product, category: shortLabel }
          : product,
      );
      const productsSaved = await saveStoredProducts(migratedProducts);
      if (!productsSaved) {
        setMediaNotice("Category saved, but product migration failed to sync. Please retry.");
        toast.error("Category saved, but product migration failed to sync. Please retry.");
        return;
      }
    }
    setCatalogueDraft(nextCatalogue);
    setMediaNotice(`Category "${title}" saved successfully.`);
    toast.success(`Category "${title}" saved successfully.`);
  }

  async function saveBanner() {
    const normalizedType = bannerDraft.mediaType ?? (bannerDraft.videoUrl ? "video" : "image");
    const normalizedImage =
      normalizedType === "video"
        ? String(bannerDraft.videoUrl || bannerDraft.image || "").trim()
        : String(bannerDraft.image || "").trim();

    if (!normalizedImage) {
      setBannerNotice("Please upload/select a banner before saving.");
      setMediaNotice(
        normalizedType === "video"
          ? "Please upload/select a banner video before saving."
          : "Please upload/select a banner image before saving.",
      );
      return;
    }

    const nextBanner = {
      ...bannerDraft,
      id: bannerDraft.id || uniqueId("banner"),
      mediaType: normalizedType,
      image: normalizedImage,
      videoUrl: normalizedType === "video" ? normalizedImage : "",
    };
    const next = [...storedHomeContent.banners];
    const existingIndex = next.findIndex((item) => item.id === nextBanner.id);

    if (existingIndex >= 0) next[existingIndex] = nextBanner;
    else next.push(nextBanner);

    const saved = await saveStoredHomeContent({ ...storedHomeContent, banners: next });
    if (!saved) {
      setBannerNotice("Unable to save banner right now. Please try again.");
      setMediaNotice("Unable to save banner right now. Please try again.");
      return;
    }
    setBannerDraft(nextBanner);
    setBannerNotice("Banner saved successfully.");
    setMediaNotice("Banner saved successfully.");
  }

  async function deleteBanner(bannerId: string) {
    const nextBanners = storedHomeContent.banners.filter((banner) => banner.id !== bannerId);
    const saved = await saveStoredHomeContent({ ...storedHomeContent, banners: nextBanners });
    if (!saved) {
      setBannerNotice("Unable to delete banner right now. Please try again.");
      setMediaNotice("Unable to delete banner right now. Please try again.");
      return;
    }
    if (bannerDraft.id === bannerId) {
      setBannerDraft(bannerTemplate);
    }
    setBannerNotice("Banner deleted successfully.");
    setMediaNotice("Banner deleted successfully.");
  }

  async function reorderBanner(index: number, direction: -1 | 1) {
    const nextBanners = moveItem(storedHomeContent.banners, index, direction);
    const saved = await saveStoredHomeContent({ ...storedHomeContent, banners: nextBanners });
    if (!saved) {
      setBannerNotice("Unable to reorder banners right now. Please try again.");
      setMediaNotice("Unable to reorder banners right now. Please try again.");
      return;
    }
    setBannerNotice("Banner order updated successfully.");
    setMediaNotice("Banner order updated successfully.");
  }

  async function resetBanners() {
    const saved = await saveStoredHomeContent({
      ...storedHomeContent,
      banners: defaultHomeContent.banners.map((item) => ({ ...item })),
    });
    if (!saved) {
      setBannerNotice("Unable to reset banners right now. Please try again.");
      setMediaNotice("Unable to reset banners right now. Please try again.");
      return;
    }
    setBannerDraft(bannerTemplate);
    setBannerNotice("Banners reset successfully.");
    setMediaNotice("Banners reset successfully.");
  }

  async function saveVideo() {
    const videoUrl = String(videoDraft.videoUrl || "").trim();
    if (!videoUrl) {
      setMediaNotice("Please add video URL or upload a reel before saving.");
      return;
    }
    if (videoDraft.videoType === "youtube" && !isYoutubeUrl(videoUrl)) {
      setMediaNotice("Please enter a valid YouTube link.");
      return;
    }
    const normalizedType = videoDraft.videoType || (isYoutubeUrl(videoDraft.videoUrl) ? "youtube" : "reel");
    const nextVideo = {
      ...videoDraft,
      id: videoDraft.id || uniqueId("video"),
      videoType: normalizedType,
      videoUrl,
    };
    const next = [...storedHomeContent.videos];
    const existingIndex = next.findIndex((item) => item.id === nextVideo.id);

    if (existingIndex >= 0) next[existingIndex] = nextVideo;
    else next.push(nextVideo);

    const saved = await saveStoredHomeContent({ ...storedHomeContent, videos: next });
    if (!saved) {
      setMediaNotice("Unable to save video right now. Please try again.");
      return;
    }
    setVideoDraft(nextVideo);
    setMediaNotice("Video saved successfully.");
  }

  async function saveReview() {
    if (!adminText(reviewDraft.authorName).trim() || !adminText(reviewDraft.reviewText).trim()) {
      setMediaNotice("Review author and review text are required.");
      return;
    }
    const nextReview = { ...reviewDraft, id: reviewDraft.id || uniqueId("review") };
    const next = [...storedHomeContent.reviews];
    const existingIndex = next.findIndex((item) => item.id === nextReview.id);

    if (existingIndex >= 0) next[existingIndex] = nextReview;
    else next.push(nextReview);

    const saved = await saveStoredHomeContent({ ...storedHomeContent, reviews: next });
    if (!saved) {
      setMediaNotice("Unable to save review right now. Please try again.");
      return;
    }
    setReviewDraft(nextReview);
    setMediaNotice("Review saved successfully.");
  }

  async function handleBannerFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const isVideo = file.type.startsWith("video/");
      const dataUrl = await fileToDataUrl(file, isVideo ? 6 : 4);
      setBannerDraft((current) => ({
        ...current,
        mediaType: isVideo ? "video" : "image",
        image: isVideo ? current.image : dataUrl,
        videoUrl: isVideo ? dataUrl : "",
      }));
      setBannerNotice(`Banner file "${file.name}" loaded successfully.`);
      setMediaNotice(`Banner file "${file.name}" loaded successfully.`);
    } catch (error) {
      setBannerNotice(error instanceof Error ? error.message : "Unable to load the banner file.");
      setMediaNotice(error instanceof Error ? error.message : "Unable to load the banner file.");
    }
  }

  async function handleProductFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMediaNotice("Please select an image file for product image.");
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file, 4);
      setProductDraft((current) => ({ ...current, image: dataUrl }));
      setMediaNotice(`Product image "${file.name}" loaded successfully.`);
    } catch (error) {
      setMediaNotice(error instanceof Error ? error.message : "Unable to load the product image file.");
    }
  }

  async function handleProductGalleryFilesChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    const invalidType = files.find((file) => !file.type.startsWith("image/"));
    if (invalidType) {
      setMediaNotice("Please select image files only for product gallery.");
      return;
    }

    try {
      const nextGalleryImages = await Promise.all(files.slice(0, 4).map((file) => fileToDataUrl(file, 4)));
      setProductDraft((current) => ({
        ...current,
        galleryImages: [...(current.galleryImages ?? []), ...nextGalleryImages].slice(0, 4),
      }));
      setMediaNotice("Product gallery images loaded successfully.");
    } catch (error) {
      setMediaNotice(error instanceof Error ? error.message : "Unable to load gallery image files.");
    }
  }

  async function handleVideoFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await fileToDataUrl(file, 4);
      setVideoDraft((current) => ({ ...current, videoType: "reel", videoUrl: dataUrl }));
      setMediaNotice(
        `Reel file "${file.name}" loaded successfully. Keep uploaded videos small for static hosting.`,
      );
    } catch (error) {
      setMediaNotice(error instanceof Error ? error.message : "Unable to load the video file.");
    }
  }

  async function handleCatalogueImageFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMediaNotice("Please select an image file for category image.");
      return;
    }
    try {
      const dataUrl = await imageFileToOptimizedDataUrl(file);
      setCatalogueDraft((current) => ({ ...current, image: dataUrl }));
      setMediaNotice(`Category image "${file.name}" loaded successfully.`);
    } catch (error) {
      setMediaNotice(error instanceof Error ? error.message : "Unable to load the category image file.");
    }
  }

  async function handleVideoThumbnailFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMediaNotice("Please select an image file for thumbnail.");
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file, 4);
      setVideoDraft((current) => ({ ...current, thumbnail: dataUrl }));
      setMediaNotice(`Video thumbnail "${file.name}" loaded successfully.`);
    } catch (error) {
      setMediaNotice(error instanceof Error ? error.message : "Unable to load the thumbnail file.");
    }
  }

  return (
    <div className="min-h-screen bg-[#ececec] px-2 py-3 md:px-4 md:py-5">
      <div className="mx-auto w-full max-w-[1920px] rounded-[10px] border border-[#dfdfdf] bg-white p-4">
        <div className="grid gap-6 rounded-[10px] bg-[#eef0f3] p-4 xl:grid-cols-[330px_1fr] xl:items-start">
        <aside className="sticky top-6 h-[calc(100vh-3.5rem)] overflow-y-auto rounded-[30px] bg-[linear-gradient(180deg,#6f55dc_0%,#5b45c8_100%)] p-6 text-white shadow-[0_24px_60px_-40px_rgba(11,7,34,0.8)]">
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-white/10 text-[#ffd68d]">
                <LayoutPanelTop className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#ddd2ff]">Admin</p>
                <h2 className="mt-1 text-xl font-semibold">Shivray Panel</h2>
              </div>
            </div>
            <p className="text-sm leading-6 text-[#f0e9ff]">
              Manage store content, uploaded banners, customers, and orders from one place.
            </p>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setActiveSection("dashboard")}
              className={`flex w-full items-center gap-3 rounded-[18px] px-4 py-3 text-left text-sm font-semibold transition ${
                activeSection === "dashboard"
                  ? "bg-white/16 text-[#ffe08a]"
                  : "bg-white/8 text-[#f3eeff] hover:bg-white/12"
              }`}
            >
              <LayoutPanelTop className="h-4 w-4" />
              Dashboard
            </button>

            <div className="rounded-[18px] bg-white/8 p-1.5">
              <button
                type="button"
                onClick={() => setProductsExpanded((open) => !open)}
                className={`flex w-full items-center gap-3 rounded-[14px] px-3.5 py-2.5 text-left text-sm font-semibold transition ${
                  activeSection === "products" ? "text-[#ffe08a]" : "text-[#f3eeff] hover:bg-white/10"
                }`}
              >
                <Package className="h-4 w-4" />
                <span className="flex-1">Products</span>
                {productsExpanded ? (
                  <ChevronDown className="h-4 w-4 opacity-80" />
                ) : (
                  <ChevronRight className="h-4 w-4 opacity-80" />
                )}
              </button>
              {productsExpanded ? (
                <div className="mt-1 space-y-1 px-2 pb-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSection("products");
                      setProductViewMode("list");
                    }}
                    className="w-full rounded-xl px-3 py-2 text-left text-sm text-[#efeaff] transition hover:bg-white/10"
                  >
                    Product List
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSection("products");
                      setProductDraft(cloneProductTemplate());
                      setProductViewMode("add");
                    }}
                    className="w-full rounded-xl px-3 py-2 text-left text-sm text-[#efeaff] transition hover:bg-white/10"
                  >
                    Product Add
                  </button>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => setActiveSection("categories")}
              className={`flex w-full items-center gap-3 rounded-[18px] px-4 py-3 text-left text-sm font-semibold transition ${
                activeSection === "categories"
                  ? "bg-white/16 text-[#ffe08a]"
                  : "bg-white/8 text-[#f3eeff] hover:bg-white/12"
              }`}
            >
              <Shapes className="h-4 w-4" />
              Categories
            </button>

            <button
              type="button"
              onClick={() => setActiveSection("banners")}
              className={`flex w-full items-center gap-3 rounded-[18px] px-4 py-3 text-left text-sm font-semibold transition ${
                activeSection === "banners"
                  ? "bg-white/16 text-[#ffe08a]"
                  : "bg-white/8 text-[#f3eeff] hover:bg-white/12"
              }`}
            >
              <ImagePlus className="h-4 w-4" />
              Banners
            </button>

            <button
              type="button"
              onClick={() => setActiveSection("videos")}
              className={`flex w-full items-center gap-3 rounded-[18px] px-4 py-3 text-left text-sm font-semibold transition ${
                activeSection === "videos"
                  ? "bg-white/16 text-[#ffe08a]"
                  : "bg-white/8 text-[#f3eeff] hover:bg-white/12"
              }`}
            >
              <Film className="h-4 w-4" />
              Videos
            </button>

            <div className="rounded-[18px] bg-white/8 p-1.5">
              <button
                type="button"
                onClick={() => setOrdersExpanded((open) => !open)}
                className={`flex w-full items-center gap-3 rounded-[14px] px-3.5 py-2.5 text-left text-sm font-semibold transition ${
                  activeSection === "orders" ? "text-[#ffe08a]" : "text-[#f3eeff] hover:bg-white/10"
                }`}
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="flex-1">Orders</span>
                {ordersExpanded ? (
                  <ChevronDown className="h-4 w-4 opacity-80" />
                ) : (
                  <ChevronRight className="h-4 w-4 opacity-80" />
                )}
              </button>
              {ordersExpanded ? (
                <div className="mt-1 space-y-1 px-2 pb-1">
                  {(["Pending", "Processing", "Shipped", "Delivered", "Cancelled"] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => {
                        setActiveSection("orders");
                        setOrderStatusFilter(status);
                      }}
                      className="w-full rounded-xl px-3 py-2 text-left text-sm text-[#efeaff] transition hover:bg-white/10"
                    >
                      {status} Orders
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => setActiveSection("customers")}
              className={`flex w-full items-center gap-3 rounded-[18px] px-4 py-3 text-left text-sm font-semibold transition ${
                activeSection === "customers"
                  ? "bg-white/16 text-[#ffe08a]"
                  : "bg-white/8 text-[#f3eeff] hover:bg-white/12"
              }`}
            >
              <UserRound className="h-4 w-4" />
              Customers
            </button>

            <button
              type="button"
              onClick={() => setActiveSection("reviews")}
              className={`flex w-full items-center gap-3 rounded-[18px] px-4 py-3 text-left text-sm font-semibold transition ${
                activeSection === "reviews"
                  ? "bg-white/16 text-[#ffe08a]"
                  : "bg-white/8 text-[#f3eeff] hover:bg-white/12"
              }`}
            >
              <MessageSquareQuote className="h-4 w-4" />
              Reviews
            </button>
          </div>
        </aside>

        <main className="space-y-5">
          <section className="rounded-[10px] border border-[#e4e4e4] bg-transparent p-2">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative min-w-[240px] max-w-[520px] flex-1">
                <input
                  type="text"
                  value={activeSection === "orders" ? orderSearch : activeSection === "customers" ? customerSearch : ""}
                  onChange={(event) => {
                    if (activeSection === "orders") setOrderSearch(event.target.value);
                    if (activeSection === "customers") setCustomerSearch(event.target.value);
                  }}
                  placeholder="Search"
                  className="w-full rounded-[10px] border border-[#dfdfdf] bg-white py-3 pl-5 pr-14 text-xl text-[#88929d] outline-none md:text-2xl"
                />
                <div className="absolute right-0 top-0 flex h-full w-14 items-center justify-center rounded-r-[10px] border-l border-[#dfdfdf] text-[#1f2937]">
                  <Search className="h-6 w-6" />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex items-center gap-2 rounded-full bg-[#f4f2ff] px-2 py-1">
                  <button
                    type="button"
                    onClick={() => setShowNotifications((value) => !value)}
                    className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#7e6bc2]"
                    aria-label="Toggle notifications"
                  >
                    <Bell className="h-5 w-5" />
                    {notifications[0] !== "No new notifications." ? (
                      <span className="absolute right-1 top-1 inline-flex h-2.5 w-2.5 rounded-full bg-[#ef4357]" />
                    ) : null}
                  </button>
                  {showNotifications ? (
                    <div className="absolute right-0 top-12 z-20 w-80 rounded-xl border border-[#dfe3ea] bg-white p-3 shadow-[0_20px_40px_-28px_rgba(0,0,0,0.35)]">
                      <p className="mb-2 text-sm font-semibold text-[#111827]">Notifications</p>
                      <div className="space-y-2">
                        {notifications.map((note, index) => (
                          <p key={`${note}-${index}`} className="rounded-lg bg-[#f8fafc] px-3 py-2 text-xs text-[#374151]">
                            {note}
                          </p>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordPanel((value) => !value);
                    setPasswordError("");
                    setPasswordSuccess("");
                    setUsernameError("");
                    setUsernameSuccess("");
                  }}
                  className="text-right transition hover:opacity-80"
                >
                  <p className="text-2xl font-semibold text-[#121926]">Admin</p>
                  <p className="text-base text-[#5b6471]">Admin Profile</p>
                </button>
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#d5d8de] bg-white">
                  <UserRound className="h-8 w-8 text-[#6b7280]" />
                </div>
                <Link
                  to="/"
                  className="rounded-full border border-[#d7dbe2] bg-white px-4 py-2 text-sm font-semibold text-[#4f5d70] transition hover:bg-[#f8f9fb]"
                >
                  View Store
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-full bg-[#1f2937] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#111827]"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
            {mediaNotice ? <p className="mt-3 text-sm font-medium text-[#8b4d1d]">{mediaNotice}</p> : null}
            {showPasswordPanel ? (
              <div className="mt-4 space-y-4 rounded-[10px] border border-[#dfe3ea] bg-white p-4">
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-[#111827]">Change Username</h3>
                  <form onSubmit={handleAdminUsernameChange} className="grid gap-3 md:grid-cols-2">
                    <input
                      type="text"
                      value={usernameForm.newUsername}
                      onChange={(event) =>
                        setUsernameForm((current) => ({ ...current, newUsername: event.target.value }))
                      }
                      placeholder="New username"
                      className="rounded-lg border border-[#d7dbe2] px-3 py-2 text-sm text-[#111827] outline-none"
                      required
                    />
                    <input
                      type="password"
                      value={usernameForm.currentPassword}
                      onChange={(event) =>
                        setUsernameForm((current) => ({ ...current, currentPassword: event.target.value }))
                      }
                      placeholder="Current password"
                      className="rounded-lg border border-[#d7dbe2] px-3 py-2 text-sm text-[#111827] outline-none"
                      required
                    />
                    <div className="md:col-span-2 flex flex-wrap items-center gap-3">
                      <button
                        type="submit"
                        disabled={changingUsername}
                        className="rounded-lg bg-[#6f55dc] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {changingUsername ? "Updating..." : "Update Username"}
                      </button>
                      {usernameError ? <p className="text-sm text-[#b42318]">{usernameError}</p> : null}
                      {usernameSuccess ? <p className="text-sm text-[#2d7a31]">{usernameSuccess}</p> : null}
                    </div>
                  </form>
                </div>

                <div className="border-t border-[#eceff3] pt-4">
                  <h3 className="mb-2 text-lg font-semibold text-[#111827]">Change Password</h3>
                  <form onSubmit={handleAdminPasswordChange} className="grid gap-3 md:grid-cols-2">
                    <input
                      type="email"
                      value={passwordForm.email}
                      onChange={(event) => setPasswordForm((current) => ({ ...current, email: event.target.value }))}
                      placeholder="Admin email"
                      className="rounded-lg border border-[#d7dbe2] px-3 py-2 text-sm text-[#111827] outline-none"
                      required
                    />
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))}
                      placeholder="Current password"
                      className="rounded-lg border border-[#d7dbe2] px-3 py-2 text-sm text-[#111827] outline-none"
                      required
                    />
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))}
                      placeholder="New password (min 8 chars)"
                      className="rounded-lg border border-[#d7dbe2] px-3 py-2 text-sm text-[#111827] outline-none"
                      required
                    />
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                      placeholder="Confirm new password"
                      className="rounded-lg border border-[#d7dbe2] px-3 py-2 text-sm text-[#111827] outline-none"
                      required
                    />
                    <div className="md:col-span-2 flex flex-wrap items-center gap-3">
                      <button
                        type="submit"
                        disabled={changingPassword}
                        className="rounded-lg bg-[#6f55dc] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {changingPassword ? "Updating..." : "Update Password"}
                      </button>
                      {passwordError ? <p className="text-sm text-[#b42318]">{passwordError}</p> : null}
                      {passwordSuccess ? <p className="text-sm text-[#2d7a31]">{passwordSuccess}</p> : null}
                    </div>
                  </form>
                </div>
              </div>
            ) : null}
          </section>

          {activeSection === "dashboard" ? (
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {stats.map((item) => (
                <StatCard key={item.label} label={item.label} value={item.value} icon={item.icon} />
              ))}
            </section>
          ) : null}

          {activeSection === "dashboard" ? (
            <section className="space-y-6">
              <div className="rounded-[10px] border border-[#e1e1e1] bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-semibold text-[#121826]">Recent Transactions</h2>
                    <p className="mt-2 text-sm text-[#637082]">
                      Orders placed from the website show up here automatically.
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm text-[#1f2937]">
                    <span>Show</span>
                    <select className="rounded-md border border-[#d9dce2] bg-white px-2 py-1 text-sm">
                      <option>10</option>
                    </select>
                    <span>entries</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#1f2937]">
                    <span>Search:</span>
                    <input className="rounded-md border border-[#d9dce2] bg-white px-3 py-1.5 text-sm outline-none" />
                  </div>
                </div>
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full min-w-[780px] text-left text-sm">
                    <thead className="border-b border-[#e6e8ee] text-[#111827]">
                      <tr>
                        <th className="px-4 py-3 font-semibold">ID</th>
                        <th className="px-4 py-3 font-semibold">Customer Name</th>
                        <th className="px-4 py-3 font-semibold">Payment Info</th>
                        <th className="px-4 py-3 font-semibold">Price</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold">Placed At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length > 0 ? (
                        orders.slice(0, 6).map((order) => (
                          <tr key={order.id} className="border-b border-[#eceff3]">
                            <td className="px-4 py-4 font-semibold text-[#111827]">{order.id}</td>
                            <td className="px-4 py-4 text-[#1f2937]">{order.customerName}</td>
                            <td className="px-4 py-4 text-[#1f2937]">{order.paymentInfo}</td>
                            <td className="px-4 py-4 text-[#111827]">{order.totalPrice}</td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(order.status)}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-[#4b5563]">{formatDate(order.createdAt)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-4 py-10 text-center text-[#8b6c52]">
                            No orders yet. Customer orders placed from the cart will appear here.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          ) : null}

          {activeSection === "products" ? (
            <section className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d8dde5] pb-4">
                <h2 className="text-3xl font-semibold text-[#111827]">
                  {productViewMode === "add" ? "Products Add" : `Products (${products.length})`}
                </h2>
                {productViewMode === "add" ? (
                  <button
                    type="button"
                    onClick={saveProduct}
                    className="rounded-xl bg-[#6f55dc] px-12 py-3 text-sm font-semibold uppercase tracking-[0.06em] text-white"
                  >
                    Save
                  </button>
                ) : null}
              </div>
              {productViewMode === "list" ? (
                <div className="rounded-[10px] border border-[#dadde3] bg-white p-4">
                  <h3 className="text-xl font-semibold text-[#1f2937]">Homepage Best Selling Products</h3>
                  <p className="mt-1 text-sm text-[#6c4b33]">Choose which products appear in the homepage best-selling section.</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, index) => {
                      const value = storedHomeContent.spotlightProductIds?.[index] ?? "";
                      return (
                        <select
                          key={`spotlight-${index}`}
                          value={value}
                          onChange={(event) => void updateSpotlightProduct(index, event.target.value)}
                          className="rounded-lg border border-[#d7dbe3] bg-white px-3 py-2 text-sm text-[#1f2937] outline-none"
                        >
                          <option value="">Select product #{index + 1}</option>
                          {spotlightOptionProducts.map((item) => (
                            <option key={item.id} value={item.id}>
                              {resolveLocalizedText(item.name, "en")}
                            </option>
                          ))}
                        </select>
                      );
                    })}
                  </div>
                </div>
              ) : null}
              <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
              {productViewMode === "list" ? (
              <div className="grid gap-3 xl:grid-cols-[300px_1fr] xl:col-span-2 xl:items-start">
                <aside className="sticky top-6 h-[calc(100vh-9rem)] overflow-y-auto space-y-3 self-start pr-1">
                  <div className="rounded-[10px] border border-[#dadde3] bg-white p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-2xl font-semibold text-[#111827]">Filter</p>
                      <div className="flex gap-2">
                        <button type="button" onClick={applyProductFilters} className="rounded-lg bg-[#6f55dc] px-4 py-2 text-sm font-semibold text-white">Apply Filter</button>
                        <button type="button" onClick={resetProductFilters} className="rounded-lg bg-[#ff5a6c] px-4 py-2 text-sm font-semibold text-white">Reset</button>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[10px] border border-[#dadde3] bg-white p-3">
                    <button type="button" onClick={() => setProductFilterPanels((current) => ({ ...current, categories: !current.categories }))} className="flex w-full items-center justify-between text-left">
                      <span className="text-2xl font-semibold text-[#1f2937]">Categories</span>
                      <ChevronDown className={`h-5 w-5 text-[#6f55dc] transition ${productFilterPanels.categories ? "rotate-180" : ""}`} />
                    </button>
                    {productFilterPanels.categories ? (
                      <div className="mt-3">
                        <select value={productFiltersDraft.category} onChange={(event) => setProductFiltersDraft((current) => ({ ...current, category: event.target.value }))} className="w-full rounded-lg border border-[#d7dbe3] px-3 py-2 text-sm text-[#1f2937] outline-none">
                          <option value="all">All Categories</option>
                          {availableProductCategories.map((category) => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>
                    ) : null}
                  </div>
                  <div className="rounded-[10px] border border-[#dadde3] bg-white p-3">
                    <button type="button" onClick={() => setProductFilterPanels((current) => ({ ...current, brands: !current.brands }))} className="flex w-full items-center justify-between text-left">
                      <span className="text-2xl font-semibold text-[#1f2937]">Select Brand</span>
                      <ChevronDown className={`h-5 w-5 text-[#6f55dc] transition ${productFilterPanels.brands ? "rotate-180" : ""}`} />
                    </button>
                    {productFilterPanels.brands ? (
                      <div className="mt-3">
                        <select value={productFiltersDraft.brand} onChange={(event) => setProductFiltersDraft((current) => ({ ...current, brand: event.target.value }))} className="w-full rounded-lg border border-[#d7dbe3] px-3 py-2 text-sm text-[#1f2937] outline-none">
                          <option value="all">All Brands</option>
                          {availableProductBrands.map((brand) => (
                            <option key={brand} value={brand}>{brand}</option>
                          ))}
                        </select>
                      </div>
                    ) : null}
                  </div>
                  <div className="rounded-[10px] border border-[#dadde3] bg-white p-3">
                    <select value={productFiltersDraft.sortBy} onChange={(event) => setProductFiltersDraft((current) => ({ ...current, sortBy: event.target.value as ProductSortBy }))} className="w-full rounded-lg border border-[#d7dbe3] px-3 py-2 text-xl text-[#1f2937] outline-none">
                      <option value="newest">Sort By</option>
                      <option value="name-asc">Name A-Z</option>
                      <option value="name-desc">Name Z-A</option>
                      <option value="price-low">Price Low to High</option>
                      <option value="price-high">Price High to Low</option>
                    </select>
                  </div>
                  <div className="rounded-[10px] border border-[#dadde3] bg-white p-3">
                    <button type="button" onClick={() => setProductFilterPanels((current) => ({ ...current, pricing: !current.pricing }))} className="flex w-full items-center justify-between text-left">
                      <span className="text-2xl font-semibold text-[#1f2937]">Pricing Range</span>
                      <ChevronDown className={`h-5 w-5 text-[#6f55dc] transition ${productFilterPanels.pricing ? "rotate-180" : ""}`} />
                    </button>
                    {productFilterPanels.pricing ? (
                      <div className="mt-3">
                        <select value={productFiltersDraft.priceRange} onChange={(event) => setProductFiltersDraft((current) => ({ ...current, priceRange: event.target.value as ProductPriceRange }))} className="w-full rounded-lg border border-[#d7dbe3] px-3 py-2 text-sm text-[#1f2937] outline-none">
                          <option value="all">All</option>
                          <option value="under-5000">Under Rs. 5,000</option>
                          <option value="5000-10000">Rs. 5,000 - Rs. 10,000</option>
                          <option value="10000-15000">Rs. 10,000 - Rs. 15,000</option>
                          <option value="15000-plus">Above Rs. 15,000</option>
                        </select>
                      </div>
                    ) : null}
                  </div>
                </aside>
                <div className="space-y-3 xl:h-[calc(100vh-9rem)] xl:overflow-y-auto xl:pr-1">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((item, index) => (
                      <article key={item.id} className="rounded-[10px] border border-[#dfe3ea] bg-white p-3">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                          <h3 className="text-2xl font-semibold text-[#f5ad00]">{resolveLocalizedText(item.name, "en")}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-[#1f2937]">{new Date().toISOString().slice(0, 10)}</span>
                            <span className="rounded-full bg-[#f59e0b] px-2.5 py-0.5 text-xs font-semibold text-white">{adminText(item.tag) || "New"}</span>
                          </div>
                        </div>
                        <div className="grid gap-3 md:grid-cols-[80px_1fr_auto] md:items-start">
                          <img src={item.image} alt={resolveLocalizedText(item.name, "en")} className="h-20 w-16 rounded-md object-cover" />
                          <table className="w-full min-w-[380px] border border-[#e5e7eb] text-left text-sm">
                            <thead className="bg-[#f8fafc] text-[#111827]">
                              <tr>
                                <th className="border-r border-[#e5e7eb] px-3 py-2 font-semibold">WEIGHT</th>
                                <th className="border-r border-[#e5e7eb] px-3 py-2 font-semibold">PRICE</th>
                                <th className="border-r border-[#e5e7eb] px-3 py-2 font-semibold">DISCOUNT</th>
                                <th className="px-3 py-2 font-semibold">FINAL PRICE</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(item.productOptions?.length
                                ? item.productOptions
                                : [{ label: adminText(item.dimensions) || "-", price: item.price, discount: "0", finalPrice: item.price }]
                              ).map((option, optionIndex) => (
                                <tr key={`${item.id}-option-${optionIndex}`}>
                                  <td className="border-r border-t border-[#e5e7eb] px-3 py-2 text-[#1f2937]">{option.label}</td>
                                  <td className="border-r border-t border-[#e5e7eb] px-3 py-2 text-[#1f2937]">{formatCurrency(parseCurrencyValue(option.price || item.price))}</td>
                                  <td className="border-r border-t border-[#e5e7eb] px-3 py-2 text-[#1f2937]">{Number(option.discount || 0).toFixed(2)}%</td>
                                  <td className="border-t border-[#e5e7eb] px-3 py-2 text-[#1f2937]">{formatCurrency(parseCurrencyValue(option.finalPrice || option.price || item.price))}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-[#8b95a4]">Category</p>
                              <p className="text-2xl font-semibold text-[#111827]">⭐{item.category}</p>
                            </div>
                            <div>
                              <p className="text-sm text-[#8b95a4]">Brand</p>
                              <p className="text-2xl font-semibold text-[#111827]">{adminText(item.tag) || "Active"}</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <p className="mb-2 text-sm text-[#7f8897]">Action</p>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => { setProductDraft(item); setProductViewMode("add"); }} className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#6f55dc] text-white"><SquarePen className="h-4 w-4" /></button>
                            <button type="button" onClick={() => void deleteProduct(item.id)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#ef4357] text-white"><Trash2 className="h-4 w-4" /></button>
                            <button type="button" onClick={() => void reorderProduct(index, -1)} className="rounded-lg border border-[#d7dbe3] px-3 py-2 text-xs font-semibold text-[#4b5563]">Up</button>
                            <button type="button" onClick={() => void reorderProduct(index, 1)} className="rounded-lg border border-[#d7dbe3] px-3 py-2 text-xs font-semibold text-[#4b5563]">Down</button>
                          </div>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="rounded-[10px] border border-[#dfe3ea] bg-white p-10 text-center text-[#6b7280]">No products match the current filters.</div>
                  )}
                </div>
              </div>
              ) : null}
              {showLegacyProductList && productViewMode === "list" ? (
              <div className="rounded-[10px] border border-[#dadde3] bg-white p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-semibold text-[#34180e]">Product Catalog</h2>
                    <p className="mt-2 text-sm text-[#6c4b33]">
                      Add, edit, reorder, or remove products shown on the website.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setProductDraft(cloneProductTemplate());
                      setProductViewMode("add");
                    }}
                    className="rounded-lg bg-[#6f55dc] px-4 py-2 text-sm font-semibold text-white"
                  >
                    New Product
                  </button>
                </div>
                <div className="mt-6 space-y-4">
                  {products.map((item, index) => (
                    <div key={item.id} className="rounded-[24px] border border-[#efe1cf] bg-[#fcf8f2] p-4">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                          <img
                            src={item.image}
                            alt={resolveLocalizedText(item.name, "en")}
                            className="h-16 w-16 rounded-2xl object-cover"
                          />
                          <div>
                            <p className="font-semibold text-[#34180e]">{resolveLocalizedText(item.name, "en")}</p>
                            <p className="mt-1 text-sm text-[#6c4b33]">{item.category} - Starting at {formatCurrency(parseCurrencyValue(item.price))}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => { setProductDraft(item); setProductViewMode("add"); }} className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#6f55dc] text-white"><SquarePen className="h-4 w-4" /></button>
                          <button type="button" onClick={() => void reorderProduct(index, -1)} className="rounded-full border border-[#eadbc8] bg-white px-3 py-2 text-sm text-[#6c4b33]"><ArrowUp className="h-4 w-4" /></button>
                          <button type="button" onClick={() => void reorderProduct(index, 1)} className="rounded-full border border-[#eadbc8] bg-white px-3 py-2 text-sm text-[#6c4b33]"><ArrowDown className="h-4 w-4" /></button>
                          <button type="button" onClick={() => void deleteProduct(item.id)} className="rounded-full border border-[#ffe1e1] bg-[#fff3f3] px-3 py-2 text-sm text-[#9f2b2b]"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              ) : null}
              {productViewMode === "add" ? (
              <div className="rounded-[10px] border border-[#dadde3] bg-white p-6">
                <h2 className="text-center text-2xl font-semibold text-[#111827]">Fill Products Information</h2>
                <p className="mt-2 text-sm text-[#6c4b33]">Save product changes to update the website catalog.</p>
                {mediaNotice ? (
                  <div className="mt-4 rounded-xl border border-[#f3d0a4] bg-[#fff7ed] px-4 py-3 text-sm font-medium text-[#9a3412]">
                    {mediaNotice}
                  </div>
                ) : null}
                <div className="mt-6">
                  <ProductForm
                    value={productDraft}
                    categoryOptions={availableProductCategories}
                    onChange={setProductDraft}
                    onSave={saveProduct}
                    onPickFile={handleProductFileChange}
                    onPickGalleryFiles={handleProductGalleryFilesChange}
                  />
                </div>
              </div>
              ) : null}
              </div>
            </section>
          ) : null}

          {activeSection === "categories" ? (
            <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
              <div className="rounded-[30px] bg-white p-6 shadow-[0_18px_40px_-30px_rgba(70,36,15,0.22)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-semibold text-[#34180e]">Categories</h2>
                    <p className="mt-2 text-sm text-[#6c4b33]">Control which categories appear on the site.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCatalogueDraft(catalogueTemplate)}
                    className="rounded-full bg-[#34180e] px-4 py-2 text-sm font-semibold text-white"
                  >
                    New Category
                  </button>
                </div>
                <div className="mt-6 space-y-4">
                  {orderedCatalogues.map((item, index) => (
                    <div key={item.id} className="rounded-[24px] border border-[#efe1cf] bg-[#fcf8f2] p-4">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-semibold text-[#34180e]">{adminText(item.title).replace(/catalogue/gi, "Category")}</p>
                          <p className="mt-1 text-sm text-[#6c4b33]">
                            {adminText(item.shortLabel)} • {item.isActive ? "Visible" : "Hidden"}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => setCatalogueDraft(item)} className="rounded-full border border-[#eadbc8] bg-white px-4 py-2 text-sm text-[#6c4b33]">Edit</button>
                          <button type="button" onClick={() => saveStoredCatalogueTypes(moveItem(orderedCatalogues, index, -1).map((catalogue, order) => ({ ...catalogue, sortOrder: order + 1 })))} className="rounded-full border border-[#eadbc8] bg-white px-3 py-2 text-sm text-[#6c4b33]"><ArrowUp className="h-4 w-4" /></button>
                          <button type="button" onClick={() => saveStoredCatalogueTypes(moveItem(orderedCatalogues, index, 1).map((catalogue, order) => ({ ...catalogue, sortOrder: order + 1 })))} className="rounded-full border border-[#eadbc8] bg-white px-3 py-2 text-sm text-[#6c4b33]"><ArrowDown className="h-4 w-4" /></button>
                          <button type="button" onClick={() => deleteCategory(item.id)} className="rounded-full border border-[#ffe1e1] bg-[#fff3f3] px-3 py-2 text-sm text-[#9f2b2b]"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => saveStoredCatalogueTypes(defaultCatalogueTypes)}
                    className="inline-flex items-center gap-2 rounded-full border border-[#eadbc8] bg-[#fffaf4] px-4 py-2 text-sm font-semibold text-[#8b4d1d]"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Reset Categories
                  </button>
                </div>
              </div>
              <div className="rounded-[30px] bg-white p-6 shadow-[0_18px_40px_-30px_rgba(70,36,15,0.22)]">
                <h2 className="text-2xl font-semibold text-[#34180e]">Edit Category</h2>
                <p className="mt-2 text-sm text-[#6c4b33]">Category changes update the homepage and category screens.</p>
                <div className="mt-6">
                  <CatalogueForm
                    value={catalogueDraft}
                    onChange={setCatalogueDraft}
                    onSave={saveCatalogue}
                    onPickImageFile={handleCatalogueImageFileChange}
                  />
                </div>
              </div>
            </section>
          ) : null}

          {activeSection === "banners" ? (
            <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
              <div className="rounded-[30px] bg-white p-6 shadow-[0_18px_40px_-30px_rgba(70,36,15,0.22)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-semibold text-[#34180e]">Homepage Banners</h2>
                    <p className="mt-2 text-sm text-[#6c4b33]">Upload image or video banners for the home hero section.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setBannerDraft(bannerTemplate);
                      setBannerNotice("");
                    }}
                    className="rounded-full bg-[#34180e] px-4 py-2 text-sm font-semibold text-white"
                  >
                    New Banner
                  </button>
                </div>
                <div className="mt-6 space-y-4">
                  {storedHomeContent.banners.map((item, index) => (
                    <div key={item.id} className="rounded-[24px] border border-[#efe1cf] bg-[#fcf8f2] p-4">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3">
                            <span className="rounded-full bg-[#fff1d9] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b4d1d]">
                              {(item.mediaType ?? "image") === "video" ? "Video" : "Image"}
                            </span>
                            <p className="truncate text-sm text-[#6c4b33]">
                              {(item.mediaType ?? "image") === "video" ? item.videoUrl || "No video selected" : item.image || "No image selected"}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => setBannerDraft(item)} className="rounded-full border border-[#eadbc8] bg-white px-4 py-2 text-sm text-[#6c4b33]">Edit</button>
                          <button type="button" onClick={() => void reorderBanner(index, -1)} className="rounded-full border border-[#eadbc8] bg-white px-3 py-2 text-sm text-[#6c4b33]"><ArrowUp className="h-4 w-4" /></button>
                          <button type="button" onClick={() => void reorderBanner(index, 1)} className="rounded-full border border-[#eadbc8] bg-white px-3 py-2 text-sm text-[#6c4b33]"><ArrowDown className="h-4 w-4" /></button>
                          <button type="button" onClick={() => void deleteBanner(item.id)} className="rounded-full border border-[#ffe1e1] bg-[#fff3f3] px-3 py-2 text-sm text-[#9f2b2b]"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => void resetBanners()}
                    className="inline-flex items-center gap-2 rounded-full border border-[#eadbc8] bg-[#fffaf4] px-4 py-2 text-sm font-semibold text-[#8b4d1d]"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Reset Banners
                  </button>
                </div>
              </div>
              <div className="rounded-[30px] bg-white p-6 shadow-[0_18px_40px_-30px_rgba(70,36,15,0.22)]">
                <h2 className="text-2xl font-semibold text-[#34180e]">Edit Banner</h2>
                <p className="mt-2 text-sm text-[#6c4b33]">Upload only the image or video used in the homepage hero.</p>
                <div className="mt-6">
                  <BannerForm
                    value={bannerDraft}
                    onChange={setBannerDraft}
                    onSave={saveBanner}
                    onPickFile={handleBannerFileChange}
                  />
                  {bannerNotice ? (
                    <p className="mt-3 text-sm font-semibold text-[#2f7a34]">{bannerNotice}</p>
                  ) : null}
                </div>
              </div>
            </section>
          ) : null}

          {activeSection === "videos" ? (
            <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
              <div className="rounded-[30px] bg-white p-6 shadow-[0_18px_40px_-30px_rgba(70,36,15,0.22)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-semibold text-[#34180e]">Homepage Videos</h2>
                    <p className="mt-2 text-sm text-[#6c4b33]">Post reel-format videos and YouTube videos with separate options for each type.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVideoDraft(videoTemplate)}
                    className="rounded-full bg-[#34180e] px-4 py-2 text-sm font-semibold text-white"
                  >
                    New Video
                  </button>
                </div>
                <div className="mt-6 space-y-4">
                  {storedHomeContent.videos.map((item, index) => (
                    <div key={item.id} className="rounded-[24px] border border-[#efe1cf] bg-[#fcf8f2] p-4">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-[#34180e]">{resolveLocalizedText(item.title, "en")}</p>
                            <span className="rounded-full bg-[#fff1d9] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b4d1d]">
                              {item.videoType === "youtube" ? "YouTube" : "Reel"}
                            </span>
                          </div>
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#6c4b33]">{resolveLocalizedText(item.description, "en")}</p>
                          <p className="mt-2 truncate text-xs text-[#8b6c52]">{item.videoUrl}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => setVideoDraft(item)} className="rounded-full border border-[#eadbc8] bg-white px-4 py-2 text-sm text-[#6c4b33]">Edit</button>
                          <button type="button" onClick={() => saveStoredHomeContent({ ...storedHomeContent, videos: moveItem(storedHomeContent.videos, index, -1) })} className="rounded-full border border-[#eadbc8] bg-white px-3 py-2 text-sm text-[#6c4b33]"><ArrowUp className="h-4 w-4" /></button>
                          <button type="button" onClick={() => saveStoredHomeContent({ ...storedHomeContent, videos: moveItem(storedHomeContent.videos, index, 1) })} className="rounded-full border border-[#eadbc8] bg-white px-3 py-2 text-sm text-[#6c4b33]"><ArrowDown className="h-4 w-4" /></button>
                          <button type="button" onClick={() => saveStoredHomeContent({ ...storedHomeContent, videos: storedHomeContent.videos.filter((video) => video.id !== item.id) })} className="rounded-full border border-[#ffe1e1] bg-[#fff3f3] px-3 py-2 text-sm text-[#9f2b2b]"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => saveStoredHomeContent({ ...storedHomeContent, videos: defaultHomeContent.videos.map((item) => ({ ...item })) })}
                    className="inline-flex items-center gap-2 rounded-full border border-[#eadbc8] bg-[#fffaf4] px-4 py-2 text-sm font-semibold text-[#8b4d1d]"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Reset Videos
                  </button>
                </div>
              </div>
              <div className="rounded-[30px] bg-white p-6 shadow-[0_18px_40px_-30px_rgba(70,36,15,0.22)]">
                <h2 className="text-2xl font-semibold text-[#34180e]">Edit Video</h2>
                <p className="mt-2 text-sm text-[#6c4b33]">Choose `Reel / Short Video` for vertical clips or `YouTube Video` for embedded long-form content.</p>
                <div className="mt-6">
                  <VideoForm
                    value={videoDraft}
                    onChange={setVideoDraft}
                    onSave={saveVideo}
                    onPickFile={handleVideoFileChange}
                    onPickThumbnailFile={handleVideoThumbnailFileChange}
                  />
                </div>
              </div>
            </section>
          ) : null}

          {activeSection === "orders" ? (
            <section className="space-y-6">
              <div className="rounded-[30px] bg-white p-6 shadow-[0_18px_40px_-30px_rgba(70,36,15,0.22)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-[#34180e]">Orders</h2>
                    <p className="mt-2 text-sm text-[#6c4b33]">Customer orders placed from the cart are managed here.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"] as const).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setOrderStatusFilter(status)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                          orderStatusFilter === status
                            ? "bg-[#34180e] text-white"
                            : "border border-[#eadbc8] bg-white text-[#6c4b33]"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full min-w-[980px] text-left text-sm">
                    <thead className="border-b border-[#efe1cf] text-[#8b6c52]">
                      <tr>
                        <th className="px-4 py-3 font-semibold">ID</th>
                        <th className="px-4 py-3 font-semibold">Customer Name</th>
                        <th className="px-4 py-3 font-semibold">Payment Info</th>
                        <th className="px-4 py-3 font-semibold">Price</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold">Update</th>
                        <th className="px-4 py-3 font-semibold">Items</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
                          <tr key={order.id} className="border-b border-[#f3e8da] align-top">
                            <td className="px-4 py-4 font-semibold text-[#34180e]">{order.id}</td>
                            <td className="px-4 py-4 text-[#5e5a80]">
                              <p>{order.customerName}</p>
                              <p className="mt-1 text-xs text-[#8b6c52]">{order.customerEmail}</p>
                              <p className="mt-1 text-xs text-[#8b6c52]">{order.customerPhone}</p>
                            </td>
                            <td className="px-4 py-4 text-[#5e5a80]">{order.paymentInfo}</td>
                            <td className="px-4 py-4 text-[#34180e]">{order.totalPrice}</td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(order.status)}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <select
                                value={order.status}
                                onChange={(event) =>
                                  updateOrderStatus(order.id, event.target.value as OrderStatus)
                                }
                                className="rounded-xl border border-[#eadbc8] bg-white px-3 py-2 text-sm text-[#34180e]"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="px-4 py-4 text-[#5e5a80]">
                              {order.items.map((item) => `${item.productName} x${item.quantity}`).join(", ")}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-4 py-10 text-center text-[#8b6c52]">
                            No orders match the current filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          ) : null}

          {activeSection === "customers" ? (
            <section className="space-y-6">
              <div className="rounded-[30px] bg-white p-6 shadow-[0_18px_40px_-30px_rgba(70,36,15,0.22)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-semibold text-[#34180e]">Customers</h2>
                    <p className="mt-2 text-sm text-[#6c4b33]">Customers are added here when they log in on the storefront.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddCustomerForm((open) => !open);
                        setEditingCustomerId(null);
                        setCustomerDraft(customerTemplate);
                      }}
                      className="inline-flex items-center gap-2 rounded-full bg-[#34180e] px-4 py-2 text-sm font-semibold text-white"
                    >
                      <Plus className="h-4 w-4" />
                      Add Customer
                    </button>
                    <button
                      type="button"
                      onClick={downloadCustomersExcel}
                      className="inline-flex items-center gap-2 rounded-full border border-[#eadbc8] bg-[#fffaf4] px-4 py-2 text-sm font-semibold text-[#8b4d1d]"
                    >
                      <Download className="h-4 w-4" />
                      Download Excel
                    </button>
                  </div>
                </div>
                {showAddCustomerForm ? (
                  <div className="mt-5 grid gap-3 rounded-2xl border border-[#efe1cf] bg-[#fcf8f2] p-4 md:grid-cols-2">
                    <input
                      value={customerDraft.name}
                      onChange={(event) => setCustomerDraft((current) => ({ ...current, name: event.target.value }))}
                      placeholder="Customer name"
                      className="rounded-xl border border-[#eadbc8] bg-white px-4 py-3 text-sm text-[#34180e] outline-none"
                    />
                    <input
                      value={customerDraft.email}
                      onChange={(event) => setCustomerDraft((current) => ({ ...current, email: event.target.value }))}
                      placeholder="Email address"
                      className="rounded-xl border border-[#eadbc8] bg-white px-4 py-3 text-sm text-[#34180e] outline-none"
                    />
                    <input
                      value={customerDraft.phone}
                      onChange={(event) => setCustomerDraft((current) => ({ ...current, phone: event.target.value }))}
                      placeholder="Phone number (optional)"
                      className="rounded-xl border border-[#eadbc8] bg-white px-4 py-3 text-sm text-[#34180e] outline-none"
                    />
                    <input
                      value={customerDraft.address}
                      onChange={(event) => setCustomerDraft((current) => ({ ...current, address: event.target.value }))}
                      placeholder="Address (optional)"
                      className="rounded-xl border border-[#eadbc8] bg-white px-4 py-3 text-sm text-[#34180e] outline-none"
                    />
                    <div className="flex items-center gap-2 md:col-span-2">
                      <button
                        type="button"
                        onClick={saveCustomer}
                        className="rounded-full bg-[#34180e] px-4 py-2 text-sm font-semibold text-white"
                      >
                        {editingCustomerId ? "Update Customer" : "Save Customer"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddCustomerForm(false);
                          setEditingCustomerId(null);
                          setCustomerDraft(customerTemplate);
                        }}
                        className="rounded-full border border-[#eadbc8] bg-white px-4 py-2 text-sm font-semibold text-[#6c4b33]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full min-w-[920px] text-left text-sm">
                    <thead className="border-b border-[#efe1cf] text-[#8b6c52]">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Customer</th>
                        <th className="px-4 py-3 font-semibold">Email</th>
                        <th className="px-4 py-3 font-semibold">Phone</th>
                        <th className="px-4 py-3 font-semibold">Orders</th>
                        <th className="px-4 py-3 font-semibold">Total Spend</th>
                        <th className="px-4 py-3 font-semibold">Last Login</th>
                        <th className="px-4 py-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.length > 0 ? (
                        filteredCustomers.map((customer) => (
                          <tr key={customer.id} className="border-b border-[#f3e8da]">
                            <td className="px-4 py-4 font-semibold text-[#34180e]">
                              <p>{customer.name}</p>
                              <p className="mt-1 text-xs text-[#8b6c52]">{customer.address || "No address added yet"}</p>
                            </td>
                            <td className="px-4 py-4 text-[#5e5a80]">{customer.email}</td>
                            <td className="px-4 py-4 text-[#5e5a80]">{customer.phone || "Not provided"}</td>
                            <td className="px-4 py-4 text-[#34180e]">{customer.ordersCount}</td>
                            <td className="px-4 py-4 text-[#34180e]">{formatCurrency(customer.totalSpent)}</td>
                            <td className="px-4 py-4 text-[#5e5a80]">{formatDate(customer.lastLoginAt)}</td>
                            <td className="px-4 py-4">
                              <button
                                type="button"
                                onClick={() => editCustomer(customer)}
                                className="inline-flex items-center gap-1 rounded-full border border-[#eadbc8] bg-white px-3 py-1.5 text-xs font-semibold text-[#6c4b33]"
                              >
                                <SquarePen className="h-3.5 w-3.5" />
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-4 py-10 text-center text-[#8b6c52]">
                            No customers found yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          ) : null}

          {activeSection === "reviews" ? (
            <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
              <div className="rounded-[30px] bg-white p-6 shadow-[0_18px_40px_-30px_rgba(70,36,15,0.22)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-semibold text-[#34180e]">Customer Reviews</h2>
                    <p className="mt-2 text-sm text-[#6c4b33]">Edit testimonials shown in the homepage review section.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReviewDraft(reviewTemplate)}
                    className="rounded-full bg-[#34180e] px-4 py-2 text-sm font-semibold text-white"
                  >
                    <Plus className="mr-1 inline h-4 w-4" />
                    New Review
                  </button>
                </div>
                <div className="mt-6 space-y-4">
                  {storedHomeContent.reviews.map((item, index) => (
                    <div key={item.id} className="rounded-[24px] border border-[#efe1cf] bg-[#fcf8f2] p-4">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-[#34180e]">{resolveLocalizedText(item.authorName, "en")}</p>
                          <p className="mt-1 text-sm text-[#8b6c52]">
                            {resolveLocalizedText(item.location, "en")} • {item.rating}/5
                          </p>
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#6c4b33]">{resolveLocalizedText(item.reviewText, "en")}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => setReviewDraft(item)} className="rounded-full border border-[#eadbc8] bg-white px-4 py-2 text-sm text-[#6c4b33]">Edit</button>
                          <button type="button" onClick={() => saveStoredHomeContent({ ...storedHomeContent, reviews: moveItem(storedHomeContent.reviews, index, -1) })} className="rounded-full border border-[#eadbc8] bg-white px-3 py-2 text-sm text-[#6c4b33]"><ArrowUp className="h-4 w-4" /></button>
                          <button type="button" onClick={() => saveStoredHomeContent({ ...storedHomeContent, reviews: moveItem(storedHomeContent.reviews, index, 1) })} className="rounded-full border border-[#eadbc8] bg-white px-3 py-2 text-sm text-[#6c4b33]"><ArrowDown className="h-4 w-4" /></button>
                          <button type="button" onClick={() => saveStoredHomeContent({ ...storedHomeContent, reviews: storedHomeContent.reviews.filter((review) => review.id !== item.id) })} className="rounded-full border border-[#ffe1e1] bg-[#fff3f3] px-3 py-2 text-sm text-[#9f2b2b]"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => saveStoredHomeContent({ ...storedHomeContent, reviews: defaultHomeContent.reviews.map((item) => ({ ...item })) })}
                    className="inline-flex items-center gap-2 rounded-full border border-[#eadbc8] bg-[#fffaf4] px-4 py-2 text-sm font-semibold text-[#8b4d1d]"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Reset Reviews
                  </button>
                </div>
              </div>
              <div className="rounded-[30px] bg-white p-6 shadow-[0_18px_40px_-30px_rgba(70,36,15,0.22)]">
                <h2 className="text-2xl font-semibold text-[#34180e]">Edit Review</h2>
                <p className="mt-2 text-sm text-[#6c4b33]">Reviews edited here are used immediately on the website.</p>
                <div className="mt-6">
                  <ReviewForm value={reviewDraft} onChange={setReviewDraft} onSave={saveReview} />
                </div>
              </div>
            </section>
          ) : null}
        </main>
        </div>
      </div>
    </div>
  );
}
