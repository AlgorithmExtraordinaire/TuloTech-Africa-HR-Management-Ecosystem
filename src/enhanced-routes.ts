// TuloTech Africa HR System - Enhanced API Routes
// Super Admin, Regional Tax Calculations, and Year-End Functions

// ===== TAX CALCULATION FUNCTIONS =====

// Namibian PAYE Tax Calculator
function calculateNamibianPAYE(annualSalary: number): number {
  const brackets = [
    { min: 0, max: 50000, rate: 0, fixed: 0 },
    { min: 50001, max: 100000, rate: 0.18, fixed: 0 },
    { min: 100001, max: 300000, rate: 0.25, fixed: 9000 },
    { min: 300001, max: 500000, rate: 0.28, fixed: 59000 },
    { min: 500001, max: 800000, rate: 0.30, fixed: 115000 },
    { min: 800001, max: Infinity, rate: 0.37, fixed: 205000 }
  ]
  
  for (const bracket of brackets) {
    if (annualSalary >= bracket.min && annualSalary <= bracket.max) {
      const taxableAmount = annualSalary - bracket.min + 1
      return bracket.fixed + (taxableAmount * bracket.rate)
    }
  }
  return 0
}

// Namibian Social Security (SSC) Calculator
function calculateNamibianSSC(monthlySalary: number): { employee: number, employer: number } {
  const maxIncome = 81000
  const rate = 0.009
  const cappedSalary = Math.min(monthlySalary, maxIncome)
  
  return {
    employee: cappedSalary * rate,
    employer: cappedSalary * rate
  }
}

// South African PAYE Tax Calculator
function calculateSouthAfricanPAYE(annualSalary: number): number {
  const brackets = [
    { min: 0, max: 237100, rate: 0.18, fixed: 0 },
    { min: 237101, max: 370500, rate: 0.26, fixed: 42678 },
    { min: 370501, max: 512800, rate: 0.31, fixed: 77362 },
    { min: 512801, max: 673000, rate: 0.36, fixed: 121475 },
    { min: 673001, max: 857900, rate: 0.39, fixed: 179147 },
    { min: 857901, max: Infinity, rate: 0.41, fixed: 251258 }
  ]
  
  for (const bracket of brackets) {
    if (annualSalary >= bracket.min && annualSalary <= bracket.max) {
      const taxableAmount = annualSalary - bracket.min + 1
      return bracket.fixed + (taxableAmount * bracket.rate)
    }
  }
  return 0
}

// South African UIF Calculator
function calculateSouthAfricanUIF(monthlySalary: number): { employee: number, employer: number } {
  const maxIncome = 17712 // R17,712 per month
  const rate = 0.01
  const cappedSalary = Math.min(monthlySalary, maxIncome)
  
  return {
    employee: cappedSalary * rate,
    employer: cappedSalary * rate
  }
}

// South African SDL Calculator (Employer only)
function calculateSouthAfricanSDL(monthlySalary: number): number {
  return monthlySalary * 0.01 // 1% of gross salary
}

// Main tax calculation function
export function calculateTaxDeductions(
  monthlySalary: number,
  country: string,
  annualBonuses: number = 0
): {
  monthlyPAYE: number,
  annualPAYE: number,
  ssc_employee: number,
  ssc_employer: number,
  uif_employee: number,
  uif_employer: number,
  sdl: number,
  totalEmployeeDeductions: number,
  totalEmployerContributions: number
} {
  const annualSalary = (monthlySalary * 12) + annualBonuses
  
  if (country === 'Namibia') {
    const annualPAYE = calculateNamibianPAYE(annualSalary)
    const monthlyPAYE = annualPAYE / 12
    const ssc = calculateNamibianSSC(monthlySalary)
    
    return {
      monthlyPAYE,
      annualPAYE,
      ssc_employee: ssc.employee,
      ssc_employer: ssc.employer,
      uif_employee: 0,
      uif_employer: 0,
      sdl: 0,
      totalEmployeeDeductions: monthlyPAYE + ssc.employee,
      totalEmployerContributions: ssc.employer
    }
  } else if (country === 'South Africa') {
    const annualPAYE = calculateSouthAfricanPAYE(annualSalary)
    const monthlyPAYE = annualPAYE / 12
    const uif = calculateSouthAfricanUIF(monthlySalary)
    const sdl = calculateSouthAfricanSDL(monthlySalary)
    
    return {
      monthlyPAYE,
      annualPAYE,
      ssc_employee: 0,
      ssc_employer: 0,
      uif_employee: uif.employee,
      uif_employer: uif.employer,
      sdl,
      totalEmployeeDeductions: monthlyPAYE + uif.employee,
      totalEmployerContributions: uif.employer + sdl
    }
  }
  
  // Default (no tax)
  return {
    monthlyPAYE: 0,
    annualPAYE: 0,
    ssc_employee: 0,
    ssc_employer: 0,
    uif_employee: 0,
    uif_employer: 0,
    sdl: 0,
    totalEmployeeDeductions: 0,
    totalEmployerContributions: 0
  }
}

// ===== SUPER ADMIN API ROUTES =====
// These routes are only accessible to users with role='super_admin'

export function addSuperAdminRoutes(app: any) {
  
  // Get all companies (Super Admin only)
  app.get('/api/super-admin/companies', async (c: any) => {
    try {
      const { results } = await c.env.DB.prepare(`
        SELECT c.*, 
               COUNT(DISTINCT u.id) as employee_count,
               COUNT(DISTINCT fy.id) as financial_years
        FROM companies c
        LEFT JOIN users u ON c.id = u.company_id AND u.is_active = 1
        LEFT JOIN financial_years fy ON c.id = fy.company_id
        GROUP BY c.id
        ORDER BY c.company_type DESC, c.created_at DESC
      `).all()
      
      return c.json({ companies: results })
    } catch (error) {
      return c.json({ error: 'Failed to fetch companies' }, 500)
    }
  })
  
  // Get system statistics (Super Admin only)
  app.get('/api/super-admin/stats', async (c: any) => {
    try {
      const totalCompanies = await c.env.DB.prepare(
        'SELECT COUNT(*) as count FROM companies WHERE company_type = "company"'
      ).first()
      
      const totalEmployees = await c.env.DB.prepare(
        'SELECT COUNT(*) as count FROM users WHERE is_active = 1 AND role != "super_admin"'
      ).first()
      
      const activeFinancialYears = await c.env.DB.prepare(
        'SELECT COUNT(*) as count FROM financial_years WHERE status = "active"'
      ).first()
      
      const pendingYearEndProcesses = await c.env.DB.prepare(
        'SELECT COUNT(*) as count FROM year_end_processes WHERE status IN ("pending", "in_progress")'
      ).first()
      
      return c.json({
        stats: {
          total_companies: totalCompanies?.count || 0,
          total_employees: totalEmployees?.count || 0,
          active_financial_years: activeFinancialYears?.count || 0,
          pending_year_end_processes: pendingYearEndProcesses?.count || 0
        }
      })
    } catch (error) {
      return c.json({ error: 'Failed to fetch statistics' }, 500)
    }
  })
  
  // Create new company (Super Admin only)
  app.post('/api/super-admin/companies', async (c: any) => {
    try {
      const data = await c.req.json()
      
      const result = await c.env.DB.prepare(`
        INSERT INTO companies (
          name, organization_name, country, tax_regime, company_type,
          registration_number, address, contact_email, contact_phone,
          financial_year_end, current_financial_year
        ) VALUES (?, ?, ?, ?, 'company', ?, ?, ?, ?, ?, ?)
      `).bind(
        data.name,
        'TuloTech Africa',
        data.country || 'Namibia',
        data.tax_regime || data.country || 'Namibia',
        data.registration_number,
        data.address,
        data.contact_email,
        data.contact_phone,
        data.financial_year_end || '12-31',
        data.current_financial_year || new Date().getFullYear()
      ).run()
      
      const companyId = result.meta.last_row_id
      
      // Create initial financial year
      await c.env.DB.prepare(`
        INSERT INTO financial_years (company_id, year, start_date, end_date, status)
        VALUES (?, ?, ?, ?, 'active')
      `).bind(
        companyId,
        data.current_financial_year || new Date().getFullYear(),
        `${data.current_financial_year || new Date().getFullYear()}-01-01`,
        `${data.current_financial_year || new Date().getFullYear()}-${data.financial_year_end || '12-31'}`,
      ).run()
      
      return c.json({ success: true, id: companyId })
    } catch (error) {
      return c.json({ error: 'Failed to create company' }, 500)
    }
  })
  
  // Update company settings (Super Admin only)
  app.put('/api/super-admin/companies/:id', async (c: any) => {
    try {
      const id = c.req.param('id')
      const data = await c.req.json()
      
      await c.env.DB.prepare(`
        UPDATE companies SET
          name = ?, country = ?, tax_regime = ?, registration_number = ?,
          address = ?, contact_email = ?, contact_phone = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(
        data.name, data.country, data.tax_regime, data.registration_number,
        data.address, data.contact_email, data.contact_phone, id
      ).run()
      
      return c.json({ success: true })
    } catch (error) {
      return c.json({ error: 'Failed to update company' }, 500)
    }
  })
  
  // Get audit logs (Super Admin only)
  app.get('/api/super-admin/audit-logs', async (c: any) => {
    try {
      const companyId = c.req.query('company_id')
      const limit = parseInt(c.req.query('limit') || '100')
      
      let query = `
        SELECT al.*, u.first_name, u.last_name, u.email, c.name as company_name
        FROM audit_logs al
        JOIN users u ON al.user_id = u.id
        LEFT JOIN companies c ON al.company_id = c.id
        WHERE 1=1
      `
      const params: any[] = []
      
      if (companyId) {
        query += ' AND al.company_id = ?'
        params.push(companyId)
      }
      
      query += ' ORDER BY al.created_at DESC LIMIT ?'
      params.push(limit)
      
      const { results } = await c.env.DB.prepare(query).bind(...params).all()
      return c.json({ logs: results })
    } catch (error) {
      return c.json({ error: 'Failed to fetch audit logs' }, 500)
    }
  })
  
  // ===== TAX CALCULATION ROUTES =====
  
  // Calculate tax for payslip
  app.post('/api/tax/calculate', async (c: any) => {
    try {
      const { monthly_salary, country, annual_bonuses } = await c.req.json()
      
      const calculations = calculateTaxDeductions(
        parseFloat(monthly_salary),
        country,
        parseFloat(annual_bonuses || 0)
      )
      
      return c.json({ success: true, calculations })
    } catch (error) {
      return c.json({ error: 'Failed to calculate tax' }, 500)
    }
  })
  
  // Get tax configuration for company
  app.get('/api/tax/configuration/:companyId', async (c: any) => {
    try {
      const companyId = c.req.param('companyId')
      const year = c.req.query('year') || new Date().getFullYear()
      
      const config = await c.env.DB.prepare(`
        SELECT * FROM tax_configurations
        WHERE company_id = ? AND tax_year = ? AND is_active = 1
      `).bind(companyId, year).first()
      
      return c.json({ config })
    } catch (error) {
      return c.json({ error: 'Failed to fetch tax configuration' }, 500)
    }
  })
  
  // ===== FINANCIAL YEAR ROUTES =====
  
  // Get financial years
  app.get('/api/financial-years', async (c: any) => {
    try {
      const companyId = c.req.query('company_id')
      
      const { results } = await c.env.DB.prepare(`
        SELECT fy.*, u.first_name as closed_by_name, u.last_name as closed_by_surname
        FROM financial_years fy
        LEFT JOIN users u ON fy.closed_by = u.id
        WHERE fy.company_id = ?
        ORDER BY fy.year DESC
      `).bind(companyId).all()
      
      return c.json({ financial_years: results })
    } catch (error) {
      return c.json({ error: 'Failed to fetch financial years' }, 500)
    }
  })
  
  // Close financial year
  app.post('/api/financial-years/:id/close', async (c: any) => {
    try {
      const id = c.req.param('id')
      const { closed_by } = await c.req.json()
      const now = new Date().toISOString()
      
      await c.env.DB.prepare(`
        UPDATE financial_years SET
          status = 'closed',
          closed_date = ?,
          closed_by = ?
        WHERE id = ?
      `).bind(now, closed_by, id).run()
      
      return c.json({ success: true })
    } catch (error) {
      return c.json({ error: 'Failed to close financial year' }, 500)
    }
  })
  
  // ===== YEAR-END PROCESSES =====
  
  // Get year-end processes
  app.get('/api/year-end/processes', async (c: any) => {
    try {
      const companyId = c.req.query('company_id')
      
      const { results } = await c.env.DB.prepare(`
        SELECT yep.*, 
               fy.year as financial_year,
               u1.first_name as initiated_by_name, u1.last_name as initiated_by_surname,
               u2.first_name as completed_by_name, u2.last_name as completed_by_surname
        FROM year_end_processes yep
        JOIN financial_years fy ON yep.financial_year_id = fy.id
        JOIN users u1 ON yep.initiated_by = u1.id
        LEFT JOIN users u2 ON yep.completed_by = u2.id
        WHERE yep.company_id = ?
        ORDER BY yep.initiated_at DESC
      `).bind(companyId).all()
      
      return c.json({ processes: results })
    } catch (error) {
      return c.json({ error: 'Failed to fetch year-end processes' }, 500)
    }
  })
  
  // Initiate year-end process
  app.post('/api/year-end/processes', async (c: any) => {
    try {
      const data = await c.req.json()
      
      const result = await c.env.DB.prepare(`
        INSERT INTO year_end_processes (
          company_id, financial_year_id, process_type, initiated_by, notes
        ) VALUES (?, ?, ?, ?, ?)
      `).bind(
        data.company_id,
        data.financial_year_id,
        data.process_type,
        data.initiated_by,
        data.notes || ''
      ).run()
      
      return c.json({ success: true, id: result.meta.last_row_id })
    } catch (error) {
      return c.json({ error: 'Failed to initiate year-end process' }, 500)
    }
  })
  
  // Complete year-end process
  app.post('/api/year-end/processes/:id/complete', async (c: any) => {
    try {
      const id = c.req.param('id')
      const { completed_by, result_summary } = await c.req.json()
      const now = new Date().toISOString()
      
      await c.env.DB.prepare(`
        UPDATE year_end_processes SET
          status = 'completed',
          completed_at = ?,
          completed_by = ?,
          result_summary = ?
        WHERE id = ?
      `).bind(now, completed_by, result_summary, id).run()
      
      return c.json({ success: true })
    } catch (error) {
      return c.json({ error: 'Failed to complete year-end process' }, 500)
    }
  })
  
  // ===== LEAVE BALANCE ROUTES =====
  
  // Get leave balances
  app.get('/api/leave-balances', async (c: any) => {
    try {
      const userId = c.req.query('user_id')
      const companyId = c.req.query('company_id')
      const year = c.req.query('year') || new Date().getFullYear()
      
      let query = 'SELECT * FROM leave_balances WHERE 1=1'
      const params: any[] = []
      
      if (userId) {
        query += ' AND user_id = ?'
        params.push(userId)
      }
      if (companyId) {
        query += ' AND company_id = ?'
        params.push(companyId)
      }
      if (year) {
        query += ' AND year = ?'
        params.push(year)
      }
      
      const { results } = await c.env.DB.prepare(query).bind(...params).all()
      return c.json({ balances: results })
    } catch (error) {
      return c.json({ error: 'Failed to fetch leave balances' }, 500)
    }
  })
  
  // Rollover leave balances to new year
  app.post('/api/leave-balances/rollover', async (c: any) => {
    try {
      const { company_id, from_year, to_year, max_carryover } = await c.req.json()
      
      // Get all leave balances for from_year
      const { results } = await c.env.DB.prepare(`
        SELECT * FROM leave_balances WHERE company_id = ? AND year = ?
      `).bind(company_id, from_year).all()
      
      // Create new balances for to_year with carryover
      for (const balance of results) {
        const carryover = Math.min(
          balance.closing_balance || 0,
          max_carryover || 999999
        )
        
        await c.env.DB.prepare(`
          INSERT OR REPLACE INTO leave_balances (
            user_id, company_id, year, leave_type,
            opening_balance, accrued, taken, carried_forward, closing_balance
          ) VALUES (?, ?, ?, ?, ?, 0, 0, ?, ?)
        `).bind(
          balance.user_id,
          company_id,
          to_year,
          balance.leave_type,
          carryover,
          carryover,
          carryover
        ).run()
      }
      
      return c.json({ success: true, rolled_over: results.length })
    } catch (error) {
      return c.json({ error: 'Failed to rollover leave balances' }, 500)
    }
  })
  
  // ===== SALARY HISTORY ROUTES =====
  
  // Get salary history
  app.get('/api/salary-history', async (c: any) => {
    try {
      const userId = c.req.query('user_id')
      
      const { results } = await c.env.DB.prepare(`
        SELECT sh.*, u.first_name as approved_by_name, u.last_name as approved_by_surname
        FROM salary_history sh
        LEFT JOIN users u ON sh.approved_by = u.id
        WHERE sh.user_id = ?
        ORDER BY sh.effective_date DESC
      `).bind(userId).all()
      
      return c.json({ history: results })
    } catch (error) {
      return c.json({ error: 'Failed to fetch salary history' }, 500)
    }
  })
  
  // Add salary change
  app.post('/api/salary-history', async (c: any) => {
    try {
      const data = await c.req.json()
      
      const changePercentage = ((data.new_salary - data.old_salary) / data.old_salary) * 100
      
      const result = await c.env.DB.prepare(`
        INSERT INTO salary_history (
          user_id, company_id, effective_date, old_salary, new_salary,
          change_percentage, change_reason, approved_by, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        data.user_id, data.company_id, data.effective_date,
        data.old_salary, data.new_salary, changePercentage,
        data.change_reason, data.approved_by, data.notes
      ).run()
      
      // Update user's current salary
      await c.env.DB.prepare(`
        UPDATE users SET salary = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `).bind(data.new_salary, data.user_id).run()
      
      return c.json({ success: true, id: result.meta.last_row_id })
    } catch (error) {
      return c.json({ error: 'Failed to add salary change' }, 500)
    }
  })
}
