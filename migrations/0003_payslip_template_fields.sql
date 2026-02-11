-- Enhanced Payslip Schema - Support for Professional Template
-- Adds banking details, medical aid, and other custom fields

-- Add banking details to users table
ALTER TABLE users ADD COLUMN bank_name TEXT;
ALTER TABLE users ADD COLUMN branch_code TEXT;
ALTER TABLE users ADD COLUMN account_number TEXT;
ALTER TABLE users ADD COLUMN account_holder TEXT;

-- Add additional deduction fields to payslips table
ALTER TABLE payslips ADD COLUMN medical_aid_deduction REAL DEFAULT 0;
ALTER TABLE payslips ADD COLUMN other_deductions_detail TEXT; -- JSON for itemized other deductions

-- Add employee designation/position reference
-- (already exists as 'position' in users table)

-- Payslip Template Configuration
CREATE TABLE IF NOT EXISTS payslip_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  template_name TEXT NOT NULL,
  logo_url TEXT,
  header_color TEXT DEFAULT '#8B1A1A',
  show_company_motto INTEGER DEFAULT 1,
  company_motto TEXT DEFAULT 'By His Power For His Glory',
  show_registration TEXT DEFAULT 'CC/99/1262',
  show_banking_details INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Insert default template for Swakopmund Christian Academy
INSERT OR IGNORE INTO payslip_templates (
  company_id, template_name, company_motto, show_registration
) VALUES (
  (SELECT id FROM companies WHERE name LIKE '%Swakopmund%'),
  'SCA Professional',
  'By His Power For His Glory',
  'CC/99/1262'
);

CREATE INDEX IF NOT EXISTS idx_payslip_templates_company ON payslip_templates(company_id);
