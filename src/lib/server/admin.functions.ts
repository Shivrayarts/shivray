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

