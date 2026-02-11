-- Add banking details to demo users

UPDATE users SET 
  bank_name = 'Bank Windhoek',
  branch_code = '483872',
  account_number = '8001234567',
  account_holder = 'John Doe'
WHERE id = 2;

UPDATE users SET 
  bank_name = 'First National Bank Namibia',
  branch_code = '280172',
  account_number = '62345678901',
  account_holder = 'Jane Smith'
WHERE id = 3;

UPDATE users SET 
  bank_name = 'Standard Bank Namibia',
  branch_code = '082872',
  account_number = '240567890',
  account_holder = 'Michael Johnson'
WHERE id = 4;

UPDATE users SET 
  bank_name = 'Bank Windhoek',
  branch_code = '483872',
  account_number = '8001000000',
  account_holder = 'System Administrator'
WHERE id = 1;
