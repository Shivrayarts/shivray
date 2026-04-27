import { createServerFn } from "@tanstack/react-start";
import { getMysqlPool } from "@/lib/server/mysql";

type VerifyAdminInput = {
  email: string;
  password: string;
};

type VerifyAdminResult = {
  success: boolean;
  message: string;
};

export type AdminDashboardOrder = {
  id: number;
  orderNo: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  totalAmount: number;
  status: "pending" | "paid" | "packed" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
};

export type AdminDashboardCustomer = {
  id: number;
  fullName: string;
  email: string;
  isActive: boolean;
  createdAt: string;
};

export type AdminDashboardInquiry = {
  id: number;
  name: string;
  email: string;
  subject: string | null;
  status: "new" | "in_progress" | "resolved";
  createdAt: string;
};

export type AdminDashboardData = {
  stats: {
    totalSales: number;
    orderCount: number;
    customerCount: number;
    enquiryCount: number;
  };
  orders: AdminDashboardOrder[];
  customers: AdminDashboardCustomer[];
  inquiries: AdminDashboardInquiry[];
};

export const verifyAdminLoginServer = createServerFn({ method: "POST" })
  .inputValidator((data: VerifyAdminInput) => data)
  .handler(async ({ data }): Promise<VerifyAdminResult> => {
    try {
      const pool = getMysqlPool();
      const [rows] = await pool.query<
        Array<{ id: number; email: string; role: "admin" | "customer" }>
      >(
        `SELECT id, email, role
         FROM users
         WHERE email = ?
           AND role = 'admin'
           AND is_active = 1
           AND password_hash = SHA2(?, 256)
         LIMIT 1`,
        [data.email, data.password],
      );

      if (!rows.length) {
        return { success: false, message: "Invalid admin email or password." };
      }

      return { success: true, message: "Login successful." };
    } catch (error) {
      console.error("verifyAdminLoginServer error:", error);
      return {
        success: false,
        message: "Database connection failed. Please check MySQL env setup.",
      };
    }
  });

export const getAdminDashboardDataServer = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminDashboardData> => {
    try {
      const pool = getMysqlPool();

      const [statsRows] = await pool.query<
        Array<{
          total_sales: number | string | null;
          order_count: number | string | null;
          customer_count: number | string | null;
          enquiry_count: number | string | null;
        }>
      >(
        `SELECT
          COALESCE((SELECT SUM(total_amount) FROM orders), 0) AS total_sales,
          COALESCE((SELECT COUNT(*) FROM orders), 0) AS order_count,
          COALESCE((SELECT COUNT(*) FROM users WHERE role = 'customer'), 0) AS customer_count,
          COALESCE((SELECT COUNT(*) FROM inquiries), 0) AS enquiry_count`,
      );

      const [orderRows] = await pool.query<
        Array<{
          id: number;
          order_no: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string | null;
          total_amount: number | string;
          status: AdminDashboardOrder["status"];
          created_at: Date | string;
        }>
      >(
        `SELECT id, order_no, customer_name, customer_email, customer_phone, total_amount, status, created_at
         FROM orders
         ORDER BY created_at DESC
         LIMIT 20`,
      );

      const [customerRows] = await pool.query<
        Array<{
          id: number;
          full_name: string;
          email: string;
          is_active: number;
          created_at: Date | string;
        }>
      >(
        `SELECT id, full_name, email, is_active, created_at
         FROM users
         WHERE role = 'customer'
         ORDER BY created_at DESC
         LIMIT 20`,
      );

      const [inquiryRows] = await pool.query<
        Array<{
          id: number;
          name: string;
          email: string;
          subject: string | null;
          status: AdminDashboardInquiry["status"];
          created_at: Date | string;
        }>
      >(
        `SELECT id, name, email, subject, status, created_at
         FROM inquiries
         ORDER BY created_at DESC
         LIMIT 20`,
      );

      const statsRow = statsRows[0] ?? {
        total_sales: 0,
        order_count: 0,
        customer_count: 0,
        enquiry_count: 0,
      };

      return {
        stats: {
          totalSales: Number(statsRow.total_sales ?? 0),
          orderCount: Number(statsRow.order_count ?? 0),
          customerCount: Number(statsRow.customer_count ?? 0),
          enquiryCount: Number(statsRow.enquiry_count ?? 0),
        },
        orders: orderRows.map((row) => ({
          id: row.id,
          orderNo: row.order_no,
          customerName: row.customer_name,
          customerEmail: row.customer_email,
          customerPhone: row.customer_phone,
          totalAmount: Number(row.total_amount),
          status: row.status,
          createdAt:
            row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
        })),
        customers: customerRows.map((row) => ({
          id: row.id,
          fullName: row.full_name,
          email: row.email,
          isActive: row.is_active === 1,
          createdAt:
            row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
        })),
        inquiries: inquiryRows.map((row) => ({
          id: row.id,
          name: row.name,
          email: row.email,
          subject: row.subject,
          status: row.status,
          createdAt:
            row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
        })),
      };
    } catch (error) {
      console.error("getAdminDashboardDataServer error:", error);
      return {
        stats: {
          totalSales: 0,
          orderCount: 0,
          customerCount: 0,
          enquiryCount: 0,
        },
        orders: [],
        customers: [],
        inquiries: [],
      };
    }
  },
);

