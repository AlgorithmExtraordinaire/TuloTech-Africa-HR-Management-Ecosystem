-- Seed Data for TuloTech Africa HR System
-- Initial setup with TuloTech Africa and Swakopmund Christian Academy

-- Insert TuloTech Africa organization with first company
INSERT OR IGNORE INTO companies (id, name, organization_name, registration_number, address, contact_email, contact_phone) VALUES 
  (1, 'Swakopmund Christian Academy', 'TuloTech Africa', 'REG-2024-001', '123 Ocean View Street, Swakopmund, Namibia', 'info@sca.edu.na', '+264 64 400 000');

-- Insert demo admin user (password: admin123)
-- Note: In production, passwords should be properly hashed
INSERT OR IGNORE INTO users (id, company_id, email, password_hash, first_name, last_name, role, employee_id, department, position, hire_date, salary, phone) VALUES 
  (1, 1, 'admin@tulotech.com', 'admin123', 'System', 'Administrator', 'admin', 'EMP001', 'Administration', 'System Administrator', '2024-01-01', 50000, '+264 81 234 5678'),
  (2, 1, 'john.doe@sca.edu.na', 'staff123', 'John', 'Doe', 'staff', 'EMP002', 'Teaching', 'Senior Teacher', '2024-01-15', 35000, '+264 81 234 5679'),
  (3, 1, 'jane.smith@sca.edu.na', 'staff123', 'Jane', 'Smith', 'staff', 'EMP003', 'Teaching', 'Teacher', '2024-02-01', 30000, '+264 81 234 5680'),
  (4, 1, 'manager@sca.edu.na', 'manager123', 'Michael', 'Johnson', 'manager', 'EMP004', 'Administration', 'HR Manager', '2024-01-10', 45000, '+264 81 234 5681');

-- Insert sample attendance records
INSERT OR IGNORE INTO attendance (user_id, company_id, date, clock_in, clock_out, status) VALUES
  (2, 1, date('now'), datetime('now', '-8 hours'), datetime('now', '-1 hour'), 'present'),
  (3, 1, date('now'), datetime('now', '-8 hours'), NULL, 'present'),
  (2, 1, date('now', '-1 day'), datetime('now', '-1 day', '+8 hours'), datetime('now', '-1 day', '+16 hours'), 'present'),
  (3, 1, date('now', '-1 day'), datetime('now', '-1 day', '+8 hours'), datetime('now', '-1 day', '+16 hours'), 'present');

-- Insert sample calendar events
INSERT OR IGNORE INTO calendar_events (company_id, title, description, event_type, start_date, end_date, is_all_day, organizer_id, color) VALUES
  (1, 'New Year Holiday', 'Public Holiday', 'holiday', '2024-01-01', '2024-01-01', 1, 1, '#EF4444'),
  (1, 'Independence Day', 'Namibia Independence Day', 'holiday', '2024-03-21', '2024-03-21', 1, 1, '#EF4444'),
  (1, 'Staff Meeting', 'Monthly staff meeting', 'meeting', datetime('now', '+2 days', '+9 hours'), datetime('now', '+2 days', '+11 hours'), 0, 4, '#3B82F6'),
  (1, 'Teacher Training Workshop', 'Professional development workshop', 'training', datetime('now', '+7 days'), datetime('now', '+8 days'), 1, 4, '#10B981');

-- Insert motivational quotes
INSERT OR IGNORE INTO motivational_quotes (quote, author, category) VALUES
  ('Success is not final, failure is not fatal: it is the courage to continue that counts.', 'Winston Churchill', 'Motivation'),
  ('The only way to do great work is to love what you do.', 'Steve Jobs', 'Passion'),
  ('Believe you can and you''re halfway there.', 'Theodore Roosevelt', 'Confidence'),
  ('Excellence is not a destination; it is a continuous journey that never ends.', 'Brian Tracy', 'Excellence'),
  ('Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work.', 'Steve Jobs', 'Satisfaction'),
  ('Education is the most powerful weapon which you can use to change the world.', 'Nelson Mandela', 'Education'),
  ('The beautiful thing about learning is that no one can take it away from you.', 'B.B. King', 'Learning'),
  ('Success is the sum of small efforts repeated day in and day out.', 'Robert Collier', 'Persistence'),
  ('Don''t watch the clock; do what it does. Keep going.', 'Sam Levenson', 'Determination'),
  ('The future belongs to those who believe in the beauty of their dreams.', 'Eleanor Roosevelt', 'Dreams');

-- Insert sample announcement
INSERT OR IGNORE INTO announcements (company_id, title, content, category, priority, posted_by) VALUES
  (1, 'Welcome to TuloTech HR System', 'Welcome to our new comprehensive HR Management System! This system provides attendance tracking, payslip management, calendar, communications, and much more. Please explore all the features and contact IT support if you need assistance.', 'General', 'high', 1);

-- Insert sample policy document (placeholder)
INSERT OR IGNORE INTO policy_documents (company_id, title, description, category, file_content, uploaded_by) VALUES
  (1, 'Employee Handbook', 'Complete guide to company policies and procedures', 'Policies', 'PLACEHOLDER_PDF_CONTENT', 1),
  (1, 'Code of Conduct', 'Professional code of conduct for all employees', 'Policies', 'PLACEHOLDER_PDF_CONTENT', 1),
  (1, 'Leave Policy', 'Annual leave and sick leave policy guidelines', 'Leave', 'PLACEHOLDER_PDF_CONTENT', 1);
