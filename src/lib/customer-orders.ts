import { useEffect, useState } from "react";
import { parseCurrencyAmount } from "@/lib/utils";

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

function canUseStorage() {
  return typeof window !== "undefined";
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

export function getStoredCustomers() {
  return readJson<CustomerProfile[]>(CUSTOMERS_KEY, []);
}

export function saveStoredCustomers(customers: CustomerProfile[]) {
  writeJson(CUSTOMERS_KEY, customers, CUSTOMERS_EVENT);
}

export function getStoredOrders() {
  return readJson<OrderRecord[]>(ORDERS_KEY, []);
}

export function saveStoredOrders(orders: OrderRecord[]) {
  writeJson(ORDERS_KEY, orders, ORDERS_EVENT);
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

export function loginCustomer(input: {
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

  saveStoredCustomers(customers);
  saveCustomerSession({
    customerId: customer.id,
    name: customer.name,
    email: customer.email,
  });

  return customer;
}

export function logoutCustomer() {
  saveCustomerSession(null);
}

export function updateCustomerProfile(customerId: string, updates: Partial<CustomerProfile>) {
  const customers = getStoredCustomers();
  const next = customers.map((customer) =>
    customer.id === customerId
      ? {
          ...customer,
          ...updates,
        }
      : customer,
  );

  saveStoredCustomers(next);
}

export function placeOrder(input: {
  customer: CustomerProfile;
  items: OrderItem[];
  paymentMethod: "Cash On Delivery" | "Online Payment";
}) {
  const paymentInfo =
    input.paymentMethod === "Cash On Delivery"
      ? "Cash On Delivery Pending"
      : "Online Payment Pending";

  const totalPriceValue = input.items.reduce((sum, item) => {
    const unitPrice = parseCurrencyAmount(item.price);
    return sum + unitPrice * item.quantity;
  }, 0);

  const totalPrice = `Rs. ${totalPriceValue.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const nextOrder: OrderRecord = {
    id: buildOrderId(),
    customerId: input.customer.id,
    customerName: input.customer.name,
    customerEmail: input.customer.email,
    customerPhone: input.customer.phone,
    customerAddress: input.customer.address,
    items: input.items,
    paymentMethod: input.paymentMethod,
    paymentInfo,
    status: "Pending",
    totalPrice,
    createdAt: new Date().toISOString(),
  };

  const orders = getStoredOrders();
  saveStoredOrders([nextOrder, ...orders]);
  return nextOrder;
}

export function updateOrderStatus(orderId: string, status: OrderStatus) {
  const orders = getStoredOrders();
  const next = orders.map((order) =>
    order.id === orderId
      ? {
          ...order,
          status,
          paymentInfo:
            status === "Cancelled"
              ? order.paymentMethod === "Cash On Delivery"
                ? "Cash On Delivery Cancelled"
                : "Online Payment Cancelled"
              : order.paymentMethod === "Cash On Delivery"
              ? `Cash On Delivery ${status}`
              : `Online Payment ${status}`,
        }
      : order,
  );

  saveStoredOrders(next);
}

function useStoredValue<T>(read: () => T, events: string[]) {
  const [value, setValue] = useState<T>(() => read());

  useEffect(() => {
    if (!canUseStorage()) return;

    const syncValue = () => setValue(read());

    syncValue();
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
  }, [events, read]);

  return value;
}

export function useStoredCustomers() {
  return useStoredValue(getStoredCustomers, [CUSTOMERS_EVENT]);
}

export function useStoredOrders() {
  return useStoredValue(getStoredOrders, [ORDERS_EVENT]);
}

export function useCustomerSession() {
  return useStoredValue(getCustomerSession, [SESSION_EVENT]);
}
