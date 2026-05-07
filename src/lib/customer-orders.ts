import { useEffect, useState } from "react";
import { parseCurrencyAmount } from "@/lib/utils";
import { apiRequest } from "@/lib/api";

export type CustomerProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
  lastLoginAt: string;
};

export type CustomerSession = {
  customerId: string;
  name: string;
  email: string;
};

export type OrderStatus =
  | "Pending"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export type OrderItem = {
  productId: string;
  productName: string;
  price: string;
  quantity: number;
  image: string;
};

export type OrderRecord = {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  paymentMethod: "Cash On Delivery" | "Online Payment";
  paymentInfo: string;
  status: OrderStatus;
  totalPrice: string;
  createdAt: string;
};

const CUSTOMERS_KEY = "shivray_customers_store_v1";
const ORDERS_KEY = "shivray_orders_store_v1";
const SESSION_KEY = "shivray_customer_session";

const CUSTOMERS_EVENT = "shivray-customers-updated";
const ORDERS_EVENT = "shivray-orders-updated";
const SESSION_EVENT = "shivray-customer-session-updated";
const CUSTOMER_EVENTS = [CUSTOMERS_EVENT];
const ORDER_EVENTS = [ORDERS_EVENT];
const SESSION_EVENTS = [SESSION_EVENT];

let adminCommerceBootstrapPromise: Promise<void> | null = null;

function canUseStorage() {
  return typeof window !== "undefined";
}

function ensureArray<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T, eventName: string) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(eventName));
}

function removeStored(key: string, eventName: string) {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(key);
  window.dispatchEvent(new Event(eventName));
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildOrderId() {
  return `#order-${Date.now().toString().slice(-6)}`;
}

function formatCurrency(value: number) {
  return `Rs. ${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function computePaymentInfo(
  paymentMethod: "Cash On Delivery" | "Online Payment",
  status: OrderStatus,
) {
  if (status === "Cancelled") {
    return `${paymentMethod} Cancelled`;
  }

  return `${paymentMethod} ${status}`;
}

function applyCustomersToCache(customers: CustomerProfile[]) {
  writeJson(CUSTOMERS_KEY, customers, CUSTOMERS_EVENT);
}

function applyOrdersToCache(orders: OrderRecord[]) {
  writeJson(ORDERS_KEY, orders, ORDERS_EVENT);
}

function logSyncError(scope: string, error: unknown) {
  console.error(`Failed to sync ${scope} with the backend.`, error);
}

async function refreshAdminCommerceData() {
  const [customersResponse, ordersResponse] = await Promise.all([
    apiRequest<{ customers: CustomerProfile[] }>("/api/admin/customers"),
    apiRequest<{ orders: OrderRecord[] }>("/api/admin/orders"),
  ]);

  applyCustomersToCache(customersResponse.customers);
  applyOrdersToCache(ordersResponse.orders);
}

function bootstrapAdminCommerceData() {
  if (!adminCommerceBootstrapPromise) {
    adminCommerceBootstrapPromise = refreshAdminCommerceData().catch((error) => {
      adminCommerceBootstrapPromise = null;
      logSyncError("admin commerce bootstrap", error);
    });
  }

  return adminCommerceBootstrapPromise;
}

function upsertCustomerLocally(input: {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}) {
  const now = new Date().toISOString();
  const normalizedEmail = input.email.trim().toLowerCase();
  const trimmedName = input.name.trim() || normalizedEmail.split("@")[0] || "Customer";
  const customers = getStoredCustomers();
  const existingIndex = customers.findIndex((item) => item.email.toLowerCase() === normalizedEmail);

  let customer: CustomerProfile;

  if (existingIndex >= 0) {
    customer = {
      ...customers[existingIndex],
      name: trimmedName || customers[existingIndex].name,
      phone: input.phone?.trim() || customers[existingIndex].phone,
      address: input.address?.trim() || customers[existingIndex].address,
      lastLoginAt: now,
    };
    customers[existingIndex] = customer;
  } else {
    customer = {
      id: `customer-${slugify(normalizedEmail)}-${Date.now()}`,
      name: trimmedName,
      email: normalizedEmail,
      phone: input.phone?.trim() || "",
      address: input.address?.trim() || "",
      createdAt: now,
      lastLoginAt: now,
    };
    customers.unshift(customer);
  }

  applyCustomersToCache(customers);
  saveCustomerSession({
    customerId: customer.id,
    name: customer.name,
    email: customer.email,
  });

  return customer;
}

export function getStoredCustomers() {
  return ensureArray(readJson<CustomerProfile[]>(CUSTOMERS_KEY, []), []);
}

export function saveStoredCustomers(customers: CustomerProfile[]) {
  applyCustomersToCache(customers);
}

export function getStoredOrders() {
  return ensureArray(readJson<OrderRecord[]>(ORDERS_KEY, []), []);
}

export function saveStoredOrders(orders: OrderRecord[]) {
  applyOrdersToCache(orders);
}

export function getCustomerSession() {
  return readJson<CustomerSession | null>(SESSION_KEY, null);
}

export function saveCustomerSession(session: CustomerSession | null) {
  if (!canUseStorage()) return;
  if (session) {
    writeJson(SESSION_KEY, session, SESSION_EVENT);
    return;
  }

  removeStored(SESSION_KEY, SESSION_EVENT);
}

export async function loginCustomer(input: {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}) {
  try {
    const response = await apiRequest<{ customer: CustomerProfile }>("/api/customers/login", {
      method: "POST",
      body: input,
    });

    const customers = getStoredCustomers();
    const nextCustomers = [
      response.customer,
      ...customers.filter((customer) => customer.id !== response.customer.id),
    ];
    applyCustomersToCache(nextCustomers);
    saveCustomerSession({
      customerId: response.customer.id,
      name: response.customer.name,
      email: response.customer.email,
    });

    return response.customer;
  } catch (error) {
    logSyncError("customer login", error);
    return upsertCustomerLocally(input);
  }
}

export function logoutCustomer() {
  saveCustomerSession(null);
}

export async function updateCustomerProfile(customerId: string, updates: Partial<CustomerProfile>) {
  const customers = getStoredCustomers();
  const next = customers.map((customer) =>
    customer.id === customerId
      ? {
          ...customer,
          ...updates,
        }
      : customer,
  );

  applyCustomersToCache(next);

  try {
    const customer = next.find((item) => item.id === customerId);
    if (!customer) return;

    await apiRequest("/api/customers/" + encodeURIComponent(customerId), {
      method: "PUT",
      body: customer,
    });
  } catch (error) {
    logSyncError("customer profile", error);
  }
}

export async function placeOrder(input: {
  customer: CustomerProfile;
  items: OrderItem[];
  paymentMethod: "Cash On Delivery" | "Online Payment";
}) {
  try {
    const response = await apiRequest<{ order: OrderRecord }>("/api/orders", {
      method: "POST",
      body: input,
    });

    applyOrdersToCache([response.order, ...getStoredOrders()]);
    return response.order;
  } catch (error) {
    logSyncError("order placement", error);

    const totalPriceValue = input.items.reduce((sum, item) => {
      const unitPrice = parseCurrencyAmount(item.price);
      return sum + unitPrice * item.quantity;
    }, 0);

    const nextOrder: OrderRecord = {
      id: buildOrderId(),
      customerId: input.customer.id,
      customerName: input.customer.name,
      customerEmail: input.customer.email,
      customerPhone: input.customer.phone,
      customerAddress: input.customer.address,
      items: input.items,
      paymentMethod: input.paymentMethod,
      paymentInfo: computePaymentInfo(input.paymentMethod, "Pending"),
      status: "Pending",
      totalPrice: formatCurrency(totalPriceValue),
      createdAt: new Date().toISOString(),
    };

    applyOrdersToCache([nextOrder, ...getStoredOrders()]);
    return nextOrder;
  }
}

export function updateOrderStatus(orderId: string, status: OrderStatus) {
  const orders = getStoredOrders();
  const next = orders.map((order) =>
    order.id === orderId
      ? {
          ...order,
          status,
          paymentInfo: computePaymentInfo(order.paymentMethod, status),
        }
      : order,
  );

  applyOrdersToCache(next);

  const targetOrder = next.find((order) => order.id === orderId);
  if (!targetOrder) return;

  void apiRequest("/api/admin/orders/" + encodeURIComponent(orderId) + "/status", {
    method: "PATCH",
    body: {
      status,
      paymentMethod: targetOrder.paymentMethod,
    },
  }).catch((error) => logSyncError("order status", error));
}

function useStoredValue<T>(read: () => T, events: string[], bootstrap?: () => Promise<void> | null) {
  const [value, setValue] = useState<T>(() => read());

  useEffect(() => {
    if (!canUseStorage()) return;

    const syncValue = () => setValue(read());

    syncValue();
    if (bootstrap) {
      void bootstrap().then(syncValue).catch(() => undefined);
    }

    window.addEventListener("storage", syncValue);
    for (const eventName of events) {
      window.addEventListener(eventName, syncValue);
    }

    return () => {
      window.removeEventListener("storage", syncValue);
      for (const eventName of events) {
        window.removeEventListener(eventName, syncValue);
      }
    };
  }, [events, bootstrap, read]);

  return value;
}

export function useStoredCustomers() {
  return useStoredValue(getStoredCustomers, CUSTOMER_EVENTS, bootstrapAdminCommerceData);
}

export function useStoredOrders() {
  return useStoredValue(getStoredOrders, ORDER_EVENTS, bootstrapAdminCommerceData);
}

export function useCustomerSession() {
  return useStoredValue(getCustomerSession, SESSION_EVENTS);
}
