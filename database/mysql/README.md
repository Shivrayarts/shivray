# MySQL Setup (Shivray)

## 1) Import schema in Hostinger phpMyAdmin
1. Create a database named `shivray_arts` in Hostinger if it does not already exist.
2. Open that database in phpMyAdmin.
3. Use the `Import` tab and upload `database/mysql/schema.sql`.

## 2) Seed demo data
1. Stay inside the same `shivray_arts` database in phpMyAdmin.
2. Use the `Import` tab and upload `database/mysql/seed.sql`.

## Dummy admin login (seeded)
- Email: `admin@shivray.local`
- Password (plain): `Admin@123`
- Stored as: `SHA2(password, 256)` in `users.password_hash`

## App environment variables
Create `.env` in project root (copy from `.env.example`):

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=shivray_arts
```

## Tables included
- `users`
- `products`
- `orders`
- `order_items`
- `inquiries`

## Quick local CLI example

```bash
mysql -u root -p < database/mysql/schema.sql
mysql -u root -p < database/mysql/seed.sql
npm run dev
```
