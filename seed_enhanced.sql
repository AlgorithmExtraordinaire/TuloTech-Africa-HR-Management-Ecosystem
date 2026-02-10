-- Enhanced Seed Data: Super Admin, Regional Tax Settings, and Year-End Setup

-- Update TuloTech Africa to Super Admin organization
UPDATE companies SET 
  company_type = 'super_admin',
  country = 'Namibia',
  tax_regime = 'Namibia',
  name = 'TuloTech Africa',
  organization_name = 'TuloTech Africa'
WHERE id = 1;

-- Update Swakopmund Christian Academy to regular company (secondary admin)
UPDATE companies SET 
  company_type = 'company',
  country = 'Namibia',
  tax_regime = 'Namibia',
  financial_year_end = '12-31',
  current_financial_year = 2024
WHERE name = 'Swakopmund Christian Academy';

-- Update main admin user to super_admin role (we'll handle this in application logic)
-- SQLite CHECK constraint doesn't allow super_admin, so we keep as 'admin'
-- but mark company_type as 'super_admin' for permissions
UPDATE users SET role = 'admin' WHERE id = 1;

-- Create TuloTech Africa Financial Year
INSERT OR IGNORE INTO financial_years (id, company_id, year, start_date, end_date, status) VALUES
  (1, 1, 2024, '2024-01-01', '2024-12-31', 'active');

-- Create Swakopmund Christian Academy Financial Year
INSERT OR IGNORE INTO financial_years (id, company_id, year, start_date, end_date, status) VALUES
  (2, (SELECT id FROM companies WHERE name = 'Swakopmund Christian Academy'), 2024, '2024-01-01', '2024-12-31', 'active');

-- ===== NAMIBIAN TAX CONFIGURATION (2024) =====
-- Source: Namibia Inland Revenue (based on current tax brackets)
-- PAYE Tax Brackets for 2024:
-- N$0 - N$50,000: 0%
-- N$50,001 - N$100,000: 18% of amount above N$50,000
-- N$100,001 - N$300,000: N$9,000 + 25% of amount above N$100,000
-- N$300,001 - N$500,000: N$59,000 + 28% of amount above N$300,000
-- N$500,001 - N$800,000: N$115,000 + 30% of amount above N$500,000
-- Above N$800,000: N$205,000 + 37% of amount above N$800,000

INSERT OR IGNORE INTO tax_configurations (
  company_id, country, tax_year, income_tax_brackets,
  social_security_rate, social_security_employer_rate, social_security_max_income
) VALUES (
  (SELECT id FROM companies WHERE name = 'Swakopmund Christian Academy'),
  'Namibia',
  2024,
  '[
    {"min": 0, "max": 50000, "rate": 0, "fixed": 0},
    {"min": 50001, "max": 100000, "rate": 0.18, "fixed": 0},
    {"min": 100001, "max": 300000, "rate": 0.25, "fixed": 9000},
    {"min": 300001, "max": 500000, "rate": 0.28, "fixed": 59000},
    {"min": 500001, "max": 800000, "rate": 0.30, "fixed": 115000},
    {"min": 800001, "max": 999999999, "rate": 0.37, "fixed": 205000}
  ]',
  0.009, -- Employee SSC 0.9%
  0.009, -- Employer SSC 0.9%
  81000  -- Maximum monthly income for SSC (N$81,000)
);

-- ===== SOUTH AFRICAN TAX CONFIGURATION (2024/2025) =====
-- Source: SARS Tax Tables
-- PAYE Tax Brackets for 2024/2025:
-- R0 - R237,100: 18% of taxable income
-- R237,101 - R370,500: R42,678 + 26% of amount above R237,100
-- R370,501 - R512,800: R77,362 + 31% of amount above R370,500
-- R512,801 - R673,000: R121,475 + 36% of amount above R512,800
-- R673,001 - R857,900: R179,147 + 39% of amount above R673,000
-- Above R857,900: R251,258 + 41% of amount above R857,900

-- Create a South African demo company for testing
INSERT OR IGNORE INTO companies (
  id, name, organization_name, country, tax_regime, 
  company_type, registration_number, address, contact_email, contact_phone
) VALUES (
  2, 
  'Cape Town International School', 
  'TuloTech Africa',
  'South Africa',
  'South Africa',
  'company',
  'ZA-2024-001',
  '123 Table Mountain Road, Cape Town, South Africa',
  'info@ctis.co.za',
  '+27 21 555 0000'
);

INSERT OR IGNORE INTO tax_configurations (
  company_id, country, tax_year, income_tax_brackets,
  social_security_rate, social_security_employer_rate, social_security_max_income,
  uif_rate, uif_employer_rate, uif_max_income, sdl_rate
) VALUES (
  2,
  'South Africa',
  2024,
  '[
    {"min": 0, "max": 237100, "rate": 0.18, "fixed": 0},
    {"min": 237101, "max": 370500, "rate": 0.26, "fixed": 42678},
    {"min": 370501, "max": 512800, "rate": 0.31, "fixed": 77362},
    {"min": 512801, "max": 673000, "rate": 0.36, "fixed": 121475},
    {"min": 673001, "max": 857900, "rate": 0.39, "fixed": 179147},
    {"min": 857901, "max": 999999999, "rate": 0.41, "fixed": 251258}
  ]',
  0, -- South Africa doesn't use SSC like Namibia
  0,
  0,
  0.01, -- UIF Employee 1%
  0.01, -- UIF Employer 1%
  177120, -- UIF max annual income (R17,712/month * 12)
  0.01  -- SDL 1% on payroll
);

-- Create financial year for South African company
INSERT OR IGNORE INTO financial_years (id, company_id, year, start_date, end_date, status) VALUES
  (3, 2, 2024, '2024-01-01', '2024-12-31', 'active');

-- Sample South African staff member
INSERT OR IGNORE INTO users (
  id, company_id, email, password_hash, first_name, last_name, role, 
  employee_id, department, position, hire_date, salary, phone
) VALUES (
  5, 2, 'admin@ctis.co.za', 'admin123', 'Admin', 'User', 'admin',
  'CTIS001', 'Administration', 'Administrator', '2024-01-01', 45000, '+27 82 555 0001'
);

-- Initialize leave balances for current year
INSERT OR IGNORE INTO leave_balances (user_id, company_id, year, leave_type, opening_balance, accrued, closing_balance) VALUES
  (2, 1, 2024, 'annual', 0, 15, 15),
  (3, 1, 2024, 'annual', 0, 15, 15),
  (4, 1, 2024, 'annual', 0, 20, 20);

-- Sample audit log entries
INSERT OR IGNORE INTO audit_logs (user_id, company_id, action_type, action_description) VALUES
  (1, 1, 'system_setup', 'TuloTech Africa HR System initialized with regional tax settings'),
  (1, 1, 'company_created', 'Swakopmund Christian Academy created as subsidiary company'),
  (1, 2, 'company_created', 'Cape Town International School created as subsidiary company');
