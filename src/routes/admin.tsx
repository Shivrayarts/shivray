import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  CirclePlus,
  FileText,
  FolderTree,
  Images,
  ImagePlus,
  LayoutDashboard,
  LogOut,
  Package,
  Pencil,
  Search,
  ShoppingBag,
  Star,
  Trash2,
  UserCircle2,
  Users,
} from "lucide-react";
import { useEffect, useEffectEvent, useMemo, useState } from "react";
import { isAdminAuthenticated, logoutAdmin } from "@/lib/admin-auth";
import { productCategories, type Product } from "@/data/products";
import { useServerFn } from "@tanstack/react-start";
import logoImage from "@/assets/logo-dark.jpg";
import {
  getAdminDashboardDataServer,
  type AdminDashboardData,
} from "@/lib/server/admin.functions";
import {
  createCatalogueInDbServer,
  deleteCatalogueFromDbServer,
  getAdminCatalogueTypesFromDbServer,
  type AdminCatalogueType,
  updateCatalogueInDbServer,
} from "@/lib/server/catalogues.functions";
import {
  createBannerInDbServer,
  createReviewInDbServer,
  createVideoInDbServer,
  deleteBannerFromDbServer,
  deleteReviewFromDbServer,
  deleteVideoFromDbServer,
  getAdminHomePageContentServer,
  type AdminHomeBanner,
  type AdminHomePageContent,
  type AdminHomeReview,
  type AdminHomeVideo,
  updateBannerInDbServer,
  updateReviewInDbServer,
  updateVideoInDbServer,
} from "@/lib/server/home-content.functions";
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

type CatalogueFormState = {
  title: string;
  shortLabel: string;
  description: string;
  image: string;
  itemCountLabel: string;
};

type EditCatalogueFormState = CatalogueFormState & {
  id: string;
  isActive: boolean;
  sortOrder: string;
};

type BannerFormState = {
  eyebrow: string;
  titleTop: string;
  titleBottom: string;
  copy: string;
  image: string;
};

type EditBannerFormState = BannerFormState & {
  id: string;
  isActive: boolean;
  sortOrder: string;
};

type ReviewFormState = {
  authorName: string;
  reviewText: string;
  rating: string;
  location: string;
};

type EditReviewFormState = ReviewFormState & {
  id: string;
  isActive: boolean;
  sortOrder: string;
};

type VideoFormState = {
  title: string;
  description: string;
  videoUrl: string;
};

type EditVideoFormState = VideoFormState & {
  id: string;
  isActive: boolean;
  sortOrder: string;
};

type AdminSection = (typeof adminMenu)[number]["label"];

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

const initialCatalogueForm: CatalogueFormState = {
  title: "",
  shortLabel: "",
  description: "",
  image: "",
  itemCountLabel: "",
};

const initialBannerForm: BannerFormState = {
  eyebrow: "",
  titleTop: "",
  titleBottom: "",
  copy: "",
  image: "",
};

const initialReviewForm: ReviewFormState = {
  authorName: "",
  reviewText: "",
  rating: "5",
  location: "",
};

const initialVideoForm: VideoFormState = {
  title: "",
  description: "",
  videoUrl: "",
};

const adminMenu = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Products", icon: Package },
  { label: "Catalogues", icon: Images },
  { label: "Banners", icon: ImagePlus },
  { label: "Videos", icon: Bell },
  { label: "Reviews", icon: Star },
  { label: "Categories", icon: FolderTree },
  { label: "Orders", icon: FileText },
  { label: "Customers", icon: Users },
] as const;

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

function toEditCatalogueForm(catalogue: AdminCatalogueType): EditCatalogueFormState {
  return {
    id: catalogue.id,
    title: catalogue.title,
    shortLabel: catalogue.shortLabel,
    description: catalogue.description,
    image: catalogue.image,
    itemCountLabel: catalogue.itemCountLabel,
    isActive: catalogue.isActive,
    sortOrder: String(catalogue.sortOrder),
  };
}

function toEditBannerForm(banner: AdminHomeBanner): EditBannerFormState {
  return {
    id: banner.id,
    eyebrow: banner.eyebrow,
    titleTop: banner.titleTop,
    titleBottom: banner.titleBottom,
    copy: banner.copy,
    image: banner.image,
    isActive: banner.isActive,
    sortOrder: String(banner.sortOrder),
  };
}

function toEditReviewForm(review: AdminHomeReview): EditReviewFormState {
  return {
    id: review.id,
    authorName: review.authorName,
    reviewText: review.reviewText,
    rating: String(review.rating),
    location: review.location,
    isActive: review.isActive,
    sortOrder: String(review.sortOrder),
  };
}

function toEditVideoForm(video: AdminHomeVideo): EditVideoFormState {
  return {
    id: video.id,
    title: video.title,
    description: video.description,
    videoUrl: video.videoUrl,
    isActive: video.isActive,
    sortOrder: String(video.sortOrder),
  };
}

function AdminDashboardPage() {
  const navigate = useNavigate();
  const [isAllowed, setIsAllowed] = useState(false);
  const [activeSection, setActiveSection] = useState<AdminSection>("Dashboard");
  const [form, setForm] = useState<ProductFormState>(initialProductForm);
  const [catalogueForm, setCatalogueForm] = useState<CatalogueFormState>(initialCatalogueForm);
  const [bannerForm, setBannerForm] = useState<BannerFormState>(initialBannerForm);
  const [reviewForm, setReviewForm] = useState<ReviewFormState>(initialReviewForm);
  const [videoForm, setVideoForm] = useState<VideoFormState>(initialVideoForm);
  const [selectedImageName, setSelectedImageName] = useState("");
  const [catalogueImageName, setCatalogueImageName] = useState("");
  const [bannerImageName, setBannerImageName] = useState("");
  const [editImageName, setEditImageName] = useState("");
  const [editCatalogueImageName, setEditCatalogueImageName] = useState("");
  const [editBannerImageName, setEditBannerImageName] = useState("");
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [catalogues, setCatalogues] = useState<AdminCatalogueType[]>([]);
  const [homeContent, setHomeContent] = useState<AdminHomePageContent>({
    banners: [],
    reviews: [],
    videos: [],
  });
  const [adminSearch, setAdminSearch] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<AdminDashboardData>({
    stats: {
      totalSales: 0,
      orderCount: 0,
      customerCount: 0,
      enquiryCount: 0,
    },
    orders: [],
    customers: [],
    inquiries: [],
  });
  const [editForm, setEditForm] = useState<EditProductFormState | null>(null);
  const [editCatalogueForm, setEditCatalogueForm] = useState<EditCatalogueFormState | null>(null);
  const [editBannerForm, setEditBannerForm] = useState<EditBannerFormState | null>(null);
  const [editReviewForm, setEditReviewForm] = useState<EditReviewFormState | null>(null);
  const [editVideoForm, setEditVideoForm] = useState<EditVideoFormState | null>(null);
  const [saveMessage, setSaveMessage] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [catalogueMessage, setCatalogueMessage] = useState("");
  const [catalogueEditMessage, setCatalogueEditMessage] = useState("");
  const [bannerMessage, setBannerMessage] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [videoMessage, setVideoMessage] = useState("");
  const [bannerEditMessage, setBannerEditMessage] = useState("");
  const [reviewEditMessage, setReviewEditMessage] = useState("");
  const [videoEditMessage, setVideoEditMessage] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCatalogueUpdating, setIsCatalogueUpdating] = useState(false);
  const [isBannerUpdating, setIsBannerUpdating] = useState(false);
  const [isReviewUpdating, setIsReviewUpdating] = useState(false);
  const [isVideoUpdating, setIsVideoUpdating] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [deletingCatalogueId, setDeletingCatalogueId] = useState<string | null>(null);
  const [deletingBannerId, setDeletingBannerId] = useState<string | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);

  const fetchAdminProducts = useServerFn(getAdminProductsFromDbServer);
  const fetchAdminCatalogues = useServerFn(getAdminCatalogueTypesFromDbServer);
  const fetchAdminHomeContent = useServerFn(getAdminHomePageContentServer);
  const fetchDashboardData = useServerFn(getAdminDashboardDataServer);
  const createProduct = useServerFn(createProductInDbServer);
  const updateProduct = useServerFn(updateProductInDbServer);
  const deleteProduct = useServerFn(deleteProductFromDbServer);
  const createCatalogue = useServerFn(createCatalogueInDbServer);
  const updateCatalogue = useServerFn(updateCatalogueInDbServer);
  const deleteCatalogue = useServerFn(deleteCatalogueFromDbServer);
  const createBanner = useServerFn(createBannerInDbServer);
  const updateBanner = useServerFn(updateBannerInDbServer);
  const deleteBanner = useServerFn(deleteBannerFromDbServer);
  const createReview = useServerFn(createReviewInDbServer);
  const updateReview = useServerFn(updateReviewInDbServer);
  const deleteReview = useServerFn(deleteReviewFromDbServer);
  const createVideo = useServerFn(createVideoInDbServer);
  const updateVideo = useServerFn(updateVideoInDbServer);
  const deleteVideo = useServerFn(deleteVideoFromDbServer);

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

  async function refreshCatalogues() {
    const latest = await fetchAdminCatalogues();
    setCatalogues(latest);
  }

  async function refreshHomeContent() {
    const latest = await fetchAdminHomeContent();
    setHomeContent(latest);
  }

  async function refreshDashboardData() {
    const latest = await fetchDashboardData();
    setDashboardData(latest);
  }

  const refreshAdminData = useEffectEvent(() => {
    void Promise.all([
      refreshProducts(),
      refreshCatalogues(),
      refreshHomeContent(),
      refreshDashboardData(),
    ]);
  });

  useEffect(() => {
    if (!isAllowed) return;
    refreshAdminData();
  }, [isAllowed, refreshAdminData]);

  const filteredProducts = useMemo(() => {
    const term = adminSearch.trim().toLowerCase();
    if (!term) return products;

    return products.filter((product) =>
      [product.name, product.category, product.price, product.tag]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [adminSearch, products]);

  const filteredOrders = useMemo(() => {
    const term = adminSearch.trim().toLowerCase();
    if (!term) return dashboardData.orders;

    return dashboardData.orders.filter((order) =>
      [order.orderNo, order.customerName, order.customerEmail, order.status]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [adminSearch, dashboardData.orders]);

  const filteredCustomers = useMemo(() => {
    const term = adminSearch.trim().toLowerCase();
    if (!term) return dashboardData.customers;

    return dashboardData.customers.filter((customer) =>
      [customer.fullName, customer.email, customer.isActive ? "active" : "inactive"]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [adminSearch, dashboardData.customers]);

  const filteredCatalogues = useMemo(() => {
    const term = adminSearch.trim().toLowerCase();
    if (!term) return catalogues;

    return catalogues.filter((catalogue) =>
      [catalogue.title, catalogue.shortLabel, catalogue.description, catalogue.itemCountLabel]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [adminSearch, catalogues]);

  const filteredBanners = useMemo(() => {
    const term = adminSearch.trim().toLowerCase();
    if (!term) return homeContent.banners;

    return homeContent.banners.filter((banner) =>
      [banner.eyebrow, banner.titleTop, banner.titleBottom, banner.copy]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [adminSearch, homeContent.banners]);

  const filteredReviews = useMemo(() => {
    const term = adminSearch.trim().toLowerCase();
    if (!term) return homeContent.reviews;

    return homeContent.reviews.filter((review) =>
      [review.authorName, review.reviewText, review.location, String(review.rating)]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [adminSearch, homeContent.reviews]);

  const filteredVideos = useMemo(() => {
    const term = adminSearch.trim().toLowerCase();
    if (!term) return homeContent.videos;

    return homeContent.videos.filter((video) =>
      [video.title, video.description, video.videoUrl].join(" ").toLowerCase().includes(term),
    );
  }, [adminSearch, homeContent.videos]);

  const categorySummary = useMemo(
    () =>
      productCategories.map((category) => {
        const items = products.filter((product) => product.category === category);
        const published = items.filter((product) => product.isPublished).length;
        const stock = items.reduce((sum, product) => sum + product.stockQuantity, 0);
        return {
          category,
          items: items.length,
          published,
          stock,
        };
      }),
    [products],
  );

  const topProducts = useMemo(
    () =>
      [...products]
        .sort((a, b) => b.stockQuantity - a.stockQuantity)
        .slice(0, 5),
    [products],
  );

  const dashboardStats = useMemo(() => {
    const numericPrices = dashboardData.orders.length
      ? dashboardData.orders.map((order) => order.totalAmount)
      : products
      .map((product) => Number(product.price.replace(/[^\d.]/g, "")))
      .filter((price) => !Number.isNaN(price));
    const totalSale = numericPrices.reduce((sum, price) => sum + price, 0);
    const avgSale = numericPrices.length ? totalSale / numericPrices.length : 0;

    return [
      {
        label: "Customers",
        value: dashboardData.stats.customerCount.toString(),
        icon: Users,
        iconClass: "text-[#ff9e77]",
      },
      {
        label: "Order",
        value: dashboardData.stats.orderCount.toString(),
        icon: ShoppingBag,
        iconClass: "text-[#9a88d6]",
      },
      {
        label: "Avg Sale",
        value: `Rs. ${avgSale.toLocaleString("en-IN", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`,
        icon: Star,
        iconClass: "text-[#c8864d]",
      },
      {
        label: "Total Sale",
        value: `Rs. ${dashboardData.stats.totalSales.toLocaleString("en-IN", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`,
        icon: FileText,
        iconClass: "text-[#8fc8f5]",
      },
      {
        label: "Enquiries",
        value: dashboardData.stats.enquiryCount.toString(),
        icon: Bell,
        iconClass: "text-[#ff9c8c]",
      },
    ];
  }, [dashboardData, products]);

  if (!isAllowed) {
    return <div className="min-h-[calc(100vh-5rem)] bg-muted/30" />;
  }

  function handleLogout() {
    setIsProfileOpen(false);
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

  function handleCatalogueFormChange<K extends keyof CatalogueFormState>(
    key: K,
    value: CatalogueFormState[K],
  ) {
    setCatalogueForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleBannerFormChange<K extends keyof BannerFormState>(
    key: K,
    value: BannerFormState[K],
  ) {
    setBannerForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleReviewFormChange<K extends keyof ReviewFormState>(
    key: K,
    value: ReviewFormState[K],
  ) {
    setReviewForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleVideoFormChange<K extends keyof VideoFormState>(
    key: K,
    value: VideoFormState[K],
  ) {
    setVideoForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleEditCatalogueFormChange<K extends keyof EditCatalogueFormState>(
    key: K,
    value: EditCatalogueFormState[K],
  ) {
    setEditCatalogueForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function handleEditBannerFormChange<K extends keyof EditBannerFormState>(
    key: K,
    value: EditBannerFormState[K],
  ) {
    setEditBannerForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function handleEditReviewFormChange<K extends keyof EditReviewFormState>(
    key: K,
    value: EditReviewFormState[K],
  ) {
    setEditReviewForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function handleEditVideoFormChange<K extends keyof EditVideoFormState>(
    key: K,
    value: EditVideoFormState[K],
  ) {
    setEditVideoForm((prev) => (prev ? { ...prev, [key]: value } : prev));
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

  function handleCatalogueImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setCatalogueImageName("");
      handleCatalogueFormChange("image", "");
      return;
    }

    readImageFile(
      file,
      (base64, fileName) => {
        handleCatalogueFormChange("image", base64);
        setCatalogueImageName(fileName);
        setCatalogueMessage("");
      },
      (message) => setCatalogueMessage(message),
    );
  }

  function handleBannerImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setBannerImageName("");
      handleBannerFormChange("image", "");
      return;
    }

    readImageFile(
      file,
      (base64, fileName) => {
        handleBannerFormChange("image", base64);
        setBannerImageName(fileName);
        setBannerMessage("");
      },
      (message) => setBannerMessage(message),
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

  function handleEditCatalogueImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !editCatalogueForm) return;

    readImageFile(
      file,
      (base64, fileName) => {
        handleEditCatalogueFormChange("image", base64);
        setEditCatalogueImageName(fileName);
        setCatalogueEditMessage("");
      },
      (message) => setCatalogueEditMessage(message),
    );
  }

  function handleEditBannerImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !editBannerForm) return;

    readImageFile(
      file,
      (base64, fileName) => {
        handleEditBannerFormChange("image", base64);
        setEditBannerImageName(fileName);
        setBannerEditMessage("");
      },
      (message) => setBannerEditMessage(message),
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

    await Promise.all([refreshProducts(), refreshDashboardData()]);
    setForm(initialProductForm);
    setSelectedImageName("");
    setSaveMessage("Product added successfully.");
  }

  async function handleAddCatalogue(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await createCatalogue({
      data: {
        title: catalogueForm.title.trim(),
        shortLabel: catalogueForm.shortLabel.trim(),
        description: catalogueForm.description.trim(),
        image: catalogueForm.image.trim(),
        itemCountLabel: catalogueForm.itemCountLabel.trim(),
      },
    });

    if (!result.success) {
      setCatalogueMessage(result.message);
      return;
    }

    await refreshCatalogues();
    setCatalogueForm(initialCatalogueForm);
    setCatalogueImageName("");
    setCatalogueMessage("Catalogue added successfully.");
  }

  async function handleAddBanner(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await createBanner({
      data: {
        eyebrow: bannerForm.eyebrow.trim(),
        titleTop: bannerForm.titleTop.trim(),
        titleBottom: bannerForm.titleBottom.trim(),
        copy: bannerForm.copy.trim(),
        image: bannerForm.image.trim(),
      },
    });

    if (!result.success) {
      setBannerMessage(result.message);
      return;
    }

    await refreshHomeContent();
    setBannerForm(initialBannerForm);
    setBannerImageName("");
    setBannerMessage("Banner added successfully.");
  }

  async function handleAddReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await createReview({
      data: {
        authorName: reviewForm.authorName.trim(),
        reviewText: reviewForm.reviewText.trim(),
        rating: Number(reviewForm.rating || 5),
        location: reviewForm.location.trim(),
      },
    });

    if (!result.success) {
      setReviewMessage(result.message);
      return;
    }

    await refreshHomeContent();
    setReviewForm(initialReviewForm);
    setReviewMessage("Review added successfully.");
  }

  async function handleAddVideo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await createVideo({
      data: {
        title: videoForm.title.trim(),
        description: videoForm.description.trim(),
        videoUrl: videoForm.videoUrl.trim(),
      },
    });

    if (!result.success) {
      setVideoMessage(result.message);
      return;
    }

    await refreshHomeContent();
    setVideoForm(initialVideoForm);
    setVideoMessage("Video added successfully.");
  }

  function startEditing(product: AdminProduct) {
    setEditForm(toEditForm(product));
    setEditImageName("");
    setEditMessage("");
  }

  function startEditingCatalogue(catalogue: AdminCatalogueType) {
    setEditCatalogueForm(toEditCatalogueForm(catalogue));
    setEditCatalogueImageName("");
    setCatalogueEditMessage("");
  }

  function startEditingBanner(banner: AdminHomeBanner) {
    setEditBannerForm(toEditBannerForm(banner));
    setEditBannerImageName("");
    setBannerEditMessage("");
  }

  function startEditingReview(review: AdminHomeReview) {
    setEditReviewForm(toEditReviewForm(review));
    setReviewEditMessage("");
  }

  function startEditingVideo(video: AdminHomeVideo) {
    setEditVideoForm(toEditVideoForm(video));
    setVideoEditMessage("");
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

    await Promise.all([refreshProducts(), refreshDashboardData()]);
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

    await Promise.all([refreshProducts(), refreshDashboardData()]);
    setEditMessage("Product deleted successfully.");
  }

  async function handleUpdateCatalogue(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editCatalogueForm) return;

    setIsCatalogueUpdating(true);
    const result = await updateCatalogue({
      data: {
        id: editCatalogueForm.id,
        title: editCatalogueForm.title.trim(),
        shortLabel: editCatalogueForm.shortLabel.trim(),
        description: editCatalogueForm.description.trim(),
        image: editCatalogueForm.image.trim(),
        itemCountLabel: editCatalogueForm.itemCountLabel.trim(),
        isActive: editCatalogueForm.isActive,
        sortOrder: Number(editCatalogueForm.sortOrder || 1),
      },
    });
    setIsCatalogueUpdating(false);

    if (!result.success) {
      setCatalogueEditMessage(result.message);
      return;
    }

    await refreshCatalogues();
    setCatalogueEditMessage("Catalogue updated successfully.");
  }

  async function handleDeleteCatalogue(catalogue: AdminCatalogueType) {
    if (!catalogue.fromDb) {
      setCatalogueEditMessage(
        "This catalogue is still coming from fallback data. Seed the database first to delete it.",
      );
      return;
    }

    const confirmed = window.confirm(`Delete "${catalogue.title}" permanently?`);
    if (!confirmed) return;

    setDeletingCatalogueId(catalogue.id);
    const result = await deleteCatalogue({
      data: {
        id: catalogue.id,
      },
    });
    setDeletingCatalogueId(null);

    if (!result.success) {
      setCatalogueEditMessage(result.message);
      return;
    }

    if (editCatalogueForm?.id === catalogue.id) {
      setEditCatalogueForm(null);
      setEditCatalogueImageName("");
    }

    await refreshCatalogues();
    setCatalogueEditMessage("Catalogue deleted successfully.");
  }

  async function handleUpdateBanner(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editBannerForm) return;

    setIsBannerUpdating(true);
    const result = await updateBanner({
      data: {
        id: editBannerForm.id,
        eyebrow: editBannerForm.eyebrow.trim(),
        titleTop: editBannerForm.titleTop.trim(),
        titleBottom: editBannerForm.titleBottom.trim(),
        copy: editBannerForm.copy.trim(),
        image: editBannerForm.image.trim(),
        isActive: editBannerForm.isActive,
        sortOrder: Number(editBannerForm.sortOrder || 1),
      },
    });
    setIsBannerUpdating(false);

    if (!result.success) {
      setBannerEditMessage(result.message);
      return;
    }

    await refreshHomeContent();
    setBannerEditMessage("Banner updated successfully.");
  }

  async function handleDeleteBanner(banner: AdminHomeBanner) {
    if (!banner.fromDb) {
      setBannerEditMessage("This fallback banner cannot be deleted until it exists in the database.");
      return;
    }

    const confirmed = window.confirm(`Delete banner "${banner.titleTop} ${banner.titleBottom}" permanently?`);
    if (!confirmed) return;

    setDeletingBannerId(banner.id);
    const result = await deleteBanner({ data: { id: banner.id } });
    setDeletingBannerId(null);

    if (!result.success) {
      setBannerEditMessage(result.message);
      return;
    }

    if (editBannerForm?.id === banner.id) {
      setEditBannerForm(null);
      setEditBannerImageName("");
    }

    await refreshHomeContent();
    setBannerEditMessage("Banner deleted successfully.");
  }

  async function handleUpdateReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editReviewForm) return;

    setIsReviewUpdating(true);
    const result = await updateReview({
      data: {
        id: editReviewForm.id,
        authorName: editReviewForm.authorName.trim(),
        reviewText: editReviewForm.reviewText.trim(),
        rating: Number(editReviewForm.rating || 5),
        location: editReviewForm.location.trim(),
        isActive: editReviewForm.isActive,
        sortOrder: Number(editReviewForm.sortOrder || 1),
      },
    });
    setIsReviewUpdating(false);

    if (!result.success) {
      setReviewEditMessage(result.message);
      return;
    }

    await refreshHomeContent();
    setReviewEditMessage("Review updated successfully.");
  }

  async function handleDeleteReview(review: AdminHomeReview) {
    if (!review.fromDb) {
      setReviewEditMessage("This fallback review cannot be deleted until it exists in the database.");
      return;
    }

    const confirmed = window.confirm(`Delete review from "${review.authorName}" permanently?`);
    if (!confirmed) return;

    setDeletingReviewId(review.id);
    const result = await deleteReview({ data: { id: review.id } });
    setDeletingReviewId(null);

    if (!result.success) {
      setReviewEditMessage(result.message);
      return;
    }

    if (editReviewForm?.id === review.id) {
      setEditReviewForm(null);
    }

    await refreshHomeContent();
    setReviewEditMessage("Review deleted successfully.");
  }

  async function handleUpdateVideo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editVideoForm) return;

    setIsVideoUpdating(true);
    const result = await updateVideo({
      data: {
        id: editVideoForm.id,
        title: editVideoForm.title.trim(),
        description: editVideoForm.description.trim(),
        videoUrl: editVideoForm.videoUrl.trim(),
        isActive: editVideoForm.isActive,
        sortOrder: Number(editVideoForm.sortOrder || 1),
      },
    });
    setIsVideoUpdating(false);

    if (!result.success) {
      setVideoEditMessage(result.message);
      return;
    }

    await refreshHomeContent();
    setVideoEditMessage("Video updated successfully.");
  }

  async function handleDeleteVideo(video: AdminHomeVideo) {
    if (!video.fromDb) {
      setVideoEditMessage("This fallback video cannot be deleted until it exists in the database.");
      return;
    }

    const confirmed = window.confirm(`Delete video "${video.title}" permanently?`);
    if (!confirmed) return;

    setDeletingVideoId(video.id);
    const result = await deleteVideo({ data: { id: video.id } });
    setDeletingVideoId(null);

    if (!result.success) {
      setVideoEditMessage(result.message);
      return;
    }

    if (editVideoForm?.id === video.id) {
      setEditVideoForm(null);
    }

    await refreshHomeContent();
    setVideoEditMessage("Video deleted successfully.");
  }

  function formatDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function getOrderStatusClass(
    status: AdminDashboardData["orders"][number]["status"],
  ) {
    switch (status) {
      case "delivered":
      case "paid":
        return "bg-[#eff7f0] text-[#2f8f49]";
      case "cancelled":
        return "bg-[#fff1f1] text-[#e34d5b]";
      case "shipped":
      case "packed":
        return "bg-[#eef4ff] text-[#1f7cf0]";
      default:
        return "bg-[#fff7e8] text-[#c88628]";
    }
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#f5f7fb]">
      <section className="grid w-full gap-4 px-3 py-4 sm:px-4 sm:py-5 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6 lg:px-6 lg:py-6">
        <aside className="rounded-[26px] bg-[linear-gradient(180deg,#6f56de_0%,#7558d7_48%,#6b50cb_100%)] p-4 text-white shadow-[0_28px_70px_-35px_rgba(87,62,180,0.85)] sm:p-5 lg:sticky lg:top-24 lg:p-6">
          <div className="flex items-center gap-3">
            <img
              src={logoImage}
              alt="Shivray Admin"
              className="h-12 w-12 rounded-2xl border border-white/20 object-cover sm:h-14 sm:w-14"
            />
            <div>
              <p className="text-2xl font-semibold sm:text-3xl">Shivray</p>
              <p className="text-xs text-white/75 sm:text-sm">Admin Panel</p>
            </div>
          </div>

          <nav className="mt-6 flex gap-2 overflow-x-auto pb-1 lg:mt-10 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0">
            {adminMenu.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setActiveSection(item.label)}
                className={`flex min-w-max shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-left transition lg:w-full ${
                  activeSection === item.label
                    ? "bg-white/12 text-[#ffd26b]"
                    : "text-white/90 hover:bg-white/10"
                }`}
              >
                <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm font-medium sm:text-base lg:text-xl">{item.label}</span>
              </button>
            ))}
          </nav>

        </aside>

        <div className="min-w-0">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex w-full max-w-xl items-center overflow-hidden rounded-2xl border border-[#ece8df] bg-white shadow-[0_18px_45px_-38px_rgba(60,40,20,0.45)]">
              <input
                type="text"
                value={adminSearch}
                onChange={(event) => setAdminSearch(event.target.value)}
                placeholder={`Search ${activeSection.toLowerCase()}`}
                className="w-full px-4 py-3 text-sm text-[#3a2a1e] outline-none placeholder:text-[#c0b7ab] sm:px-5 sm:py-4 sm:text-lg"
              />
              <div className="flex h-full items-center justify-center bg-[#f5f2ec] px-4 py-3 sm:px-5 sm:py-4">
                <Search className="h-5 w-5 text-[#10233e] sm:h-6 sm:w-6" />
              </div>
            </div>

            <div className="relative flex flex-wrap items-center justify-between gap-3 sm:justify-end sm:gap-4">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-full border-4 border-[#e8dfff] bg-white text-[#3a2a1e] shadow-[0_16px_35px_-24px_rgba(120,91,217,0.8)] sm:h-14 sm:w-14">
                <Bell className="h-5 w-5" />
              </div>
              <button
                type="button"
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className="flex items-center gap-3 rounded-2xl px-2 py-1 text-left transition hover:bg-white/70 sm:gap-4"
              >
                <div className="text-right">
                  <p className="text-xl font-semibold text-[#161616] sm:text-3xl">Admin</p>
                  <p className="text-sm text-[#5d5d63] sm:text-lg">Admin Profile</p>
                </div>
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#ddd9d2] bg-white text-[#6c62d7] sm:h-16 sm:w-16">
                  <UserCircle2 className="h-7 w-7 sm:h-10 sm:w-10" />
                </div>
              </button>

              {isProfileOpen ? (
                <div className="absolute right-0 top-[calc(100%+0.75rem)] z-20 min-w-52 rounded-2xl border border-[#e9e2d8] bg-white p-2 shadow-[0_24px_55px_-28px_rgba(55,35,20,0.35)]">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-[#34180e] transition hover:bg-[#f8f5ef]"
                  >
                    <LogOut className="h-4 w-4 text-[#6f56de]" />
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {activeSection === "Dashboard" ? (
            <>
              <div className="mt-8 grid gap-4 md:grid-cols-2 2xl:grid-cols-5">
                {dashboardStats.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-[#e8e4dd] bg-white px-5 py-6 shadow-[0_18px_40px_-38px_rgba(60,40,20,0.45)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-lg text-[#96a0ad]">{item.label}</p>
                        <p className="mt-2 text-4xl font-semibold text-[#10233e]">{item.value}</p>
                      </div>
                      <item.icon className={`mt-1 h-7 w-7 ${item.iconClass}`} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
                <div className="rounded-2xl border border-[#e7e2da] bg-white p-5 shadow-[0_18px_40px_-38px_rgba(60,40,20,0.45)]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-3xl font-semibold text-[#161616]">Top Products</h3>
                      <p className="mt-1 text-sm text-[#7d7d84]">
                        Highest stock and active catalogue items.
                      </p>
                    </div>
                    <Package className="h-5 w-5 text-[#6f56de]" />
                  </div>

                  <div className="mt-5 space-y-4">
                    {topProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between gap-4 rounded-2xl bg-[#fbfaf7] px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-12 w-12 rounded-xl object-cover"
                          />
                          <div>
                            <p className="font-semibold text-[#1d2433]">{product.name}</p>
                            <p className="text-sm text-[#7d7d84]">{product.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-[#1d2433]">{product.price}</p>
                          <p className="text-sm text-[#7d7d84]">Stock: {product.stockQuantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-[#e7e2da] bg-white p-5 shadow-[0_18px_40px_-38px_rgba(60,40,20,0.45)]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-3xl font-semibold text-[#161616]">Recent Orders</h3>
                      <p className="mt-1 text-sm text-[#7d7d84]">
                        Latest order activity from the database.
                      </p>
                    </div>
                    <div className="rounded-xl bg-[#f5f2ec] px-4 py-2 text-sm text-[#6b645c]">
                      {filteredOrders.length} entries
                    </div>
                  </div>

                  <div className="mt-5 overflow-x-auto">
                    <table className="min-w-[760px] w-full border-separate border-spacing-0">
                      <thead>
                        <tr className="text-left text-xs uppercase tracking-[0.18em] text-[#7e7e88]">
                          <th className="border-b border-[#ece6de] px-4 py-4 font-semibold">Order</th>
                          <th className="border-b border-[#ece6de] px-4 py-4 font-semibold">Customer</th>
                          <th className="border-b border-[#ece6de] px-4 py-4 font-semibold">Amount</th>
                          <th className="border-b border-[#ece6de] px-4 py-4 font-semibold">Status</th>
                          <th className="border-b border-[#ece6de] px-4 py-4 font-semibold">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.length ? (
                          filteredOrders.map((order) => (
                            <tr key={order.id}>
                              <td className="border-b border-[#f1ece6] px-4 py-5 font-semibold text-[#1d2433]">
                                #{order.orderNo}
                              </td>
                              <td className="border-b border-[#f1ece6] px-4 py-5">
                                <p className="font-medium text-[#1d2433]">{order.customerName}</p>
                                <p className="text-sm text-[#7d7d84]">{order.customerEmail}</p>
                              </td>
                              <td className="border-b border-[#f1ece6] px-4 py-5 font-medium text-[#1d2433]">
                                Rs. {order.totalAmount.toLocaleString("en-IN")}
                              </td>
                              <td className="border-b border-[#f1ece6] px-4 py-5">
                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getOrderStatusClass(order.status)}`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="border-b border-[#f1ece6] px-4 py-5 text-sm text-[#7d7d84]">
                                {formatDate(order.createdAt)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-4 py-10 text-center text-sm text-[#7d7d84]">
                              No orders found in the database yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          ) : null}

          {activeSection === "Catalogues" ? (
            <>
              <div className="mt-6 grid gap-6 2xl:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-2xl border border-[#e7e2da] bg-white p-5 shadow-[0_18px_40px_-38px_rgba(60,40,20,0.45)]">
                  <div className="flex items-center gap-3">
                    <CirclePlus className="h-5 w-5 text-[#6f56de]" />
                    <div>
                      <h2 className="text-3xl font-semibold text-[#161616]">Add Catalogue</h2>
                      <p className="mt-1 text-sm text-[#7d7d84]">
                        Add catalogue cards that also appear on the public catalogue pages.
                      </p>
                    </div>
                  </div>

                  <form
                    onSubmit={handleAddCatalogue}
                    className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2"
                  >
                    <div>
                      <label className="text-sm font-medium text-[#1c1c24]">Title</label>
                      <input
                        type="text"
                        value={catalogueForm.title}
                        onChange={(e) => handleCatalogueFormChange("title", e.target.value)}
                        className="mt-2 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm text-[#1c1c24] outline-none transition focus:border-[#8a73eb]"
                        placeholder="Statue Catalogue"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-[#1c1c24]">Short Label</label>
                      <input
                        type="text"
                        value={catalogueForm.shortLabel}
                        onChange={(e) => handleCatalogueFormChange("shortLabel", e.target.value)}
                        className="mt-2 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm text-[#1c1c24] outline-none transition focus:border-[#8a73eb]"
                        placeholder="Statues"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-[#1c1c24]">Count Label</label>
                      <input
                        type="text"
                        value={catalogueForm.itemCountLabel}
                        onChange={(e) => handleCatalogueFormChange("itemCountLabel", e.target.value)}
                        className="mt-2 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm text-[#1c1c24] outline-none transition focus:border-[#8a73eb]"
                        placeholder="170 products"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-[#1c1c24]">Upload Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCatalogueImageUpload}
                        className="mt-2 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-[#6f56de] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white"
                        required
                      />
                      <p className="mt-2 text-xs text-[#7d7d84]">
                        {catalogueImageName ? `Selected: ${catalogueImageName}` : "Max size: 2MB"}
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-[#1c1c24]">Description</label>
                      <textarea
                        value={catalogueForm.description}
                        onChange={(e) => handleCatalogueFormChange("description", e.target.value)}
                        className="mt-2 min-h-28 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm text-[#1c1c24] outline-none transition focus:border-[#8a73eb]"
                        placeholder="Explain what this catalogue includes."
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <button
                        type="submit"
                        className="inline-flex w-full items-center justify-center rounded-xl bg-[#6f56de] px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:brightness-105"
                      >
                        Add Catalogue
                      </button>
                    </div>
                  </form>

                  {catalogueMessage ? (
                    <p className="mt-3 text-sm font-medium text-emerald-700">{catalogueMessage}</p>
                  ) : null}
                </div>

                <div className="rounded-2xl border border-[#e7e2da] bg-white p-5 shadow-[0_18px_40px_-38px_rgba(60,40,20,0.45)]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-3xl font-semibold text-[#161616]">Catalogue List</h3>
                      <p className="mt-1 text-sm text-[#7d7d84]">
                        Manage the catalogue cards shown on home and request pages.
                      </p>
                    </div>
                    <div className="rounded-xl bg-[#f5f2ec] px-4 py-2 text-sm text-[#6b645c]">
                      {filteredCatalogues.length} entries
                    </div>
                  </div>

                  {catalogueEditMessage ? (
                    <p className="mt-3 text-sm font-medium text-emerald-700">
                      {catalogueEditMessage}
                    </p>
                  ) : null}

                  <div className="mt-5 overflow-x-auto">
                    <table className="min-w-[860px] w-full border-separate border-spacing-0">
                      <thead>
                        <tr className="text-left text-xs uppercase tracking-[0.18em] text-[#7e7e88]">
                          <th className="border-b border-[#ece6de] px-4 py-4 font-semibold">Preview</th>
                          <th className="border-b border-[#ece6de] px-4 py-4 font-semibold">Catalogue</th>
                          <th className="border-b border-[#ece6de] px-4 py-4 font-semibold">Count</th>
                          <th className="border-b border-[#ece6de] px-4 py-4 font-semibold">Status</th>
                          <th className="border-b border-[#ece6de] px-4 py-4 font-semibold">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCatalogues.map((catalogue) => (
                          <tr key={catalogue.id} className="align-top text-[#1d2433]">
                            <td className="border-b border-[#f1ece6] px-4 py-5">
                              <img
                                src={catalogue.image}
                                alt={catalogue.title}
                                className="h-14 w-14 rounded-xl object-cover"
                              />
                            </td>
                            <td className="border-b border-[#f1ece6] px-4 py-5">
                              <p className="font-semibold">{catalogue.title}</p>
                              <p className="mt-1 text-sm text-[#70727d]">{catalogue.shortLabel}</p>
                            </td>
                            <td className="border-b border-[#f1ece6] px-4 py-5 text-sm">
                              {catalogue.itemCountLabel}
                            </td>
                            <td className="border-b border-[#f1ece6] px-4 py-5">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                  catalogue.isActive
                                    ? "bg-[#eff7f0] text-[#2f8f49]"
                                    : "bg-[#fff1f1] text-[#e34d5b]"
                                }`}
                              >
                                {catalogue.isActive ? "Active" : "Hidden"}
                              </span>
                            </td>
                            <td className="border-b border-[#f1ece6] px-4 py-5">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => startEditingCatalogue(catalogue)}
                                  className="inline-flex items-center gap-2 rounded-lg bg-[#1f7cf0] px-3 py-2 text-xs font-semibold text-white"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  disabled={deletingCatalogueId === catalogue.id || !catalogue.fromDb}
                                  onClick={() => handleDeleteCatalogue(catalogue)}
                                  className="inline-flex items-center gap-2 rounded-lg bg-[#ef4457] px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  {deletingCatalogueId === catalogue.id ? "Deleting..." : "Delete"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {editCatalogueForm ? (
                <div className="mt-6 rounded-2xl border border-[#e7e2da] bg-white p-5 shadow-[0_18px_40px_-38px_rgba(60,40,20,0.45)]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-3xl font-semibold text-[#161616]">Edit Catalogue</h3>
                      <p className="mt-1 text-sm text-[#7d7d84]">
                        Update title, image, sorting, and whether the catalogue stays visible.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditCatalogueForm(null);
                        setEditCatalogueImageName("");
                        setCatalogueEditMessage("");
                      }}
                      className="rounded-xl border border-[#e1dbd2] px-4 py-2 text-sm font-medium text-[#4c4a52] transition hover:bg-[#f8f6f2]"
                    >
                      Close
                    </button>
                  </div>

                  <form
                    onSubmit={handleUpdateCatalogue}
                    className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2"
                  >
                    <div>
                      <label className="text-sm font-medium text-[#1c1c24]">Title</label>
                      <input
                        type="text"
                        value={editCatalogueForm.title}
                        onChange={(e) => handleEditCatalogueFormChange("title", e.target.value)}
                        className="mt-2 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition focus:border-[#8a73eb]"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-[#1c1c24]">Short Label</label>
                      <input
                        type="text"
                        value={editCatalogueForm.shortLabel}
                        onChange={(e) => handleEditCatalogueFormChange("shortLabel", e.target.value)}
                        className="mt-2 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition focus:border-[#8a73eb]"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-[#1c1c24]">Count Label</label>
                      <input
                        type="text"
                        value={editCatalogueForm.itemCountLabel}
                        onChange={(e) =>
                          handleEditCatalogueFormChange("itemCountLabel", e.target.value)
                        }
                        className="mt-2 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition focus:border-[#8a73eb]"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-[#1c1c24]">Sort Order</label>
                      <input
                        type="number"
                        min={1}
                        value={editCatalogueForm.sortOrder}
                        onChange={(e) => handleEditCatalogueFormChange("sortOrder", e.target.value)}
                        className="mt-2 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition focus:border-[#8a73eb]"
                        required
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-8">
                      <input
                        id={`catalogue-active-${editCatalogueForm.id}`}
                        type="checkbox"
                        checked={editCatalogueForm.isActive}
                        onChange={(e) =>
                          handleEditCatalogueFormChange("isActive", e.target.checked)
                        }
                        className="h-4 w-4 rounded"
                      />
                      <label
                        htmlFor={`catalogue-active-${editCatalogueForm.id}`}
                        className="text-sm font-medium text-[#1c1c24]"
                      >
                        Show this catalogue publicly
                      </label>
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-[#1c1c24]">
                        Upload New Image (Optional)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditCatalogueImageUpload}
                        className="mt-2 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm outline-none"
                      />
                      <p className="mt-2 text-xs text-[#7d7d84]">
                        {editCatalogueImageName
                          ? `Selected: ${editCatalogueImageName}`
                          : "Keep empty to use current image"}
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-[#1c1c24]">Description</label>
                      <textarea
                        value={editCatalogueForm.description}
                        onChange={(e) =>
                          handleEditCatalogueFormChange("description", e.target.value)
                        }
                        className="mt-2 min-h-28 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition focus:border-[#8a73eb]"
                        required
                      />
                    </div>

                    <div className="md:col-span-2 flex items-center gap-3">
                      <button
                        type="submit"
                        disabled={isCatalogueUpdating}
                        className="rounded-xl bg-[#6f56de] px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:brightness-105 disabled:opacity-60"
                      >
                        {isCatalogueUpdating ? "Saving..." : "Save Catalogue"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditCatalogueForm(null);
                          setEditCatalogueImageName("");
                          setCatalogueEditMessage("");
                        }}
                        className="rounded-xl border border-[#e1dbd2] px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#4c4a52] transition hover:bg-[#f8f6f2]"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : null}
            </>
          ) : null}

          {activeSection === "Categories" ? (
            <div className="mt-6 rounded-2xl border border-[#e7e2da] bg-white p-5 shadow-[0_18px_40px_-38px_rgba(60,40,20,0.45)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-3xl font-semibold text-[#161616]">Categories</h3>
                  <p className="mt-1 text-sm text-[#7d7d84]">
                    Real category counts and stock distribution from your products.
                  </p>
                </div>
                <FolderTree className="h-5 w-5 text-[#6f56de]" />
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {categorySummary.map((item) => (
                  <div key={item.category} className="rounded-2xl bg-[#fbfaf7] p-5">
                    <p className="text-lg text-[#96a0ad]">{item.category}</p>
                    <p className="mt-2 text-4xl font-semibold text-[#10233e]">{item.items}</p>
                    <p className="mt-2 text-sm text-[#7d7d84]">Published: {item.published}</p>
                    <p className="text-sm text-[#7d7d84]">Stock units: {item.stock}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {activeSection === "Banners" ? (
            <>
              <div className="mt-6 grid gap-6 2xl:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-2xl border border-[#e7e2da] bg-white p-5 shadow-[0_18px_40px_-38px_rgba(60,40,20,0.45)]">
                  <div className="flex items-center gap-3">
                    <ImagePlus className="h-5 w-5 text-[#6f56de]" />
                    <div>
                      <h2 className="text-3xl font-semibold text-[#161616]">Add Banner</h2>
                      <p className="mt-1 text-sm text-[#7d7d84]">
                        Upload homepage slider banners that the client can change anytime.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleAddBanner} className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-[#1c1c24]">Eyebrow</label>
                      <input
                        type="text"
                        value={bannerForm.eyebrow}
                        onChange={(e) => handleBannerFormChange("eyebrow", e.target.value)}
                        className="mt-2 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition focus:border-[#8a73eb]"
                        placeholder="Premium Craftsmanship Since 2015"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-[#1c1c24]">Top Title</label>
                      <input
                        type="text"
                        value={bannerForm.titleTop}
                        onChange={(e) => handleBannerFormChange("titleTop", e.target.value)}
                        className="mt-2 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition focus:border-[#8a73eb]"
                        placeholder="Timeless Culture"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-[#1c1c24]">Bottom Title</label>
                      <input
                        type="text"
                        value={bannerForm.titleBottom}
                        onChange={(e) => handleBannerFormChange("titleBottom", e.target.value)}
                        className="mt-2 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition focus:border-[#8a73eb]"
                        placeholder="Modern Vision"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-[#1c1c24]">Upload Banner Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBannerImageUpload}
                        className="mt-2 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-[#6f56de] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white"
                        required
                      />
                      <p className="mt-2 text-xs text-[#7d7d84]">
                        {bannerImageName ? `Selected: ${bannerImageName}` : "Max size: 2MB"}
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-[#1c1c24]">Banner Copy</label>
                      <textarea
                        value={bannerForm.copy}
                        onChange={(e) => handleBannerFormChange("copy", e.target.value)}
                        className="mt-2 min-h-28 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition focus:border-[#8a73eb]"
                        placeholder="Describe the banner content."
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <button
                        type="submit"
                        className="inline-flex w-full items-center justify-center rounded-xl bg-[#6f56de] px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:brightness-105"
                      >
                        Add Banner
                      </button>
                    </div>
                  </form>

                  {bannerMessage ? (
                    <p className="mt-3 text-sm font-medium text-emerald-700">{bannerMessage}</p>
                  ) : null}
                </div>

                <div className="rounded-2xl border border-[#e7e2da] bg-white p-5 shadow-[0_18px_40px_-38px_rgba(60,40,20,0.45)]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-3xl font-semibold text-[#161616]">Banner List</h3>
                      <p className="mt-1 text-sm text-[#7d7d84]">
                        These banners are shown in the homepage hero slider.
                      </p>
                    </div>
                    <div className="rounded-xl bg-[#f5f2ec] px-4 py-2 text-sm text-[#6b645c]">
                      {filteredBanners.length} entries
                    </div>
                  </div>

                  {bannerEditMessage ? (
                    <p className="mt-3 text-sm font-medium text-emerald-700">{bannerEditMessage}</p>
                  ) : null}

                  <div className="mt-5 overflow-x-auto">
                    <table className="min-w-[860px] w-full border-separate border-spacing-0">
                      <thead>
                        <tr className="text-left text-xs uppercase tracking-[0.18em] text-[#7e7e88]">
                          <th className="border-b border-[#ece6de] px-4 py-4 font-semibold">Preview</th>
                          <th className="border-b border-[#ece6de] px-4 py-4 font-semibold">Headline</th>
                          <th className="border-b border-[#ece6de] px-4 py-4 font-semibold">Order</th>
                          <th className="border-b border-[#ece6de] px-4 py-4 font-semibold">Status</th>
                          <th className="border-b border-[#ece6de] px-4 py-4 font-semibold">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBanners.map((banner) => (
                          <tr key={banner.id}>
                            <td className="border-b border-[#f1ece6] px-4 py-5">
                              <img src={banner.image} alt={banner.titleTop} className="h-14 w-20 rounded-xl object-cover" />
                            </td>
                            <td className="border-b border-[#f1ece6] px-4 py-5">
                              <p className="font-semibold">{banner.titleTop} {banner.titleBottom}</p>
                              <p className="mt-1 text-sm text-[#70727d]">{banner.eyebrow}</p>
                            </td>
                            <td className="border-b border-[#f1ece6] px-4 py-5 text-sm">{banner.sortOrder}</td>
                            <td className="border-b border-[#f1ece6] px-4 py-5">
                              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${banner.isActive ? "bg-[#eff7f0] text-[#2f8f49]" : "bg-[#fff1f1] text-[#e34d5b]"}`}>
                                {banner.isActive ? "Active" : "Hidden"}
                              </span>
                            </td>
                            <td className="border-b border-[#f1ece6] px-4 py-5">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => startEditingBanner(banner)}
                                  className="inline-flex items-center gap-2 rounded-lg bg-[#1f7cf0] px-3 py-2 text-xs font-semibold text-white"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  disabled={deletingBannerId === banner.id || !banner.fromDb}
                                  onClick={() => handleDeleteBanner(banner)}
                                  className="inline-flex items-center gap-2 rounded-lg bg-[#ef4457] px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  {deletingBannerId === banner.id ? "Deleting..." : "Delete"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {editBannerForm ? (
                <div className="mt-6 rounded-2xl border border-[#e7e2da] bg-white p-5 shadow-[0_18px_40px_-38px_rgba(60,40,20,0.45)]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-3xl font-semibold text-[#161616]">Edit Banner</h3>
                      <p className="mt-1 text-sm text-[#7d7d84]">Update slider copy, image, order, and visibility.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditBannerForm(null);
                        setEditBannerImageName("");
                        setBannerEditMessage("");
                      }}
                      className="rounded-xl border border-[#e1dbd2] px-4 py-2 text-sm font-medium text-[#4c4a52] transition hover:bg-[#f8f6f2]"
                    >
                      Close
                    </button>
                  </div>

                  <form onSubmit={handleUpdateBanner} className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-[#1c1c24]">Eyebrow</label>
                      <input
                        type="text"
                        value={editBannerForm.eyebrow}
                        onChange={(e) => handleEditBannerFormChange("eyebrow", e.target.value)}
                        className="mt-2 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition focus:border-[#8a73eb]"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#1c1c24]">Sort Order</label>
                      <input
                        type="number"
                        min={1}
                        value={editBannerForm.sortOrder}
                        onChange={(e) => handleEditBannerFormChange("sortOrder", e.target.value)}
                        className="mt-2 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition focus:border-[#8a73eb]"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#1c1c24]">Top Title</label>
                      <input
                        type="text"
                        value={editBannerForm.titleTop}
                        onChange={(e) => handleEditBannerFormChange("titleTop", e.target.value)}
                        className="mt-2 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition focus:border-[#8a73eb]"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#1c1c24]">Bottom Title</label>
                      <input
                        type="text"
                        value={editBannerForm.titleBottom}
                        onChange={(e) => handleEditBannerFormChange("titleBottom", e.target.value)}
                        className="mt-2 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition focus:border-[#8a73eb]"
                        required
                      />
                    </div>
                    <div className="md:col-span-2 flex items-center gap-3">
                      <input
                        id={`banner-active-${editBannerForm.id}`}
                        type="checkbox"
                        checked={editBannerForm.isActive}
                        onChange={(e) => handleEditBannerFormChange("isActive", e.target.checked)}
                        className="h-4 w-4 rounded"
                      />
                      <label htmlFor={`banner-active-${editBannerForm.id}`} className="text-sm font-medium text-[#1c1c24]">
                        Active on home page
                      </label>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-[#1c1c24]">Upload New Banner Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditBannerImageUpload}
                        className="mt-2 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm outline-none"
                      />
                      <p className="mt-2 text-xs text-[#7d7d84]">
                        {editBannerImageName ? `Selected: ${editBannerImageName}` : "Keep empty to use current image"}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-[#1c1c24]">Banner Copy</label>
                      <textarea
                        value={editBannerForm.copy}
                        onChange={(e) => handleEditBannerFormChange("copy", e.target.value)}
                        className="mt-2 min-h-28 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition focus:border-[#8a73eb]"
                        required
                      />
                    </div>
                    <div className="md:col-span-2 flex items-center gap-3">
                      <button
                        type="submit"
                        disabled={isBannerUpdating}
                        className="rounded-xl bg-[#6f56de] px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:brightness-105 disabled:opacity-60"
                      >
                        {isBannerUpdating ? "Saving..." : "Save Banner"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditBannerForm(null);
                          setEditBannerImageName("");
                          setBannerEditMessage("");
                        }}
                        className="rounded-xl border border-[#e1dbd2] px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#4c4a52] transition hover:bg-[#f8f6f2]"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : null}
            </>
          ) : null}

          {activeSection === "Videos" ? (
            <>
              <div className="mt-6 grid gap-6 2xl:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-2xl border border-[#e7e2da] bg-white p-5 shadow-[0_18px_40px_-38px_rgba(60,40,20,0.45)]">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-[#6f56de]" />
                    <div>
                      <h2 className="text-3xl font-semibold text-[#161616]">Add Video</h2>
                      <p className="mt-1 text-sm text-[#7d7d84]">
                        Add YouTube or direct video links for the homepage video slider.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleAddVideo} className="mt-5 grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-sm font-medium text-[#1c1c24]">Video Title</label>
                      <input
                        type="text"
                        value={videoForm.title}
                        onChange={(e) => handleVideoFormChange("title", e.target.value)}
                        className="mt-2 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition focus:border-[#8a73eb]"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#1c1c24]">Video URL</label>
                      <input
                        type="url"
                        value={videoForm.videoUrl}
                        onChange={(e) => handleVideoFormChange("videoUrl", e.target.value)}
                        className="mt-2 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition focus:border-[#8a73eb]"
                        placeholder="https://youtu.be/..."
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#1c1c24]">Description</label>
                      <textarea
                        value={videoForm.description}
                        onChange={(e) => handleVideoFormChange("description", e.target.value)}
                        className="mt-2 min-h-28 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition focus:border-[#8a73eb]"
                        required
                      />
                    </div>
                    <div>
                      <button
                        type="submit"
                        className="inline-flex w-full items-center justify-center rounded-xl bg-[#6f56de] px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:brightness-105"
                      >
                        Add Video
                      </button>
                    </div>
                  </form>

                  {videoMessage ? (
                    <p className="mt-3 text-sm font-medium text-emerald-700">{videoMessage}</p>
                  ) : null}
                </div>

                <div className="rounded-2xl border border-[#e7e2da] bg-white p-5 shadow-[0_18px_40px_-38px_rgba(60,40,20,0.45)]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-3xl font-semibold text-[#161616]">Video List</h3>
                      <p className="mt-1 text-sm text-[#7d7d84]">These videos are shown on the homepage slider.</p>
                    </div>
                    <div className="rounded-xl bg-[#f5f2ec] px-4 py-2 text-sm text-[#6b645c]">
                      {filteredVideos.length} entries
                    </div>
                  </div>

                  {videoEditMessage ? (
                    <p className="mt-3 text-sm font-medium text-emerald-700">{videoEditMessage}</p>
                  ) : null}

                  <div className="mt-5 overflow-x-auto">
                    <table className="min-w-[860px] w-full border-separate border-spacing-0">
                      <thead>
                        <tr className="text-left text-xs uppercase tracking-[0.18em] text-[#7e7e88]">
                          <th className="border-b border-[#ece6de] px-4 py-4 font-semibold">Title</th>
                          <th className="border-b border-[#ece6de] px-4 py-4 font-semibold">URL</th>
                          <th className="border-b border-[#ece6de] px-4 py-4 font-semibold">Order</th>
                          <th className="border-b border-[#ece6de] px-4 py-4 font-semibold">Status</th>
                          <th className="border-b border-[#ece6de] px-4 py-4 font-semibold">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredVideos.map((video) => (
                          <tr key={video.id}>
                            <td className="border-b border-[#f1ece6] px-4 py-5">
                              <p className="font-semibold text-[#1d2433]">{video.title}</p>
                              <p className="mt-1 line-clamp-2 text-sm text-[#70727d]">{video.description}</p>
                            </td>
                            <td className="border-b border-[#f1ece6] px-4 py-5 text-sm text-[#1f7cf0]">{video.videoUrl}</td>
                            <td className="border-b border-[#f1ece6] px-4 py-5 text-sm">{video.sortOrder}</td>
                            <td className="border-b border-[#f1ece6] px-4 py-5">
                              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${video.isActive ? "bg-[#eff7f0] text-[#2f8f49]" : "bg-[#fff1f1] text-[#e34d5b]"}`}>
                                {video.isActive ? "Active" : "Hidden"}
                              </span>
                            </td>
                            <td className="border-b border-[#f1ece6] px-4 py-5">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => startEditingVideo(video)}
                                  className="inline-flex items-center gap-2 rounded-lg bg-[#1f7cf0] px-3 py-2 text-xs font-semibold text-white"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  disabled={deletingVideoId === video.id || !video.fromDb}
                                  onClick={() => handleDeleteVideo(video)}
                                  className="inline-flex items-center gap-2 rounded-lg bg-[#ef4457] px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  {deletingVideoId === video.id ? "Deleting..." : "Delete"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {editVideoForm ? (
                <div className="mt-6 rounded-2xl border border-[#e7e2da] bg-white p-5 shadow-[0_18px_40px_-38px_rgba(60,40,20,0.45)]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-3xl font-semibold text-[#161616]">Edit Video</h3>
                      <p className="mt-1 text-sm text-[#7d7d84]">Update title, link, order, and visibility.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditVideoForm(null);
                        setVideoEditMessage("");
                      }}
                      className="rounded-xl border border-[#e1dbd2] px-4 py-2 text-sm font-medium text-[#4c4a52] transition hover:bg-[#f8f6f2]"
                    >
                      Close
                    </button>
                  </div>
                  <form onSubmit={handleUpdateVideo} className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-[#1c1c24]">Title</label>
                      <input
                        type="text"
                        value={editVideoForm.title}
                        onChange={(e) => handleEditVideoFormChange("title", e.target.value)}
                        className="mt-2 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition focus:border-[#8a73eb]"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#1c1c24]">Sort Order</label>
                      <input
                        type="number"
                        min={1}
                        value={editVideoForm.sortOrder}
                        onChange={(e) => handleEditVideoFormChange("sortOrder", e.target.value)}
                        className="mt-2 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition focus:border-[#8a73eb]"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-[#1c1c24]">Video URL</label>
                      <input
                        type="url"
                        value={editVideoForm.videoUrl}
                        onChange={(e) => handleEditVideoFormChange("videoUrl", e.target.value)}
                        className="mt-2 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition focus:border-[#8a73eb]"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-[#1c1c24]">Description</label>
                      <textarea
                        value={editVideoForm.description}
                        onChange={(e) => handleEditVideoFormChange("description", e.target.value)}
                        className="mt-2 min-h-28 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition focus:border-[#8a73eb]"
                        required
                      />
                    </div>
                    <div className="md:col-span-2 flex items-center gap-3">
                      <input
                        id={`video-active-${editVideoForm.id}`}
                        type="checkbox"
                        checked={editVideoForm.isActive}
                        onChange={(e) => handleEditVideoFormChange("isActive", e.target.checked)}
                        className="h-4 w-4 rounded"
                      />
                      <label htmlFor={`video-active-${editVideoForm.id}`} className="text-sm font-medium text-[#1c1c24]">
                        Active on home page
                      </label>
                    </div>
                    <div className="md:col-span-2 flex items-center gap-3">
                      <button
                        type="submit"
                        disabled={isVideoUpdating}
                        className="rounded-xl bg-[#6f56de] px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:brightness-105 disabled:opacity-60"
                      >
                        {isVideoUpdating ? "Saving..." : "Save Video"}
                      </button>
                    </div>
                  </form>
                </div>
              ) : null}
            </>
          ) : null}

          {activeSection === "Reviews" ? (
            <>
              <div className="mt-6 grid gap-6 2xl:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-2xl border border-[#e7e2da] bg-white p-5 shadow-[0_18px_40px_-38px_rgba(60,40,20,0.45)]">
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-[#6f56de]" />
                    <div>
                      <h2 className="text-3xl font-semibold text-[#161616]">Add Review</h2>
                      <p className="mt-1 text-sm text-[#7d7d84]">Add customer reviews for the homepage testimonial slider.</p>
                    </div>
                  </div>

                  <form onSubmit={handleAddReview} className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-[#1c1c24]">Customer Name</label>
                      <input
                        type="text"
                        value={reviewForm.authorName}
                        onChange={(e) => handleReviewFormChange("authorName", e.target.value)}
                        className="mt-2 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition focus:border-[#8a73eb]"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#1c1c24]">Location</label>
                      <input
                        type="text"
                        value={reviewForm.location}
                        onChange={(e) => handleReviewFormChange("location", e.target.value)}
                        className="mt-2 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition focus:border-[#8a73eb]"
                        placeholder="Pune"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#1c1c24]">Rating</label>
                      <select
                        value={reviewForm.rating}
                        onChange={(e) => handleReviewFormChange("rating", e.target.value)}
                        className="mt-2 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition focus:border-[#8a73eb]"
                      >
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <option key={rating} value={rating}>{rating} Star</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-[#1c1c24]">Review Text</label>
                      <textarea
                        value={reviewForm.reviewText}
                        onChange={(e) => handleReviewFormChange("reviewText", e.target.value)}
                        className="mt-2 min-h-28 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition focus:border-[#8a73eb]"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <button
                        type="submit"
                        className="inline-flex w-full items-center justify-center rounded-xl bg-[#6f56de] px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:brightness-105"
                      >
                        Add Review
                      </button>
                    </div>
                  </form>

                  {reviewMessage ? (
                    <p className="mt-3 text-sm font-medium text-emerald-700">{reviewMessage}</p>
                  ) : null}
                </div>

                <div className="rounded-2xl border border-[#e7e2da] bg-white p-5 shadow-[0_18px_40px_-38px_rgba(60,40,20,0.45)]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-3xl font-semibold text-[#161616]">Review List</h3>
                      <p className="mt-1 text-sm text-[#7d7d84]">These reviews are shown on the homepage slider.</p>
                    </div>
                    <div className="rounded-xl bg-[#f5f2ec] px-4 py-2 text-sm text-[#6b645c]">
                      {filteredReviews.length} entries
                    </div>
                  </div>

                  {reviewEditMessage ? (
                    <p className="mt-3 text-sm font-medium text-emerald-700">{reviewEditMessage}</p>
                  ) : null}

                  <div className="mt-5 overflow-x-auto">
                    <table className="min-w-[860px] w-full border-separate border-spacing-0">
                      <thead>
                        <tr className="text-left text-xs uppercase tracking-[0.18em] text-[#7e7e88]">
                          <th className="border-b border-[#ece6de] px-4 py-4 font-semibold">Customer</th>
                          <th className="border-b border-[#ece6de] px-4 py-4 font-semibold">Review</th>
                          <th className="border-b border-[#ece6de] px-4 py-4 font-semibold">Rating</th>
                          <th className="border-b border-[#ece6de] px-4 py-4 font-semibold">Status</th>
                          <th className="border-b border-[#ece6de] px-4 py-4 font-semibold">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredReviews.map((review) => (
                          <tr key={review.id}>
                            <td className="border-b border-[#f1ece6] px-4 py-5">
                              <p className="font-semibold text-[#1d2433]">{review.authorName}</p>
                              <p className="mt-1 text-sm text-[#70727d]">{review.location}</p>
                            </td>
                            <td className="border-b border-[#f1ece6] px-4 py-5 text-sm text-[#1d2433]">{review.reviewText}</td>
                            <td className="border-b border-[#f1ece6] px-4 py-5 text-sm">{review.rating}/5</td>
                            <td className="border-b border-[#f1ece6] px-4 py-5">
                              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${review.isActive ? "bg-[#eff7f0] text-[#2f8f49]" : "bg-[#fff1f1] text-[#e34d5b]"}`}>
                                {review.isActive ? "Active" : "Hidden"}
                              </span>
                            </td>
                            <td className="border-b border-[#f1ece6] px-4 py-5">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => startEditingReview(review)}
                                  className="inline-flex items-center gap-2 rounded-lg bg-[#1f7cf0] px-3 py-2 text-xs font-semibold text-white"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  disabled={deletingReviewId === review.id || !review.fromDb}
                                  onClick={() => handleDeleteReview(review)}
                                  className="inline-flex items-center gap-2 rounded-lg bg-[#ef4457] px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  {deletingReviewId === review.id ? "Deleting..." : "Delete"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {editReviewForm ? (
                <div className="mt-6 rounded-2xl border border-[#e7e2da] bg-white p-5 shadow-[0_18px_40px_-38px_rgba(60,40,20,0.45)]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-3xl font-semibold text-[#161616]">Edit Review</h3>
                      <p className="mt-1 text-sm text-[#7d7d84]">Update customer review text, rating, order, and visibility.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditReviewForm(null);
                        setReviewEditMessage("");
                      }}
                      className="rounded-xl border border-[#e1dbd2] px-4 py-2 text-sm font-medium text-[#4c4a52] transition hover:bg-[#f8f6f2]"
                    >
                      Close
                    </button>
                  </div>
                  <form onSubmit={handleUpdateReview} className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-[#1c1c24]">Customer Name</label>
                      <input
                        type="text"
                        value={editReviewForm.authorName}
                        onChange={(e) => handleEditReviewFormChange("authorName", e.target.value)}
                        className="mt-2 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition focus:border-[#8a73eb]"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#1c1c24]">Location</label>
                      <input
                        type="text"
                        value={editReviewForm.location}
                        onChange={(e) => handleEditReviewFormChange("location", e.target.value)}
                        className="mt-2 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition focus:border-[#8a73eb]"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#1c1c24]">Rating</label>
                      <select
                        value={editReviewForm.rating}
                        onChange={(e) => handleEditReviewFormChange("rating", e.target.value)}
                        className="mt-2 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition focus:border-[#8a73eb]"
                      >
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <option key={rating} value={rating}>{rating} Star</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#1c1c24]">Sort Order</label>
                      <input
                        type="number"
                        min={1}
                        value={editReviewForm.sortOrder}
                        onChange={(e) => handleEditReviewFormChange("sortOrder", e.target.value)}
                        className="mt-2 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition focus:border-[#8a73eb]"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-[#1c1c24]">Review Text</label>
                      <textarea
                        value={editReviewForm.reviewText}
                        onChange={(e) => handleEditReviewFormChange("reviewText", e.target.value)}
                        className="mt-2 min-h-28 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition focus:border-[#8a73eb]"
                        required
                      />
                    </div>
                    <div className="md:col-span-2 flex items-center gap-3">
                      <input
                        id={`review-active-${editReviewForm.id}`}
                        type="checkbox"
                        checked={editReviewForm.isActive}
                        onChange={(e) => handleEditReviewFormChange("isActive", e.target.checked)}
                        className="h-4 w-4 rounded"
                      />
                      <label htmlFor={`review-active-${editReviewForm.id}`} className="text-sm font-medium text-[#1c1c24]">
                        Active on home page
                      </label>
                    </div>
                    <div className="md:col-span-2 flex items-center gap-3">
                      <button
                        type="submit"
                        disabled={isReviewUpdating}
                        className="rounded-xl bg-[#6f56de] px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:brightness-105 disabled:opacity-60"
                      >
                        {isReviewUpdating ? "Saving..." : "Save Review"}
                      </button>
                    </div>
                  </form>
                </div>
              ) : null}
            </>
          ) : null}

          {activeSection === "Orders" ? (
            <div className="mt-6 rounded-2xl border border-[#e7e2da] bg-white p-5 shadow-[0_18px_40px_-38px_rgba(60,40,20,0.45)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-3xl font-semibold text-[#161616]">Orders</h3>
                  <p className="mt-1 text-sm text-[#7d7d84]">
                    Order records pulled from the MySQL orders table.
                  </p>
                </div>
                <div className="rounded-xl bg-[#f5f2ec] px-4 py-2 text-sm text-[#6b645c]">
                  {filteredOrders.length} entries
                </div>
              </div>

              <div className="mt-5 overflow-x-auto">
                <table className="min-w-[900px] w-full border-separate border-spacing-0">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-[0.18em] text-[#7e7e88]">
                      <th className="border-b border-[#ece6de] px-4 py-4 font-semibold">Order</th>
                      <th className="border-b border-[#ece6de] px-4 py-4 font-semibold">Customer</th>
                      <th className="border-b border-[#ece6de] px-4 py-4 font-semibold">Phone</th>
                      <th className="border-b border-[#ece6de] px-4 py-4 font-semibold">Amount</th>
                      <th className="border-b border-[#ece6de] px-4 py-4 font-semibold">Status</th>
                      <th className="border-b border-[#ece6de] px-4 py-4 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length ? (
                      filteredOrders.map((order) => (
                        <tr key={order.id}>
                          <td className="border-b border-[#f1ece6] px-4 py-5 font-semibold text-[#1d2433]">
                            #{order.orderNo}
                          </td>
                          <td className="border-b border-[#f1ece6] px-4 py-5">
                            <p className="font-medium text-[#1d2433]">{order.customerName}</p>
                            <p className="text-sm text-[#7d7d84]">{order.customerEmail}</p>
                          </td>
                          <td className="border-b border-[#f1ece6] px-4 py-5 text-sm text-[#7d7d84]">
                            {order.customerPhone || "-"}
                          </td>
                          <td className="border-b border-[#f1ece6] px-4 py-5 font-medium text-[#1d2433]">
                            Rs. {order.totalAmount.toLocaleString("en-IN")}
                          </td>
                          <td className="border-b border-[#f1ece6] px-4 py-5">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getOrderStatusClass(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="border-b border-[#f1ece6] px-4 py-5 text-sm text-[#7d7d84]">
                            {formatDate(order.createdAt)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-sm text-[#7d7d84]">
                          No orders found in the database yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {activeSection === "Customers" ? (
            <div className="mt-6 rounded-2xl border border-[#e7e2da] bg-white p-5 shadow-[0_18px_40px_-38px_rgba(60,40,20,0.45)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-3xl font-semibold text-[#161616]">Customers</h3>
                  <p className="mt-1 text-sm text-[#7d7d84]">
                    Customer records pulled from the MySQL users table.
                  </p>
                </div>
                <div className="rounded-xl bg-[#f5f2ec] px-4 py-2 text-sm text-[#6b645c]">
                  {filteredCustomers.length} entries
                </div>
              </div>

              <div className="mt-5 overflow-x-auto">
                <table className="min-w-[760px] w-full border-separate border-spacing-0">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-[0.18em] text-[#7e7e88]">
                      <th className="border-b border-[#ece6de] px-4 py-4 font-semibold">ID</th>
                      <th className="border-b border-[#ece6de] px-4 py-4 font-semibold">Customer</th>
                      <th className="border-b border-[#ece6de] px-4 py-4 font-semibold">Email</th>
                      <th className="border-b border-[#ece6de] px-4 py-4 font-semibold">Status</th>
                      <th className="border-b border-[#ece6de] px-4 py-4 font-semibold">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.length ? (
                      filteredCustomers.map((customer) => (
                        <tr key={customer.id}>
                          <td className="border-b border-[#f1ece6] px-4 py-5 font-semibold text-[#1d2433]">
                            #{customer.id}
                          </td>
                          <td className="border-b border-[#f1ece6] px-4 py-5 font-medium text-[#1d2433]">
                            {customer.fullName}
                          </td>
                          <td className="border-b border-[#f1ece6] px-4 py-5 text-sm text-[#7d7d84]">
                            {customer.email}
                          </td>
                          <td className="border-b border-[#f1ece6] px-4 py-5">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${customer.isActive ? "bg-[#eff7f0] text-[#2f8f49]" : "bg-[#fff1f1] text-[#e34d5b]"}`}>
                              {customer.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="border-b border-[#f1ece6] px-4 py-5 text-sm text-[#7d7d84]">
                            {formatDate(customer.createdAt)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-10 text-center text-sm text-[#7d7d84]">
                          No customers found in the database yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {activeSection === "Products" ? (
          <>
          <div className="mt-6 grid gap-6 2xl:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-2xl border border-[#e7e2da] bg-white p-5 shadow-[0_18px_40px_-38px_rgba(60,40,20,0.45)]">
              <div className="flex items-center gap-3">
                <CirclePlus className="h-5 w-5 text-[#6f56de]" />
                <div>
                  <h2 className="text-3xl font-semibold text-[#161616]">Add Product</h2>
                  <p className="mt-1 text-sm text-[#7d7d84]">
                    Add a new product and publish it on the catalogue instantly.
                  </p>
                </div>
              </div>

              <form onSubmit={handleAddProduct} className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-[#1c1c24]">Product Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                    className="mt-2 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm text-[#1c1c24] outline-none transition focus:border-[#8a73eb]"
                    placeholder="Royal Talwar"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[#1c1c24]">Price</label>
                  <input
                    type="text"
                    value={form.price}
                    onChange={(e) => handleFormChange("price", e.target.value)}
                    className="mt-2 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm text-[#1c1c24] outline-none transition focus:border-[#8a73eb]"
                    placeholder="Rs. 9,500"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[#1c1c24]">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => handleFormChange("category", e.target.value as Product["category"])}
                    className="mt-2 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm text-[#1c1c24] outline-none transition focus:border-[#8a73eb]"
                  >
                    {productCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-[#1c1c24]">Stock Quantity</label>
                  <input
                    type="number"
                    min={0}
                    value={form.stockQuantity}
                    onChange={(e) => handleFormChange("stockQuantity", e.target.value)}
                    className="mt-2 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm text-[#1c1c24] outline-none transition focus:border-[#8a73eb]"
                    placeholder="10"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[#1c1c24]">Tag</label>
                  <input
                    type="text"
                    value={form.tag}
                    onChange={(e) => handleFormChange("tag", e.target.value)}
                    className="mt-2 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm text-[#1c1c24] outline-none transition focus:border-[#8a73eb]"
                    placeholder="New / Featured"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[#1c1c24]">Material</label>
                  <input
                    type="text"
                    value={form.material}
                    onChange={(e) => handleFormChange("material", e.target.value)}
                    className="mt-2 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm text-[#1c1c24] outline-none transition focus:border-[#8a73eb]"
                    placeholder="Steel and brass"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[#1c1c24]">Dimensions</label>
                  <input
                    type="text"
                    value={form.dimensions}
                    onChange={(e) => handleFormChange("dimensions", e.target.value)}
                    className="mt-2 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm text-[#1c1c24] outline-none transition focus:border-[#8a73eb]"
                    placeholder='Approx. 24" length'
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-[#1c1c24]">Upload Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="mt-2 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-[#6f56de] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white"
                    required
                  />
                  <p className="mt-2 text-xs text-[#7d7d84]">
                    {selectedImageName ? `Selected: ${selectedImageName}` : "Max size: 2MB"}
                  </p>
                  {form.image ? (
                    <div className="mt-3 flex items-center gap-3 rounded-xl border border-[#eee9e2] bg-[#fbfaf7] p-3">
                      <ImagePlus className="h-4 w-4 text-[#6f56de]" />
                      <img
                        src={form.image}
                        alt="Product preview"
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                      <span className="text-xs text-[#7d7d84]">Image ready</span>
                    </div>
                  ) : null}
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-[#1c1c24]">Short Description</label>
                  <input
                    type="text"
                    value={form.shortDescription}
                    onChange={(e) => handleFormChange("shortDescription", e.target.value)}
                    className="mt-2 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm text-[#1c1c24] outline-none transition focus:border-[#8a73eb]"
                    placeholder="Handcrafted heritage collectible for premium decor."
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-[#1c1c24]">Details</label>
                  <textarea
                    value={form.details}
                    onChange={(e) => handleFormChange("details", e.target.value)}
                    className="mt-2 min-h-28 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm text-[#1c1c24] outline-none transition focus:border-[#8a73eb]"
                    placeholder="Detailed product information for product detail page."
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center rounded-xl bg-[#6f56de] px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:brightness-105"
                  >
                    Add Product
                  </button>
                </div>
              </form>

              {saveMessage ? (
                <p className="mt-3 text-sm font-medium text-emerald-700">{saveMessage}</p>
              ) : null}
            </div>

            <div className="rounded-2xl border border-[#e7e2da] bg-white p-5 shadow-[0_18px_40px_-38px_rgba(60,40,20,0.45)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-3xl font-semibold text-[#161616]">Recent Transactions</h3>
                  <p className="mt-1 text-sm text-[#7d7d84]">
                    Product inventory and publish control from one dashboard.
                  </p>
                </div>
                <div className="rounded-xl bg-[#f5f2ec] px-4 py-2 text-sm text-[#6b645c]">
                  {filteredProducts.length} entries
                </div>
              </div>

              {editMessage ? (
                <p className="mt-3 text-sm font-medium text-emerald-700">{editMessage}</p>
              ) : null}

              <div className="mt-5 overflow-x-auto">
                <table className="min-w-[860px] w-full border-separate border-spacing-0">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-[0.18em] text-[#7e7e88]">
                      <th className="border-b border-[#ece6de] px-4 py-4 font-semibold">ID</th>
                      <th className="border-b border-[#ece6de] px-4 py-4 font-semibold">Product</th>
                      <th className="border-b border-[#ece6de] px-4 py-4 font-semibold">Category</th>
                      <th className="border-b border-[#ece6de] px-4 py-4 font-semibold">Price</th>
                      <th className="border-b border-[#ece6de] px-4 py-4 font-semibold">Status</th>
                      <th className="border-b border-[#ece6de] px-4 py-4 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((item) => (
                      <tr key={item.id} className="align-top text-[#1d2433]">
                        <td className="border-b border-[#f1ece6] px-4 py-5 font-semibold">
                          #{item.id.slice(0, 8)}
                        </td>
                        <td className="border-b border-[#f1ece6] px-4 py-5">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-12 w-12 rounded-xl object-cover"
                            />
                            <div>
                              <p className="font-semibold">{item.name}</p>
                              <p className="mt-1 text-sm text-[#70727d]">
                                Stock: {item.stockQuantity}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="border-b border-[#f1ece6] px-4 py-5 text-sm">
                          {item.category}
                        </td>
                        <td className="border-b border-[#f1ece6] px-4 py-5 font-medium">
                          {item.price}
                        </td>
                        <td className="border-b border-[#f1ece6] px-4 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              item.isPublished
                                ? "bg-[#eff7f0] text-[#2f8f49]"
                                : "bg-[#fff1f1] text-[#e34d5b]"
                            }`}
                          >
                            {item.isPublished ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td className="border-b border-[#f1ece6] px-4 py-5">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => startEditing(item)}
                              className="inline-flex items-center gap-2 rounded-lg bg-[#1f7cf0] px-3 py-2 text-xs font-semibold text-white"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                navigate({
                                  to: "/products/$productId",
                                  params: { productId: item.id },
                                })
                              }
                              className="inline-flex items-center gap-2 rounded-lg bg-[#10233e] px-3 py-2 text-xs font-semibold text-white"
                            >
                              <ShoppingBag className="h-3.5 w-3.5" />
                              View
                            </button>
                            <button
                              type="button"
                              disabled={deletingProductId === item.id || !item.fromDb}
                              onClick={() => handleDeleteProduct(item)}
                              className="inline-flex items-center gap-2 rounded-lg bg-[#ef4457] px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              {deletingProductId === item.id ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {editForm ? (
            <div className="mt-6 rounded-2xl border border-[#e7e2da] bg-white p-5 shadow-[0_18px_40px_-38px_rgba(60,40,20,0.45)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-3xl font-semibold text-[#161616]">Edit Product</h3>
                  <p className="mt-1 text-sm text-[#7d7d84]">
                    Update stock, details, image, and publish status.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditForm(null);
                    setEditImageName("");
                    setEditMessage("");
                  }}
                  className="rounded-xl border border-[#e1dbd2] px-4 py-2 text-sm font-medium text-[#4c4a52] transition hover:bg-[#f8f6f2]"
                >
                  Close
                </button>
              </div>

              <form
                onSubmit={handleUpdateProduct}
                className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2"
              >
                <div>
                  <label className="text-sm font-medium text-[#1c1c24]">Product Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => handleEditFormChange("name", e.target.value)}
                    className="mt-2 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition focus:border-[#8a73eb]"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[#1c1c24]">Price</label>
                  <input
                    type="text"
                    value={editForm.price}
                    onChange={(e) => handleEditFormChange("price", e.target.value)}
                    className="mt-2 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition focus:border-[#8a73eb]"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[#1c1c24]">Stock Quantity</label>
                  <input
                    type="number"
                    min={0}
                    value={editForm.stockQuantity}
                    onChange={(e) => handleEditFormChange("stockQuantity", e.target.value)}
                    className="mt-2 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition focus:border-[#8a73eb]"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[#1c1c24]">Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) =>
                      handleEditFormChange("category", e.target.value as Product["category"])
                    }
                    className="mt-2 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition focus:border-[#8a73eb]"
                  >
                    {productCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-[#1c1c24]">Tag</label>
                  <input
                    type="text"
                    value={editForm.tag}
                    onChange={(e) => handleEditFormChange("tag", e.target.value)}
                    className="mt-2 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition focus:border-[#8a73eb]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[#1c1c24]">Material</label>
                  <input
                    type="text"
                    value={editForm.material}
                    onChange={(e) => handleEditFormChange("material", e.target.value)}
                    className="mt-2 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition focus:border-[#8a73eb]"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[#1c1c24]">Dimensions</label>
                  <input
                    type="text"
                    value={editForm.dimensions}
                    onChange={(e) => handleEditFormChange("dimensions", e.target.value)}
                    className="mt-2 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition focus:border-[#8a73eb]"
                    required
                  />
                </div>

                <div className="flex items-center gap-3 pt-8">
                  <input
                    id={`publish-${editForm.id}`}
                    type="checkbox"
                    checked={editForm.isPublished}
                    onChange={(e) => handleEditFormChange("isPublished", e.target.checked)}
                    className="h-4 w-4 rounded"
                  />
                  <label htmlFor={`publish-${editForm.id}`} className="text-sm font-medium text-[#1c1c24]">
                    Published
                  </label>
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-[#1c1c24]">
                    Upload New Image (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditImageUpload}
                    className="mt-2 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm outline-none"
                  />
                  <p className="mt-2 text-xs text-[#7d7d84]">
                    {editImageName ? `Selected: ${editImageName}` : "Keep empty to use current image"}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-[#1c1c24]">Short Description</label>
                  <input
                    type="text"
                    value={editForm.shortDescription}
                    onChange={(e) => handleEditFormChange("shortDescription", e.target.value)}
                    className="mt-2 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition focus:border-[#8a73eb]"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-[#1c1c24]">Details</label>
                  <textarea
                    value={editForm.details}
                    onChange={(e) => handleEditFormChange("details", e.target.value)}
                    className="mt-2 min-h-28 w-full rounded-xl border border-[#e4dfd7] bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition focus:border-[#8a73eb]"
                    required
                  />
                </div>

                <div className="md:col-span-2 flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="rounded-xl bg-[#6f56de] px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:brightness-105 disabled:opacity-60"
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
                    className="rounded-xl border border-[#e1dbd2] px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#4c4a52] transition hover:bg-[#f8f6f2]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : null}
          </>
        ) : null}
        </div>
      </section>
    </div>
  );
}

