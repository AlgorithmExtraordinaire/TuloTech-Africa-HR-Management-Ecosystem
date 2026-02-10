-- TuloTech Africa HR System - Enhanced Schema with Regional Laws and Year-End Functions
-- Migration: Add Super Admin, Regional Tax Settings, and Financial Year Management

-- Add super_admin role and regional settings to companies table
ALTER TABLE companies ADD COLUMN country TEXT DEFAULT 'Namibia' CHECK(country IN ('Namibia', 'South Africa', 'Other'));
ALTER TABLE companies ADD COLUMN tax_regime TEXT DEFAULT 'Namibia' CHECK(tax_regime IN ('Namibia', 'South Africa'));
ALTER TABLE companies ADD COLUMN financial_year_end TEXT DEFAULT '12-31'; -- Format: MM-DD
ALTER TABLE companies ADD COLUMN current_financial_year INTEGER DEFAULT 2024;
ALTER TABLE companies ADD COLUMN company_type TEXT DEFAULT 'company' CHECK(company_type IN ('super_admin', 'company'));

-- Update users table to support super_admin role
-- Note: SQLite doesn't support ALTER COLUMN with CHECK, so we'll handle this in application logic
-- Users with role='super_admin' have full system access

-- Financial Year Cycles Table
CREATE TABLE IF NOT EXISTS financial_years (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  year INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK(status IN ('planning', 'active', 'closed', 'archived')),
  closed_date DATE,
  closed_by INTEGER,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (closed_by) REFERENCES users(id),
  UNIQUE(company_id, year)
);

-- Tax Configuration Table (Namibian and South African)
CREATE TABLE IF NOT EXISTS tax_configurations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  country TEXT NOT NULL,
  tax_year INTEGER NOT NULL,
  
  -- Income Tax Brackets (JSON stored as TEXT)
  income_tax_brackets TEXT, -- JSON: [{min: 0, max: 50000, rate: 0, fixed: 0}, ...]
  
  -- Social Security / UIF Rates
  social_security_rate REAL DEFAULT 0,
  social_security_employer_rate REAL DEFAULT 0,
  social_security_max_income REAL DEFAULT 0,
  
  -- Additional deductions (South Africa specific)
  uif_rate REAL DEFAULT 0,
  uif_employer_rate REAL DEFAULT 0,
  uif_max_income REAL DEFAULT 0,
  sdl_rate REAL DEFAULT 0, -- Skills Development Levy
  
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  UNIQUE(company_id, tax_year, country)
);

-- Year-End Processes Table
CREATE TABLE IF NOT EXISTS year_end_processes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  financial_year_id INTEGER NOT NULL,
  process_type TEXT NOT NULL CHECK(process_type IN ('tax_submission', 'annual_leave_rollover', 'performance_review', 'salary_review', 'audit', 'archive')),
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed', 'failed')),
  initiated_by INTEGER NOT NULL,
  initiated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  completed_by INTEGER,
  result_summary TEXT,
  notes TEXT,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (financial_year_id) REFERENCES financial_years(id),
  FOREIGN KEY (initiated_by) REFERENCES users(id),
  FOREIGN KEY (completed_by) REFERENCES users(id)
);

-- Annual Tax Submissions Table
CREATE TABLE IF NOT EXISTS annual_tax_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  tax_year INTEGER NOT NULL,
  country TEXT NOT NULL,
  
  -- Employee tax summary
  total_employees INTEGER,
  total_gross_income REAL,
  total_paye_deducted REAL,
  total_social_security REAL,
  total_uif REAL,
  total_sdl REAL,
  
  -- Submission details
  submission_date DATE,
  submitted_by INTEGER,
  reference_number TEXT,
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'submitted', 'accepted', 'rejected')),
  
  -- File attachments (stored as base64 or URLs)
  documents TEXT, -- JSON array of document references
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (submitted_by) REFERENCES users(id)
);

-- Employee Tax Certificates (IRP5 for South Africa, Tax Certificate for Namibia)
CREATE TABLE IF NOT EXISTS employee_tax_certificates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  company_id INTEGER NOT NULL,
  tax_year INTEGER NOT NULL,
  country TEXT NOT NULL,
  
  -- Annual summary
  total_remuneration REAL,
  total_paye REAL,
  total_social_security REAL,
  total_uif REAL,
  total_pension REAL,
  total_medical_aid REAL,
  taxable_income REAL,
  
  -- Certificate details
  certificate_number TEXT,
  issue_date DATE,
  issued_by INTEGER,
  
  -- Document
  document_content TEXT, -- Base64 encoded PDF or reference
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (issued_by) REFERENCES users(id),
  UNIQUE(user_id, company_id, tax_year)
);

-- Leave Balance Tracking (for year-end rollover)
CREATE TABLE IF NOT EXISTS leave_balances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  company_id INTEGER NOT NULL,
  year INTEGER NOT NULL,
  leave_type TEXT NOT NULL,
  opening_balance REAL DEFAULT 0,
  accrued REAL DEFAULT 0,
  taken REAL DEFAULT 0,
  carried_forward REAL DEFAULT 0,
  expired REAL DEFAULT 0,
  closing_balance REAL DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  UNIQUE(user_id, company_id, year, leave_type)
);

-- Salary History (for tracking changes over years)
CREATE TABLE IF NOT EXISTS salary_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  company_id INTEGER NOT NULL,
  effective_date DATE NOT NULL,
  old_salary REAL,
  new_salary REAL,
  change_percentage REAL,
  change_reason TEXT,
  approved_by INTEGER,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- Audit Logs for Super Admin activities
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  company_id INTEGER,
  action_type TEXT NOT NULL,
  table_name TEXT,
  record_id INTEGER,
  action_description TEXT,
  old_values TEXT, -- JSON
  new_values TEXT, -- JSON
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_financial_years_company ON financial_years(company_id);
CREATE INDEX IF NOT EXISTS idx_tax_config_company_year ON tax_configurations(company_id, tax_year);
CREATE INDEX IF NOT EXISTS idx_year_end_processes_company ON year_end_processes(company_id);
CREATE INDEX IF NOT EXISTS idx_tax_submissions_company_year ON annual_tax_submissions(company_id, tax_year);
CREATE INDEX IF NOT EXISTS idx_tax_certificates_user_year ON employee_tax_certificates(user_id, tax_year);
CREATE INDEX IF NOT EXISTS idx_leave_balances_user_year ON leave_balances(user_id, year);
CREATE INDEX IF NOT EXISTS idx_salary_history_user ON salary_history(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_company ON audit_logs(company_id);
