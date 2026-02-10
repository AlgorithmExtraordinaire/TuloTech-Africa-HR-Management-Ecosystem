import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { renderer } from './renderer'
import { addSuperAdminRoutes, calculateTaxDeductions } from './enhanced-routes'
import type { D1Database } from '@cloudflare/workers-types'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// Serve static files
app.use('/static/*', serveStatic({ root: './' }))

// Use renderer middleware
app.use(renderer)

// Enable CORS for all API routes
app.use('/api/*', cors())

// Add enhanced super admin routes
addSuperAdminRoutes(app)

// Helper function to get current user from session (simplified - in production use JWT)
async function getCurrentUser(c: any, email: string) {
  const result = await c.env.DB.prepare(
    'SELECT * FROM users WHERE email = ? AND is_active = 1'
  ).bind(email).first()
  return result
}

// ===== AUTHENTICATION ROUTES =====
app.post('/api/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json()
    
    const user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE email = ? AND password_hash = ? AND is_active = 1'
    ).bind(email, password).first()
    
    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }
    
    // Get company info
    const company = await c.env.DB.prepare(
      'SELECT * FROM companies WHERE id = ?'
    ).bind(user.company_id).first()
    
    return c.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        company_id: user.company_id,
        company_name: company?.name,
        organization_name: company?.organization_name,
        employee_id: user.employee_id,
        department: user.department,
        position: user.position
      }
    })
  } catch (error) {
    return c.json({ error: 'Login failed' }, 500)
  }
})

// ===== COMPANIES ROUTES =====
app.get('/api/companies', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM companies ORDER BY created_at DESC'
    ).all()
    return c.json({ companies: results })
  } catch (error) {
    return c.json({ error: 'Failed to fetch companies' }, 500)
  }
})

app.post('/api/companies', async (c) => {
  try {
    const data = await c.req.json()
    const result = await c.env.DB.prepare(`
      INSERT INTO companies (name, organization_name, registration_number, address, contact_email, contact_phone)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      data.name,
      data.organization_name || 'TuloTech Africa',
      data.registration_number,
      data.address,
      data.contact_email,
      data.contact_phone
    ).run()
    
    return c.json({ success: true, id: result.meta.last_row_id })
  } catch (error) {
    return c.json({ error: 'Failed to create company' }, 500)
  }
})

// ===== USERS/STAFF ROUTES =====
app.get('/api/users', async (c) => {
  try {
    const companyId = c.req.query('company_id')
    const role = c.req.query('role')
    
    let query = 'SELECT u.*, c.name as company_name FROM users u LEFT JOIN companies c ON u.company_id = c.id WHERE 1=1'
    const params: any[] = []
    
    if (companyId) {
      query += ' AND u.company_id = ?'
      params.push(companyId)
    }
    
    if (role) {
      query += ' AND u.role = ?'
      params.push(role)
    }
    
    query += ' ORDER BY u.created_at DESC'
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all()
    return c.json({ users: results })
  } catch (error) {
    return c.json({ error: 'Failed to fetch users' }, 500)
  }
})

app.get('/api/users/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const user = await c.env.DB.prepare(
      'SELECT u.*, c.name as company_name FROM users u LEFT JOIN companies c ON u.company_id = c.id WHERE u.id = ?'
    ).bind(id).first()
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    return c.json({ user })
  } catch (error) {
    return c.json({ error: 'Failed to fetch user' }, 500)
  }
})

app.post('/api/users', async (c) => {
  try {
    const data = await c.req.json()
    const result = await c.env.DB.prepare(`
      INSERT INTO users (company_id, email, password_hash, first_name, last_name, role, employee_id, department, position, hire_date, salary, phone, address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.company_id,
      data.email,
      data.password || 'staff123',
      data.first_name,
      data.last_name,
      data.role || 'staff',
      data.employee_id,
      data.department,
      data.position,
      data.hire_date,
      data.salary,
      data.phone,
      data.address
    ).run()
    
    return c.json({ success: true, id: result.meta.last_row_id })
  } catch (error) {
    return c.json({ error: 'Failed to create user' }, 500)
  }
})

app.put('/api/users/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const data = await c.req.json()
    
    await c.env.DB.prepare(`
      UPDATE users SET 
        first_name = ?, last_name = ?, department = ?, position = ?, 
        salary = ?, phone = ?, address = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      data.first_name,
      data.last_name,
      data.department,
      data.position,
      data.salary,
      data.phone,
      data.address,
      id
    ).run()
    
    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Failed to update user' }, 500)
  }
})

// ===== ATTENDANCE ROUTES =====
app.get('/api/attendance', async (c) => {
  try {
    const userId = c.req.query('user_id')
    const companyId = c.req.query('company_id')
    const date = c.req.query('date')
    const month = c.req.query('month')
    
    let query = `
      SELECT a.*, u.first_name, u.last_name, u.employee_id, u.department 
      FROM attendance a 
      JOIN users u ON a.user_id = u.id 
      WHERE 1=1
    `
    const params: any[] = []
    
    if (userId) {
      query += ' AND a.user_id = ?'
      params.push(userId)
    }
    
    if (companyId) {
      query += ' AND a.company_id = ?'
      params.push(companyId)
    }
    
    if (date) {
      query += ' AND a.date = ?'
      params.push(date)
    }
    
    if (month) {
      query += ' AND strftime("%Y-%m", a.date) = ?'
      params.push(month)
    }
    
    query += ' ORDER BY a.date DESC, a.clock_in DESC'
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all()
    return c.json({ attendance: results })
  } catch (error) {
    return c.json({ error: 'Failed to fetch attendance' }, 500)
  }
})

app.post('/api/attendance/clock-in', async (c) => {
  try {
    const { user_id, company_id } = await c.req.json()
    const today = new Date().toISOString().split('T')[0]
    
    // Check if already clocked in today
    const existing = await c.env.DB.prepare(
      'SELECT * FROM attendance WHERE user_id = ? AND date = ?'
    ).bind(user_id, today).first()
    
    if (existing) {
      return c.json({ error: 'Already clocked in today' }, 400)
    }
    
    const now = new Date().toISOString()
    const result = await c.env.DB.prepare(`
      INSERT INTO attendance (user_id, company_id, date, clock_in, status)
      VALUES (?, ?, ?, ?, 'present')
    `).bind(user_id, company_id, today, now).run()
    
    return c.json({ success: true, id: result.meta.last_row_id, clock_in: now })
  } catch (error) {
    return c.json({ error: 'Failed to clock in' }, 500)
  }
})

app.post('/api/attendance/clock-out', async (c) => {
  try {
    const { user_id } = await c.req.json()
    const today = new Date().toISOString().split('T')[0]
    const now = new Date().toISOString()
    
    const result = await c.env.DB.prepare(`
      UPDATE attendance SET clock_out = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND date = ?
    `).bind(now, user_id, today).run()
    
    if (result.meta.changes === 0) {
      return c.json({ error: 'No clock-in record found for today' }, 400)
    }
    
    return c.json({ success: true, clock_out: now })
  } catch (error) {
    return c.json({ error: 'Failed to clock out' }, 500)
  }
})

app.post('/api/attendance', async (c) => {
  try {
    const data = await c.req.json()
    const result = await c.env.DB.prepare(`
      INSERT INTO attendance (user_id, company_id, date, clock_in, clock_out, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.user_id,
      data.company_id,
      data.date,
      data.clock_in,
      data.clock_out,
      data.status,
      data.notes
    ).run()
    
    return c.json({ success: true, id: result.meta.last_row_id })
  } catch (error) {
    return c.json({ error: 'Failed to create attendance record' }, 500)
  }
})

// ===== PAYSLIPS ROUTES =====
app.get('/api/payslips', async (c) => {
  try {
    const userId = c.req.query('user_id')
    const companyId = c.req.query('company_id')
    const year = c.req.query('year')
    const month = c.req.query('month')
    
    let query = `
      SELECT p.*, u.first_name, u.last_name, u.employee_id, u.department, u.position
      FROM payslips p
      JOIN users u ON p.user_id = u.id
      WHERE 1=1
    `
    const params: any[] = []
    
    if (userId) {
      query += ' AND p.user_id = ?'
      params.push(userId)
    }
    
    if (companyId) {
      query += ' AND p.company_id = ?'
      params.push(companyId)
    }
    
    if (year) {
      query += ' AND p.year = ?'
      params.push(year)
    }
    
    if (month) {
      query += ' AND p.month = ?'
      params.push(month)
    }
    
    query += ' ORDER BY p.year DESC, p.month DESC'
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all()
    return c.json({ payslips: results })
  } catch (error) {
    return c.json({ error: 'Failed to fetch payslips' }, 500)
  }
})

app.get('/api/payslips/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const payslip = await c.env.DB.prepare(`
      SELECT p.*, u.first_name, u.last_name, u.employee_id, u.department, u.position, u.phone, u.address,
             c.name as company_name, c.organization_name, c.address as company_address, c.contact_email, c.contact_phone
      FROM payslips p
      JOIN users u ON p.user_id = u.id
      JOIN companies c ON p.company_id = c.id
      WHERE p.id = ?
    `).bind(id).first()
    
    if (!payslip) {
      return c.json({ error: 'Payslip not found' }, 404)
    }
    
    return c.json({ payslip })
  } catch (error) {
    return c.json({ error: 'Failed to fetch payslip' }, 500)
  }
})

app.post('/api/payslips', async (c) => {
  try {
    const data = await c.req.json()
    
    // Get company info for tax calculations
    const company = await c.env.DB.prepare(
      'SELECT country FROM companies WHERE id = ?'
    ).bind(data.company_id).first()
    
    const country = company?.country || 'Namibia'
    
    // Calculate gross salary
    const gross_salary = parseFloat(data.basic_salary) + 
                        parseFloat(data.allowances || 0) + 
                        parseFloat(data.bonuses || 0) +
                        parseFloat(data.overtime_pay || 0)
    
    // Auto-calculate tax deductions if not provided
    let tax_deduction = parseFloat(data.tax_deduction || 0)
    let ssc_deduction = 0
    let uif_deduction = 0
    
    if (data.auto_calculate_tax) {
      const taxCalc = calculateTaxDeductions(
        parseFloat(data.basic_salary),
        country,
        parseFloat(data.bonuses || 0)
      )
      
      tax_deduction = taxCalc.monthlyPAYE
      
      if (country === 'Namibia') {
        ssc_deduction = taxCalc.ssc_employee
      } else if (country === 'South Africa') {
        uif_deduction = taxCalc.uif_employee
      }
    }
    
    // Calculate total deductions
    const total_deductions = tax_deduction +
                            ssc_deduction +
                            uif_deduction +
                            parseFloat(data.insurance_deduction || 0) +
                            parseFloat(data.pension_deduction || 0) +
                            parseFloat(data.other_deductions || 0)
    
    // Calculate net salary
    const net_salary = gross_salary - total_deductions
    
    const result = await c.env.DB.prepare(`
      INSERT INTO payslips (
        user_id, company_id, month, year, basic_salary, allowances, bonuses, 
        overtime_hours, overtime_pay, gross_salary, tax_deduction, insurance_deduction,
        pension_deduction, other_deductions, total_deductions, net_salary, 
        payment_date, payment_method, bank_account, notes, generated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.user_id,
      data.company_id,
      data.month,
      data.year,
      data.basic_salary,
      data.allowances || 0,
      data.bonuses || 0,
      data.overtime_hours || 0,
      data.overtime_pay || 0,
      gross_salary,
      tax_deduction,
      data.insurance_deduction || 0,
      data.pension_deduction || 0,
      data.other_deductions || 0,
      total_deductions,
      net_salary,
      data.payment_date,
      data.payment_method,
      data.bank_account,
      data.notes,
      data.generated_by
    ).run()
    
    return c.json({ 
      success: true, 
      id: result.meta.last_row_id,
      gross_salary,
      tax_deduction,
      ssc_deduction,
      uif_deduction,
      total_deductions,
      net_salary
    })
  } catch (error) {
    return c.json({ error: 'Failed to create payslip' }, 500)
  }
})

// ===== LEAVE REQUESTS ROUTES =====
app.get('/api/leave-requests', async (c) => {
  try {
    const userId = c.req.query('user_id')
    const companyId = c.req.query('company_id')
    const status = c.req.query('status')
    
    let query = `
      SELECT lr.*, u.first_name, u.last_name, u.employee_id, u.department,
             approver.first_name as approver_first_name, approver.last_name as approver_last_name
      FROM leave_requests lr
      JOIN users u ON lr.user_id = u.id
      LEFT JOIN users approver ON lr.approved_by = approver.id
      WHERE 1=1
    `
    const params: any[] = []
    
    if (userId) {
      query += ' AND lr.user_id = ?'
      params.push(userId)
    }
    
    if (companyId) {
      query += ' AND lr.company_id = ?'
      params.push(companyId)
    }
    
    if (status) {
      query += ' AND lr.status = ?'
      params.push(status)
    }
    
    query += ' ORDER BY lr.created_at DESC'
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all()
    return c.json({ leave_requests: results })
  } catch (error) {
    return c.json({ error: 'Failed to fetch leave requests' }, 500)
  }
})

app.post('/api/leave-requests', async (c) => {
  try {
    const data = await c.req.json()
    
    // Calculate days count
    const start = new Date(data.start_date)
    const end = new Date(data.end_date)
    const days_count = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    
    const result = await c.env.DB.prepare(`
      INSERT INTO leave_requests (user_id, company_id, leave_type, start_date, end_date, days_count, reason)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.user_id,
      data.company_id,
      data.leave_type,
      data.start_date,
      data.end_date,
      days_count,
      data.reason
    ).run()
    
    return c.json({ success: true, id: result.meta.last_row_id, days_count })
  } catch (error) {
    return c.json({ error: 'Failed to create leave request' }, 500)
  }
})

app.put('/api/leave-requests/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const data = await c.req.json()
    const now = new Date().toISOString()
    
    await c.env.DB.prepare(`
      UPDATE leave_requests SET 
        status = ?, approved_by = ?, approved_at = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(data.status, data.approved_by, now, data.notes, id).run()
    
    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Failed to update leave request' }, 500)
  }
})

// ===== CALENDAR EVENTS ROUTES =====
app.get('/api/calendar-events', async (c) => {
  try {
    const companyId = c.req.query('company_id')
    const month = c.req.query('month')
    
    let query = `
      SELECT ce.*, u.first_name as organizer_first_name, u.last_name as organizer_last_name
      FROM calendar_events ce
      LEFT JOIN users u ON ce.organizer_id = u.id
      WHERE 1=1
    `
    const params: any[] = []
    
    if (companyId) {
      query += ' AND ce.company_id = ?'
      params.push(companyId)
    }
    
    if (month) {
      query += ' AND strftime("%Y-%m", ce.start_date) = ?'
      params.push(month)
    }
    
    query += ' ORDER BY ce.start_date ASC'
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all()
    return c.json({ events: results })
  } catch (error) {
    return c.json({ error: 'Failed to fetch calendar events' }, 500)
  }
})

app.post('/api/calendar-events', async (c) => {
  try {
    const data = await c.req.json()
    const result = await c.env.DB.prepare(`
      INSERT INTO calendar_events (
        company_id, title, description, event_type, start_date, end_date, 
        is_all_day, location, organizer_id, is_public, color
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.company_id,
      data.title,
      data.description,
      data.event_type,
      data.start_date,
      data.end_date,
      data.is_all_day ? 1 : 0,
      data.location,
      data.organizer_id,
      data.is_public !== false ? 1 : 0,
      data.color || '#3B82F6'
    ).run()
    
    return c.json({ success: true, id: result.meta.last_row_id })
  } catch (error) {
    return c.json({ error: 'Failed to create calendar event' }, 500)
  }
})

app.delete('/api/calendar-events/:id', async (c) => {
  try {
    const id = c.req.param('id')
    await c.env.DB.prepare('DELETE FROM calendar_events WHERE id = ?').bind(id).run()
    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Failed to delete calendar event' }, 500)
  }
})

// ===== MESSAGES/COMMUNICATIONS ROUTES =====
app.get('/api/messages', async (c) => {
  try {
    const userId = c.req.query('user_id')
    const companyId = c.req.query('company_id')
    const isAnnouncement = c.req.query('announcement')
    
    let query = `
      SELECT m.*, 
             sender.first_name as sender_first_name, sender.last_name as sender_last_name,
             recipient.first_name as recipient_first_name, recipient.last_name as recipient_last_name
      FROM messages m
      JOIN users sender ON m.sender_id = sender.id
      LEFT JOIN users recipient ON m.recipient_id = recipient.id
      WHERE 1=1
    `
    const params: any[] = []
    
    if (companyId) {
      query += ' AND m.company_id = ?'
      params.push(companyId)
    }
    
    if (isAnnouncement === 'true') {
      query += ' AND m.is_announcement = 1'
    } else if (userId) {
      query += ' AND (m.recipient_id = ? OR m.sender_id = ? OR m.is_announcement = 1)'
      params.push(userId, userId)
    }
    
    query += ' ORDER BY m.created_at DESC'
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all()
    return c.json({ messages: results })
  } catch (error) {
    return c.json({ error: 'Failed to fetch messages' }, 500)
  }
})

app.post('/api/messages', async (c) => {
  try {
    const data = await c.req.json()
    const result = await c.env.DB.prepare(`
      INSERT INTO messages (
        company_id, sender_id, recipient_id, subject, message, 
        is_announcement, priority
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.company_id,
      data.sender_id,
      data.recipient_id || null,
      data.subject,
      data.message,
      data.is_announcement ? 1 : 0,
      data.priority || 'normal'
    ).run()
    
    return c.json({ success: true, id: result.meta.last_row_id })
  } catch (error) {
    return c.json({ error: 'Failed to send message' }, 500)
  }
})

app.put('/api/messages/:id/read', async (c) => {
  try {
    const id = c.req.param('id')
    const now = new Date().toISOString()
    
    await c.env.DB.prepare(`
      UPDATE messages SET is_read = 1, read_at = ? WHERE id = ?
    `).bind(now, id).run()
    
    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Failed to mark message as read' }, 500)
  }
})

// ===== ANNOUNCEMENTS ROUTES =====
app.get('/api/announcements', async (c) => {
  try {
    const companyId = c.req.query('company_id')
    
    let query = `
      SELECT a.*, u.first_name, u.last_name
      FROM announcements a
      JOIN users u ON a.posted_by = u.id
      WHERE a.is_active = 1
    `
    const params: any[] = []
    
    if (companyId) {
      query += ' AND a.company_id = ?'
      params.push(companyId)
    }
    
    query += ' AND (a.expires_at IS NULL OR a.expires_at > datetime("now"))'
    query += ' ORDER BY a.priority DESC, a.created_at DESC'
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all()
    return c.json({ announcements: results })
  } catch (error) {
    return c.json({ error: 'Failed to fetch announcements' }, 500)
  }
})

app.post('/api/announcements', async (c) => {
  try {
    const data = await c.req.json()
    const result = await c.env.DB.prepare(`
      INSERT INTO announcements (company_id, title, content, category, priority, posted_by, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.company_id,
      data.title,
      data.content,
      data.category,
      data.priority || 'normal',
      data.posted_by,
      data.expires_at || null
    ).run()
    
    return c.json({ success: true, id: result.meta.last_row_id })
  } catch (error) {
    return c.json({ error: 'Failed to create announcement' }, 500)
  }
})

// ===== POLICY DOCUMENTS ROUTES =====
app.get('/api/policy-documents', async (c) => {
  try {
    const companyId = c.req.query('company_id')
    
    let query = `
      SELECT pd.id, pd.company_id, pd.title, pd.description, pd.category, 
             pd.file_type, pd.file_size, pd.version, pd.is_active, pd.created_at,
             u.first_name, u.last_name
      FROM policy_documents pd
      LEFT JOIN users u ON pd.uploaded_by = u.id
      WHERE pd.is_active = 1
    `
    const params: any[] = []
    
    if (companyId) {
      query += ' AND pd.company_id = ?'
      params.push(companyId)
    }
    
    query += ' ORDER BY pd.created_at DESC'
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all()
    return c.json({ documents: results })
  } catch (error) {
    return c.json({ error: 'Failed to fetch policy documents' }, 500)
  }
})

app.get('/api/policy-documents/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const document = await c.env.DB.prepare(
      'SELECT * FROM policy_documents WHERE id = ? AND is_active = 1'
    ).bind(id).first()
    
    if (!document) {
      return c.json({ error: 'Document not found' }, 404)
    }
    
    return c.json({ document })
  } catch (error) {
    return c.json({ error: 'Failed to fetch document' }, 500)
  }
})

// ===== ACHIEVEMENTS ROUTES =====
app.get('/api/achievements', async (c) => {
  try {
    const userId = c.req.query('user_id')
    const companyId = c.req.query('company_id')
    
    let query = `
      SELECT a.*, u.first_name, u.last_name, u.employee_id,
             awarder.first_name as awarder_first_name, awarder.last_name as awarder_last_name
      FROM achievements a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN users awarder ON a.awarded_by = awarder.id
      WHERE 1=1
    `
    const params: any[] = []
    
    if (userId) {
      query += ' AND a.user_id = ?'
      params.push(userId)
    }
    
    if (companyId) {
      query += ' AND a.company_id = ?'
      params.push(companyId)
    }
    
    query += ' ORDER BY a.created_at DESC'
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all()
    return c.json({ achievements: results })
  } catch (error) {
    return c.json({ error: 'Failed to fetch achievements' }, 500)
  }
})

app.post('/api/achievements', async (c) => {
  try {
    const data = await c.req.json()
    const result = await c.env.DB.prepare(`
      INSERT INTO achievements (user_id, company_id, achievement_type, title, description, icon, points, awarded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.user_id,
      data.company_id,
      data.achievement_type,
      data.title,
      data.description,
      data.icon || '🏆',
      data.points || 0,
      data.awarded_by
    ).run()
    
    return c.json({ success: true, id: result.meta.last_row_id })
  } catch (error) {
    return c.json({ error: 'Failed to create achievement' }, 500)
  }
})

// ===== MOTIVATIONAL QUOTES ROUTE =====
app.get('/api/motivational-quote', async (c) => {
  try {
    // Get random quote
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM motivational_quotes WHERE is_active = 1 ORDER BY RANDOM() LIMIT 1'
    ).all()
    
    return c.json({ quote: results[0] || null })
  } catch (error) {
    return c.json({ error: 'Failed to fetch quote' }, 500)
  }
})

// ===== STATISTICS ROUTES =====
app.get('/api/stats/dashboard', async (c) => {
  try {
    const companyId = c.req.query('company_id')
    const userId = c.req.query('user_id')
    
    if (!companyId) {
      return c.json({ error: 'Company ID required' }, 400)
    }
    
    // Total employees
    const totalEmployees = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM users WHERE company_id = ? AND is_active = 1 AND role = "staff"'
    ).bind(companyId).first()
    
    // Present today
    const today = new Date().toISOString().split('T')[0]
    const presentToday = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM attendance WHERE company_id = ? AND date = ? AND status = "present"'
    ).bind(companyId, today).first()
    
    // Pending leave requests
    const pendingLeaves = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM leave_requests WHERE company_id = ? AND status = "pending"'
    ).bind(companyId).first()
    
    // Upcoming events
    const upcomingEvents = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM calendar_events WHERE company_id = ? AND start_date > datetime("now")'
    ).bind(companyId).first()
    
    return c.json({
      stats: {
        total_employees: totalEmployees?.count || 0,
        present_today: presentToday?.count || 0,
        pending_leaves: pendingLeaves?.count || 0,
        upcoming_events: upcomingEvents?.count || 0
      }
    })
  } catch (error) {
    return c.json({ error: 'Failed to fetch statistics' }, 500)
  }
})

// ===== MAIN ROUTE =====
app.get('/', (c) => {
  return c.render(
    <div id="app" class="min-h-screen"></div>
  )
})

export default app
