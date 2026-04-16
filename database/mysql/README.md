# MySQL Setup (Shivray)

## 1) Create schema
Run:

```sql
SOURCE database/mysql/schema.sql;
```

## 2) Seed demo data
Run:

```sql
SOURCE database/mysql/seed.sql;
```

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
