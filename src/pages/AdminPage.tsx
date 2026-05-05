import { Link, useNavigate } from "@/lib/spa-router";
import { useMemo, useState, type ChangeEvent } from "react";
import {
  ArrowDown,
  ArrowUp,
  Film,
  ImagePlus,
  LayoutPanelTop,
  LogOut,
  MessageSquareQuote,
  Package,
  Plus,
  RefreshCcw,
  Save,
  Search,
  Shapes,
  ShoppingCart,
  Trash2,
  Upload,
  UserRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { homeContent as defaultHomeContent } from "@/data/home-content";
import type { Product } from "@/data/products";
import { productCategories } from "@/data/products";
import type { CatalogueType } from "@/lib/catalogue-types";
import { defaultCatalogueTypes } from "@/lib/catalogue-types";
import { logoutAdmin } from "@/lib/admin-auth";
import { parseCurrencyAmount } from "@/lib/utils";
import {
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
  type OrderStatus,
  updateOrderStatus,
  useStoredCustomers,
  useStoredOrders,
} from "@/lib/customer-orders";

const productTemplate: Product = {
  id: "",
  name: "",
  price: "Rs. 0",
  image: "",
  category: "Statues",
  tag: "",
  shortDescription: "",
  details: "",
  material: "",
  dimensions: "",
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
  videoUrl: "",
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

const adminMenuItems: Array<{
  id: AdminSection;
  label: string;
  icon: LucideIcon;
}> = [
  { id: "dashboard", label: "Dashboard", icon: LayoutPanelTop },
  { id: "products", label: "Products", icon: Package },
  { id: "categories", label: "Categories", icon: Shapes },
  { id: "banners", label: "Banners", icon: ImagePlus },
  { id: "videos", label: "Videos", icon: Film },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "customers", label: "Customers", icon: UserRound },
  { id: "reviews", label: "Reviews", icon: MessageSquareQuote },
];

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

function ProductForm({
  value,
  onChange,
  onSave,
}: {
  value: Product;
  onChange: (value: Product) => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <input
          value={value.name}
          onChange={(event) => onChange({ ...value, name: event.target.value })}
          placeholder="Product name"
          className="rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] outline-none"
        />
        <input
          value={value.price}
          onChange={(event) => onChange({ ...value, price: event.target.value })}
          placeholder="Rs. 5,100"
          className="rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] outline-none"
        />
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
          {productCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <input
          value={value.tag}
          onChange={(event) => onChange({ ...value, tag: event.target.value })}
          placeholder="Featured / New / Popular"
          className="rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] outline-none"
        />
      </div>
      <input
        value={value.image}
        onChange={(event) => onChange({ ...value, image: event.target.value })}
        placeholder="Image URL or data image"
        className="w-full rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] outline-none"
      />
      <textarea
        value={value.shortDescription}
        onChange={(event) => onChange({ ...value, shortDescription: event.target.value })}
        rows={3}
        placeholder="Short description"
        className="w-full rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] outline-none"
      />
      <textarea
        value={value.details}
        onChange={(event) => onChange({ ...value, details: event.target.value })}
        rows={4}
        placeholder="Full details"
        className="w-full rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] outline-none"
      />
      <div className="grid gap-4 md:grid-cols-2">
        <input
          value={value.material}
          onChange={(event) => onChange({ ...value, material: event.target.value })}
          placeholder="Material"
          className="rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] outline-none"
        />
        <input
          value={value.dimensions}
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
}: {
  value: CatalogueType;
  onChange: (value: CatalogueType) => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <input
          value={value.title}
          onChange={(event) => onChange({ ...value, title: event.target.value })}
          placeholder="Catalogue title"
          className="rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] outline-none"
        />
        <input
          value={value.shortLabel}
          onChange={(event) => onChange({ ...value, shortLabel: event.target.value })}
          placeholder="Short label"
          className="rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] outline-none"
        />
      </div>
      <input
        value={value.itemCountLabel}
        onChange={(event) => onChange({ ...value, itemCountLabel: event.target.value })}
        placeholder="170 products"
        className="w-full rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] outline-none"
      />
      <input
        value={value.image}
        onChange={(event) => onChange({ ...value, image: event.target.value })}
        placeholder="Image URL or data image"
        className="w-full rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] outline-none"
      />
      <textarea
        value={value.description}
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
        Show this catalogue on the storefront
      </label>
      <button
        type="button"
        onClick={onSave}
        className="inline-flex items-center gap-2 rounded-full bg-[#34180e] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white"
      >
        <Save className="h-4 w-4" />
        Save Catalogue
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
  return (
    <div className="space-y-4">
      <input
        value={value.eyebrow}
        onChange={(event) => onChange({ ...value, eyebrow: event.target.value })}
        placeholder="Eyebrow"
        className="w-full rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] outline-none"
      />
      <div className="grid gap-4 md:grid-cols-2">
        <input
          value={value.titleTop}
          onChange={(event) => onChange({ ...value, titleTop: event.target.value })}
          placeholder="Top title"
          className="rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] outline-none"
        />
        <input
          value={value.titleBottom}
          onChange={(event) => onChange({ ...value, titleBottom: event.target.value })}
          placeholder="Bottom title"
          className="rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] outline-none"
        />
      </div>
      <label className="block rounded-2xl border border-dashed border-[#d8b48b] bg-[#fffaf4] p-4 text-sm text-[#6c4b33]">
        <span className="mb-2 flex items-center gap-2 font-semibold text-[#34180e]">
          <Upload className="h-4 w-4" />
          Upload banner image file
        </span>
        <p className="mb-2 text-xs text-[#8b6c52]">
          Pick a single image file to replace the homepage banner.
        </p>
        <input type="file" accept="image/*" onChange={onPickFile} className="mt-2 block w-full text-sm" />
      </label>
      <textarea
        value={value.copy}
        onChange={(event) => onChange({ ...value, copy: event.target.value })}
        rows={4}
        placeholder="Banner copy"
        className="w-full rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] outline-none"
      />
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
}: {
  value: HomeVideo;
  onChange: (value: HomeVideo) => void;
  onSave: () => void;
  onPickFile: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-4">
      <input
        value={value.title}
        onChange={(event) => onChange({ ...value, title: event.target.value })}
        placeholder="Video title"
        className="w-full rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] outline-none"
      />
      <label className="block rounded-2xl border border-dashed border-[#d8b48b] bg-[#fffaf4] p-4 text-sm text-[#6c4b33]">
        <span className="mb-2 flex items-center gap-2 font-semibold text-[#34180e]">
          <Upload className="h-4 w-4" />
          Upload video file
        </span>
        <p className="mb-2 text-xs text-[#8b6c52]">
          Upload a small MP4/WebM file. Browser storage is limited on static hosting.
        </p>
        <input type="file" accept="video/*" onChange={onPickFile} className="mt-2 block w-full text-sm" />
      </label>
      <textarea
        value={value.description}
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
          value={value.authorName}
          onChange={(event) => onChange({ ...value, authorName: event.target.value })}
          placeholder="Author name"
          className="rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] outline-none"
        />
        <input
          value={value.location}
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
        value={value.reviewText}
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
    <div className="rounded-[30px] bg-white p-5 shadow-[0_18px_40px_-30px_rgba(70,36,15,0.28)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-[#9b7757]">{label}</p>
          <p className="mt-3 text-3xl font-semibold text-[#34180e]">{value}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-[#fff1d9] text-[#b17024]">
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
  const [mediaNotice, setMediaNotice] = useState("");

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

  const sectionTitle = {
    dashboard: "Dashboard",
    products: "Products",
    categories: "Categories",
    banners: "Home Banners",
    videos: "Featured Videos",
    orders: "Orders",
    customers: "Customers",
    reviews: "Customer Reviews",
  }[activeSection];

  function handleLogout() {
    logoutAdmin();
    navigate({ to: "/admin-login" });
  }

  function saveProduct() {
    const nextProduct: Product = {
      ...productDraft,
      id: productDraft.id || slugify(productDraft.name) || uniqueId("product"),
    };

    const next = [...products];
    const existingIndex = next.findIndex((item) => item.id === nextProduct.id);

    if (existingIndex >= 0) next[existingIndex] = nextProduct;
    else next.unshift(nextProduct);

    saveStoredProducts(next);
    setProductDraft(nextProduct);
  }

  function saveCatalogue() {
    const nextCatalogue: CatalogueType = {
      ...catalogueDraft,
      id:
        catalogueDraft.id ||
        `${slugify(catalogueDraft.title || catalogueDraft.shortLabel)}-catalogue` ||
        uniqueId("catalogue"),
      sortOrder: catalogueDraft.sortOrder || orderedCatalogues.length + 1,
    };

    const next = [...orderedCatalogues];
    const existingIndex = next.findIndex((item) => item.id === nextCatalogue.id);

    if (existingIndex >= 0) next[existingIndex] = nextCatalogue;
    else next.push(nextCatalogue);

    saveStoredCatalogueTypes(next.map((item, index) => ({ ...item, sortOrder: index + 1 })));
    setCatalogueDraft(nextCatalogue);
  }

  function saveBanner() {
    const nextBanner = { ...bannerDraft, id: bannerDraft.id || uniqueId("banner") };
    const next = [...storedHomeContent.banners];
    const existingIndex = next.findIndex((item) => item.id === nextBanner.id);

    if (existingIndex >= 0) next[existingIndex] = nextBanner;
    else next.push(nextBanner);

    saveStoredHomeContent({ ...storedHomeContent, banners: next });
    setBannerDraft(nextBanner);
  }

  function saveVideo() {
    const nextVideo = { ...videoDraft, id: videoDraft.id || uniqueId("video") };
    const next = [...storedHomeContent.videos];
    const existingIndex = next.findIndex((item) => item.id === nextVideo.id);

    if (existingIndex >= 0) next[existingIndex] = nextVideo;
    else next.push(nextVideo);

    saveStoredHomeContent({ ...storedHomeContent, videos: next });
    setVideoDraft(nextVideo);
  }

  function saveReview() {
    const nextReview = { ...reviewDraft, id: reviewDraft.id || uniqueId("review") };
    const next = [...storedHomeContent.reviews];
    const existingIndex = next.findIndex((item) => item.id === nextReview.id);

    if (existingIndex >= 0) next[existingIndex] = nextReview;
    else next.push(nextReview);

    saveStoredHomeContent({ ...storedHomeContent, reviews: next });
    setReviewDraft(nextReview);
  }

  async function handleBannerFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await fileToDataUrl(file, 2);
      setBannerDraft((current) => ({ ...current, image: dataUrl }));
      setMediaNotice(`Banner file "${file.name}" loaded successfully.`);
    } catch (error) {
      setMediaNotice(error instanceof Error ? error.message : "Unable to load the banner file.");
    }
  }

  async function handleVideoFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await fileToDataUrl(file, 4);
      setVideoDraft((current) => ({ ...current, videoUrl: dataUrl }));
      setMediaNotice(
        `Video file "${file.name}" loaded successfully. Keep uploaded videos small for static hosting.`,
      );
    } catch (error) {
      setMediaNotice(error instanceof Error ? error.message : "Unable to load the video file.");
    }
  }

  return (
    <div className="bg-[#f7f1e7] px-4 py-6 md:px-6 md:py-8">
      <div className="layout-shell grid gap-6 xl:grid-cols-[270px_1fr]">
        <aside className="sticky top-6 h-fit rounded-[30px] bg-[linear-gradient(180deg,#6f55dc_0%,#5b45c8_100%)] p-6 text-white shadow-[0_24px_60px_-40px_rgba(11,7,34,0.8)]">
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
            {adminMenuItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`flex w-full items-center gap-3 rounded-[18px] px-4 py-3 text-left text-sm font-semibold transition ${
                  activeSection === item.id
                    ? "bg-white/16 text-[#ffe08a]"
                    : "bg-white/8 text-[#f3eeff] hover:bg-white/12"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </div>
        </aside>

        <main className="space-y-6">
          <section className="rounded-[30px] bg-white p-6 shadow-[0_24px_60px_-40px_rgba(70,36,15,0.2)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-[#a86c2b]">Admin Dashboard</p>
                <h1 className="mt-3 font-heading text-3xl text-[#34180e]">{sectionTitle}</h1>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="relative min-w-[240px] flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b6c52]" />
                  <input
                    type="text"
                    value={activeSection === "orders" ? orderSearch : activeSection === "customers" ? customerSearch : ""}
                    onChange={(event) => {
                      if (activeSection === "orders") setOrderSearch(event.target.value);
                      if (activeSection === "customers") setCustomerSearch(event.target.value);
                    }}
                    placeholder={
                      activeSection === "orders"
                        ? "Search orders"
                        : activeSection === "customers"
                        ? "Search customers"
                        : "Switch to orders or customers to search"
                    }
                    className="w-full rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] py-3 pl-11 pr-4 text-sm text-[#34180e] outline-none"
                  />
                </div>
                <Link
                  to="/"
                  className="rounded-full border border-[#e8d7c1] px-4 py-2 text-sm font-semibold text-[#6c4b33] transition hover:bg-[#fcf8f2]"
                >
                  View Store
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-full bg-[#34180e] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#221008]"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
            {mediaNotice ? <p className="mt-4 text-sm font-medium text-[#8b4d1d]">{mediaNotice}</p> : null}
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {stats.map((item) => (
              <StatCard key={item.label} label={item.label} value={item.value} icon={item.icon} />
            ))}
          </section>

          {activeSection === "dashboard" ? (
            <section className="space-y-6">
              <div className="rounded-[30px] bg-white p-6 shadow-[0_18px_40px_-30px_rgba(70,36,15,0.22)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-semibold text-[#34180e]">Recent Transactions</h2>
                    <p className="mt-2 text-sm text-[#6c4b33]">
                      Orders placed from the website show up here automatically.
                    </p>
                  </div>
                </div>
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full min-w-[780px] text-left text-sm">
                    <thead className="border-b border-[#efe1cf] text-[#8b6c52]">
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
                          <tr key={order.id} className="border-b border-[#f3e8da]">
                            <td className="px-4 py-4 font-semibold text-[#34180e]">{order.id}</td>
                            <td className="px-4 py-4 text-[#5e5a80]">{order.customerName}</td>
                            <td className="px-4 py-4 text-[#5e5a80]">{order.paymentInfo}</td>
                            <td className="px-4 py-4 text-[#34180e]">{order.totalPrice}</td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(order.status)}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-[#5e5a80]">{formatDate(order.createdAt)}</td>
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
            <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
              <div className="rounded-[30px] bg-white p-6 shadow-[0_18px_40px_-30px_rgba(70,36,15,0.22)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-semibold text-[#34180e]">Product Catalog</h2>
                    <p className="mt-2 text-sm text-[#6c4b33]">
                      Add, edit, reorder, or remove products shown on the website.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProductDraft(productTemplate)}
                    className="rounded-full bg-[#34180e] px-4 py-2 text-sm font-semibold text-white"
                  >
                    New Product
                  </button>
                </div>
                <div className="mt-6 space-y-4">
                  {products.map((item, index) => (
                    <div key={item.id} className="rounded-[24px] border border-[#efe1cf] bg-[#fcf8f2] p-4">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                          <img src={item.image} alt={item.name} className="h-16 w-16 rounded-2xl object-cover" />
                          <div>
                            <p className="font-semibold text-[#34180e]">{item.name}</p>
                            <p className="mt-1 text-sm text-[#6c4b33]">
                              {item.category} • {item.price}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => setProductDraft(item)} className="rounded-full border border-[#eadbc8] bg-white px-4 py-2 text-sm text-[#6c4b33]">Edit</button>
                          <button type="button" onClick={() => saveStoredProducts(moveItem(products, index, -1))} className="rounded-full border border-[#eadbc8] bg-white px-3 py-2 text-sm text-[#6c4b33]"><ArrowUp className="h-4 w-4" /></button>
                          <button type="button" onClick={() => saveStoredProducts(moveItem(products, index, 1))} className="rounded-full border border-[#eadbc8] bg-white px-3 py-2 text-sm text-[#6c4b33]"><ArrowDown className="h-4 w-4" /></button>
                          <button type="button" onClick={() => saveStoredProducts(products.filter((product) => product.id !== item.id))} className="rounded-full border border-[#ffe1e1] bg-[#fff3f3] px-3 py-2 text-sm text-[#9f2b2b]"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[30px] bg-white p-6 shadow-[0_18px_40px_-30px_rgba(70,36,15,0.22)]">
                <h2 className="text-2xl font-semibold text-[#34180e]">Edit Product</h2>
                <p className="mt-2 text-sm text-[#6c4b33]">Save product changes to update the website catalog.</p>
                <div className="mt-6">
                  <ProductForm value={productDraft} onChange={setProductDraft} onSave={saveProduct} />
                </div>
              </div>
            </section>
          ) : null}

          {activeSection === "categories" ? (
            <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
              <div className="rounded-[30px] bg-white p-6 shadow-[0_18px_40px_-30px_rgba(70,36,15,0.22)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-semibold text-[#34180e]">Categories</h2>
                    <p className="mt-2 text-sm text-[#6c4b33]">Control which catalogue cards appear on the site.</p>
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
                          <p className="font-semibold text-[#34180e]">{item.title}</p>
                          <p className="mt-1 text-sm text-[#6c4b33]">
                            {item.shortLabel} • {item.isActive ? "Visible" : "Hidden"}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => setCatalogueDraft(item)} className="rounded-full border border-[#eadbc8] bg-white px-4 py-2 text-sm text-[#6c4b33]">Edit</button>
                          <button type="button" onClick={() => saveStoredCatalogueTypes(moveItem(orderedCatalogues, index, -1).map((catalogue, order) => ({ ...catalogue, sortOrder: order + 1 })))} className="rounded-full border border-[#eadbc8] bg-white px-3 py-2 text-sm text-[#6c4b33]"><ArrowUp className="h-4 w-4" /></button>
                          <button type="button" onClick={() => saveStoredCatalogueTypes(moveItem(orderedCatalogues, index, 1).map((catalogue, order) => ({ ...catalogue, sortOrder: order + 1 })))} className="rounded-full border border-[#eadbc8] bg-white px-3 py-2 text-sm text-[#6c4b33]"><ArrowDown className="h-4 w-4" /></button>
                          <button type="button" onClick={() => saveStoredCatalogueTypes(orderedCatalogues.filter((catalogue) => catalogue.id !== item.id).map((catalogue, order) => ({ ...catalogue, sortOrder: order + 1 })))} className="rounded-full border border-[#ffe1e1] bg-[#fff3f3] px-3 py-2 text-sm text-[#9f2b2b]"><Trash2 className="h-4 w-4" /></button>
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
                <p className="mt-2 text-sm text-[#6c4b33]">Category changes update the homepage and catalogue screens.</p>
                <div className="mt-6">
                  <CatalogueForm value={catalogueDraft} onChange={setCatalogueDraft} onSave={saveCatalogue} />
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
                    <p className="mt-2 text-sm text-[#6c4b33]">These changes are reflected directly on the home hero section.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBannerDraft(bannerTemplate)}
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
                          <p className="text-xs uppercase tracking-[0.24em] text-[#a86c2b]">{item.eyebrow}</p>
                          <p className="mt-2 font-heading text-2xl text-[#34180e]">{item.titleTop} {item.titleBottom}</p>
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#6c4b33]">{item.copy}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => setBannerDraft(item)} className="rounded-full border border-[#eadbc8] bg-white px-4 py-2 text-sm text-[#6c4b33]">Edit</button>
                          <button type="button" onClick={() => saveStoredHomeContent({ ...storedHomeContent, banners: moveItem(storedHomeContent.banners, index, -1) })} className="rounded-full border border-[#eadbc8] bg-white px-3 py-2 text-sm text-[#6c4b33]"><ArrowUp className="h-4 w-4" /></button>
                          <button type="button" onClick={() => saveStoredHomeContent({ ...storedHomeContent, banners: moveItem(storedHomeContent.banners, index, 1) })} className="rounded-full border border-[#eadbc8] bg-white px-3 py-2 text-sm text-[#6c4b33]"><ArrowDown className="h-4 w-4" /></button>
                          <button type="button" onClick={() => saveStoredHomeContent({ ...storedHomeContent, banners: storedHomeContent.banners.filter((banner) => banner.id !== item.id) })} className="rounded-full border border-[#ffe1e1] bg-[#fff3f3] px-3 py-2 text-sm text-[#9f2b2b]"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => saveStoredHomeContent({ ...storedHomeContent, banners: defaultHomeContent.banners.map((item) => ({ ...item })) })}
                    className="inline-flex items-center gap-2 rounded-full border border-[#eadbc8] bg-[#fffaf4] px-4 py-2 text-sm font-semibold text-[#8b4d1d]"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Reset Banners
                  </button>
                </div>
              </div>
              <div className="rounded-[30px] bg-white p-6 shadow-[0_18px_40px_-30px_rgba(70,36,15,0.22)]">
                <h2 className="text-2xl font-semibold text-[#34180e]">Edit Banner</h2>
                <p className="mt-2 text-sm text-[#6c4b33]">Upload an image file to update the homepage banner.</p>
                <div className="mt-6">
                  <BannerForm
                    value={bannerDraft}
                    onChange={setBannerDraft}
                    onSave={saveBanner}
                    onPickFile={handleBannerFileChange}
                  />
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
                    <p className="mt-2 text-sm text-[#6c4b33]">Add small uploaded videos or hosted video links.</p>
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
                          <p className="font-semibold text-[#34180e]">{item.title}</p>
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#6c4b33]">{item.description}</p>
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
                <p className="mt-2 text-sm text-[#6c4b33]">Upload a small video file to update the homepage video section.</p>
                <div className="mt-6">
                  <VideoForm
                    value={videoDraft}
                    onChange={setVideoDraft}
                    onSave={saveVideo}
                    onPickFile={handleVideoFileChange}
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
                </div>
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
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-4 py-10 text-center text-[#8b6c52]">
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
                          <p className="font-semibold text-[#34180e]">{item.authorName}</p>
                          <p className="mt-1 text-sm text-[#8b6c52]">
                            {item.location} • {item.rating}/5
                          </p>
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#6c4b33]">{item.reviewText}</p>
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
  );
}
