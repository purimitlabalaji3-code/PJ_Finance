-- ============================================================
-- PJ Finance — Neon PostgreSQL Schema
-- Run this once in your Neon SQL Editor to set up the database
-- ============================================================

-- Admin (single user)
CREATE TABLE IF NOT EXISTS admin (
  id         SERIAL PRIMARY KEY,
  username   TEXT NOT NULL DEFAULT 'admin',
  password   TEXT NOT NULL,           -- bcrypt hash
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id        SERIAL PRIMARY KEY,
  name      TEXT NOT NULL,
  phone     TEXT NOT NULL,
  age       INT,
  gender    TEXT,
  aadhaar   TEXT,
  address   TEXT,
  status    TEXT NOT NULL DEFAULT 'Active',
  image     TEXT,                     -- base64 or URL
  join_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Loans
CREATE TABLE IF NOT EXISTS loans (
  id            SERIAL PRIMARY KEY,
  customer_id   INT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  loan_amount   NUMERIC(12,2) NOT NULL,
  interest      NUMERIC(5,2)  NOT NULL DEFAULT 10,
  total_amount  NUMERIC(12,2) NOT NULL,
  daily_amount  NUMERIC(10,2) NOT NULL,
  start_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  status        TEXT NOT NULL DEFAULT 'Active',
  paid_days     INT NOT NULL DEFAULT 0,
  total_days    INT NOT NULL DEFAULT 100,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Collections
CREATE TABLE IF NOT EXISTS collections (
  id            SERIAL PRIMARY KEY,
  loan_id       INT NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  customer_id   INT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  due_amount    NUMERIC(10,2) NOT NULL,
  paid_amount   NUMERIC(10,2) NOT NULL DEFAULT 0,
  date          DATE NOT NULL DEFAULT CURRENT_DATE,
  status        TEXT NOT NULL DEFAULT 'Pending',  -- 'Paid' | 'Pending'
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- App Settings (logo + pdf config)
CREATE TABLE IF NOT EXISTS settings (
  id            SERIAL PRIMARY KEY,
  key           TEXT UNIQUE NOT NULL,
  value         TEXT,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Seed admin (password: admin123)
INSERT INTO admin (username, password)
VALUES ('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON CONFLICT DO NOTHING;

-- Seed default settings
INSERT INTO settings (key, value) VALUES
  ('company_name', 'PJ Finance'),
  ('address', ''),
  ('phone', ''),
  ('pdf_footer', 'Thank you for your payment.'),
  ('show_logo', 'true'),
  ('show_timeline', 'true'),
  ('show_summary', 'true'),
  ('logo_url', '')
ON CONFLICT (key) DO NOTHING;
