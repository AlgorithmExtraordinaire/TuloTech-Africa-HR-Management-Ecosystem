// TuloTech Africa HR System - Payslips, Leave, Calendar, Messages (Part 3)

// ===== PAYSLIPS MANAGEMENT (Admin) =====
async function showPayslipsManagement() {
  await loadPayslips()
  await loadUsers()
  
  const content = document.getElementById('main-content')
  content.innerHTML = `
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-800 mb-2">
          <i class="fas fa-money-bill-wave mr-3 text-green-600"></i>Payslips Management
        </h1>
        <p class="text-gray-600">Generate and manage employee payslips</p>
      </div>
      <button onclick="showGeneratePayslipModal()" class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors shadow-lg">
        <i class="fas fa-plus mr-2"></i>Generate Payslip
      </button>
    </div>
    
    <div class="bg-white rounded-xl shadow-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Basic Salary</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Salary</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            ${state.payslips.map(payslip => `
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">${payslip.first_name} ${payslip.last_name}</div>
                  <div class="text-sm text-gray-500">${payslip.employee_id}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${getMonthName(payslip.month)} ${payslip.year}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatCurrency(payslip.basic_salary)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">${formatCurrency(payslip.net_salary)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <button onclick="viewPayslipDetails(${payslip.id})" class="text-blue-600 hover:text-blue-800 mr-3">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button onclick="downloadPayslipPDF(${payslip.id})" class="text-green-600 hover:text-green-800">
                    <i class="fas fa-download"></i>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `
}

function getMonthName(month) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return months[month - 1]
}

function showGeneratePayslipModal() {
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()
  
  showModal(`
    <h3 class="text-2xl font-bold mb-4">Generate Payslip</h3>
    <form id="generate-payslip-form" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Select Employee</label>
        <select name="user_id" required class="w-full px-3 py-2 border rounded-lg">
          <option value="">Choose employee...</option>
          ${state.users.filter(u => u.role === 'staff').map(user => `
            <option value="${user.id}">${user.first_name} ${user.last_name} (${user.employee_id})</option>
          `).join('')}
        </select>
      </div>
      
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Month</label>
          <select name="month" required class="w-full px-3 py-2 border rounded-lg">
            ${[1,2,3,4,5,6,7,8,9,10,11,12].map(m => `
              <option value="${m}" ${m === currentMonth ? 'selected' : ''}>${getMonthName(m)}</option>
            `).join('')}
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Year</label>
          <input type="number" name="year" value="${currentYear}" required class="w-full px-3 py-2 border rounded-lg">
        </div>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Basic Salary</label>
        <input type="number" name="basic_salary" step="0.01" required class="w-full px-3 py-2 border rounded-lg">
      </div>
      
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Allowances</label>
          <input type="number" name="allowances" step="0.01" value="0" class="w-full px-3 py-2 border rounded-lg">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Bonuses</label>
          <input type="number" name="bonuses" step="0.01" value="0" class="w-full px-3 py-2 border rounded-lg">
        </div>
      </div>
      
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Overtime Hours</label>
          <input type="number" name="overtime_hours" step="0.5" value="0" class="w-full px-3 py-2 border rounded-lg">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Overtime Pay</label>
          <input type="number" name="overtime_pay" step="0.01" value="0" class="w-full px-3 py-2 border rounded-lg">
        </div>
      </div>
      
      <h4 class="font-semibold text-gray-800 mt-4">Deductions</h4>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tax Deduction</label>
          <input type="number" name="tax_deduction" step="0.01" value="0" class="w-full px-3 py-2 border rounded-lg">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Insurance</label>
          <input type="number" name="insurance_deduction" step="0.01" value="0" class="w-full px-3 py-2 border rounded-lg">
        </div>
      </div>
      
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Pension</label>
          <input type="number" name="pension_deduction" step="0.01" value="0" class="w-full px-3 py-2 border rounded-lg">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Other Deductions</label>
          <input type="number" name="other_deductions" step="0.01" value="0" class="w-full px-3 py-2 border rounded-lg">
        </div>
      </div>
      
      <button type="submit" class="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
        Generate Payslip
      </button>
    </form>
  `)
  
  document.getElementById('generate-payslip-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData)
    data.company_id = currentUser.company_id
    data.generated_by = currentUser.id
    data.payment_date = new Date().toISOString().split('T')[0]
    
    try {
      await apiCall('/payslips', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      showToast('Payslip generated successfully!')
      closeModal()
      await showPayslipsManagement()
    } catch (error) {
      // Error already shown
    }
  })
}

async function viewPayslipDetails(payslipId) {
  try {
    const result = await apiCall(`/payslips/${payslipId}`)
    const payslip = result.payslip
    
    showModal(`
      <div class="payslip-preview">
        <div class="text-center mb-6">
          <h2 class="text-3xl font-bold text-gray-800">${payslip.organization_name}</h2>
          <p class="text-lg text-gray-600">${payslip.company_name}</p>
          <p class="text-sm text-gray-500">${payslip.company_address}</p>
        </div>
        
        <div class="border-t-2 border-b-2 border-gray-300 py-4 mb-6">
          <h3 class="text-2xl font-bold text-center text-gray-800">PAYSLIP</h3>
          <p class="text-center text-gray-600">${getMonthName(payslip.month)} ${payslip.year}</p>
        </div>
        
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p class="text-sm text-gray-600">Employee Name:</p>
            <p class="font-semibold">${payslip.first_name} ${payslip.last_name}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Employee ID:</p>
            <p class="font-semibold">${payslip.employee_id}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Department:</p>
            <p class="font-semibold">${payslip.department}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Position:</p>
            <p class="font-semibold">${payslip.position}</p>
          </div>
        </div>
        
        <div class="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 class="font-bold text-gray-800 mb-3">Earnings</h4>
          <div class="space-y-2">
            <div class="flex justify-between"><span>Basic Salary:</span><span>${formatCurrency(payslip.basic_salary)}</span></div>
            <div class="flex justify-between"><span>Allowances:</span><span>${formatCurrency(payslip.allowances)}</span></div>
            <div class="flex justify-between"><span>Bonuses:</span><span>${formatCurrency(payslip.bonuses)}</span></div>
            <div class="flex justify-between"><span>Overtime Pay:</span><span>${formatCurrency(payslip.overtime_pay)}</span></div>
            <div class="flex justify-between border-t pt-2 font-bold"><span>Gross Salary:</span><span>${formatCurrency(payslip.gross_salary)}</span></div>
          </div>
        </div>
        
        <div class="bg-red-50 rounded-lg p-4 mb-4">
          <h4 class="font-bold text-gray-800 mb-3">Deductions</h4>
          <div class="space-y-2">
            <div class="flex justify-between"><span>Tax:</span><span>${formatCurrency(payslip.tax_deduction)}</span></div>
            <div class="flex justify-between"><span>Insurance:</span><span>${formatCurrency(payslip.insurance_deduction)}</span></div>
            <div class="flex justify-between"><span>Pension:</span><span>${formatCurrency(payslip.pension_deduction)}</span></div>
            <div class="flex justify-between"><span>Other:</span><span>${formatCurrency(payslip.other_deductions)}</span></div>
            <div class="flex justify-between border-t pt-2 font-bold"><span>Total Deductions:</span><span>${formatCurrency(payslip.total_deductions)}</span></div>
          </div>
        </div>
        
        <div class="bg-green-100 border-2 border-green-500 rounded-lg p-4 mb-6">
          <div class="flex justify-between items-center">
            <span class="text-xl font-bold text-gray-800">NET SALARY:</span>
            <span class="text-3xl font-bold text-green-700">${formatCurrency(payslip.net_salary)}</span>
          </div>
        </div>
        
        <div class="text-center text-sm text-gray-500">
          <p>This is a computer-generated payslip. No signature required.</p>
          <p>Generated on ${formatDate(payslip.created_at)}</p>
        </div>
      </div>
      
      <div class="mt-6 flex space-x-4">
        <button onclick="downloadPayslipPDF(${payslip.id})" class="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
          <i class="fas fa-download mr-2"></i>Download PDF
        </button>
        <button onclick="window.print()" class="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
          <i class="fas fa-print mr-2"></i>Print
        </button>
      </div>
    `)
  } catch (error) {
    // Error already shown
  }
}

function downloadPayslipPDF(payslipId) {
  showToast('PDF download functionality will use jsPDF library in production')
  // In production, implement jsPDF here
}

// ===== STAFF PAYSLIPS VIEW =====
async function showStaffPayslipsView() {
  await loadPayslips(currentUser.id)
  
  const content = document.getElementById('main-content')
  content.innerHTML = `
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">
        <i class="fas fa-money-bill-wave mr-3 text-green-600"></i>My Payslips
      </h1>
      <p class="text-gray-600">View and download your salary slips</p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      ${state.payslips.map(payslip => `
        <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
          <div class="bg-gradient-to-r from-green-500 to-green-600 p-4 text-white">
            <h3 class="text-xl font-bold">${getMonthName(payslip.month)} ${payslip.year}</h3>
          </div>
          <div class="p-6">
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">Basic Salary:</span>
                <span class="font-semibold">${formatCurrency(payslip.basic_salary)}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Gross Salary:</span>
                <span class="font-semibold">${formatCurrency(payslip.gross_salary)}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Deductions:</span>
                <span class="font-semibold text-red-600">-${formatCurrency(payslip.total_deductions)}</span>
              </div>
              <div class="border-t-2 pt-3 flex justify-between">
                <span class="font-bold text-gray-800">Net Salary:</span>
                <span class="font-bold text-green-600 text-xl">${formatCurrency(payslip.net_salary)}</span>
              </div>
            </div>
            
            <div class="mt-6 flex space-x-2">
              <button onclick="viewPayslipDetails(${payslip.id})" class="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm">
                <i class="fas fa-eye mr-1"></i>View
              </button>
              <button onclick="downloadPayslipPDF(${payslip.id})" class="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 text-sm">
                <i class="fas fa-download mr-1"></i>Download
              </button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
    
    ${state.payslips.length === 0 ? `
      <div class="bg-white rounded-xl shadow-lg p-12 text-center">
        <i class="fas fa-file-invoice text-6xl text-gray-300 mb-4"></i>
        <p class="text-gray-600 text-lg">No payslips available yet</p>
      </div>
    ` : ''}
  `
}

// ===== LEAVE MANAGEMENT =====
async function showLeaveManagement() {
  await loadLeaveRequests()
  
  const content = document.getElementById('main-content')
  content.innerHTML = `
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">
        <i class="fas fa-calendar-times mr-3 text-orange-600"></i>Leave Requests Management
      </h1>
      <p class="text-gray-600">Manage employee leave requests</p>
    </div>
    
    <div class="bg-white rounded-xl shadow-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            ${state.leaveRequests.map(leave => `
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">${leave.first_name} ${leave.last_name}</div>
                  <div class="text-sm text-gray-500">${leave.department}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800 capitalize">${leave.leave_type}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatDate(leave.start_date)} - ${formatDate(leave.end_date)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${leave.days_count} days</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs rounded ${
                    leave.status === 'approved' ? 'bg-green-100 text-green-800' :
                    leave.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }">
                    ${leave.status}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${leave.status === 'pending' ? `
                    <button onclick="approveLeave(${leave.id})" class="text-green-600 hover:text-green-800 mr-2">
                      <i class="fas fa-check"></i>
                    </button>
                    <button onclick="rejectLeave(${leave.id})" class="text-red-600 hover:text-red-800">
                      <i class="fas fa-times"></i>
                    </button>
                  ` : `
                    <span class="text-gray-400">Processed</span>
                  `}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `
}

async function approveLeave(leaveId) {
  if (!confirm('Approve this leave request?')) return
  
  try {
    await apiCall(`/leave-requests/${leaveId}`, {
      method: 'PUT',
      body: JSON.stringify({
        status: 'approved',
        approved_by: currentUser.id,
        notes: 'Approved'
      })
    })
    showToast('Leave request approved!')
    await showLeaveManagement()
  } catch (error) {
    // Error already shown
  }
}

async function rejectLeave(leaveId) {
  const reason = prompt('Reason for rejection:')
  if (!reason) return
  
  try {
    await apiCall(`/leave-requests/${leaveId}`, {
      method: 'PUT',
      body: JSON.stringify({
        status: 'rejected',
        approved_by: currentUser.id,
        notes: reason
      })
    })
    showToast('Leave request rejected')
    await showLeaveManagement()
  } catch (error) {
    // Error already shown
  }
}

// ===== STAFF LEAVE VIEW =====
async function showStaffLeaveView() {
  await loadLeaveRequests(currentUser.id)
  
  const content = document.getElementById('main-content')
  content.innerHTML = `
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-800 mb-2">
          <i class="fas fa-calendar-times mr-3 text-orange-600"></i>My Leave Requests
        </h1>
        <p class="text-gray-600">Manage your leave applications</p>
      </div>
      <button onclick="showRequestLeaveModal()" class="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors shadow-lg">
        <i class="fas fa-plus mr-2"></i>Request Leave
      </button>
    </div>
    
    <div class="grid grid-cols-1 gap-6">
      ${state.leaveRequests.map(leave => `
        <div class="bg-white rounded-xl shadow-lg p-6">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-3 mb-3">
                <span class="px-3 py-1 rounded-lg font-semibold capitalize ${
                  leave.leave_type === 'annual' ? 'bg-blue-100 text-blue-700' :
                  leave.leave_type === 'sick' ? 'bg-red-100 text-red-700' :
                  leave.leave_type === 'emergency' ? 'bg-orange-100 text-orange-700' :
                  'bg-purple-100 text-purple-700'
                }">${leave.leave_type} Leave</span>
                <span class="px-3 py-1 rounded-lg font-semibold ${
                  leave.status === 'approved' ? 'bg-green-100 text-green-700' :
                  leave.status === 'rejected' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }">${leave.status}</span>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p class="text-gray-600">Start Date</p>
                  <p class="font-semibold">${formatDate(leave.start_date)}</p>
                </div>
                <div>
                  <p class="text-gray-600">End Date</p>
                  <p class="font-semibold">${formatDate(leave.end_date)}</p>
                </div>
                <div>
                  <p class="text-gray-600">Duration</p>
                  <p class="font-semibold">${leave.days_count} day${leave.days_count > 1 ? 's' : ''}</p>
                </div>
              </div>
              ${leave.reason ? `
                <div class="mt-3">
                  <p class="text-gray-600 text-sm">Reason:</p>
                  <p class="text-gray-800">${leave.reason}</p>
                </div>
              ` : ''}
              ${leave.notes ? `
                <div class="mt-3">
                  <p class="text-gray-600 text-sm">Admin Notes:</p>
                  <p class="text-gray-800">${leave.notes}</p>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      `).join('')}
    </div>
    
    ${state.leaveRequests.length === 0 ? `
      <div class="bg-white rounded-xl shadow-lg p-12 text-center">
        <i class="fas fa-calendar-times text-6xl text-gray-300 mb-4"></i>
        <p class="text-gray-600 text-lg mb-4">No leave requests yet</p>
        <button onclick="showRequestLeaveModal()" class="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700">
          Request Your First Leave
        </button>
      </div>
    ` : ''}
  `
}

function showRequestLeaveModal() {
  showModal(`
    <h3 class="text-2xl font-bold mb-4">Request Leave</h3>
    <form id="request-leave-form" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
        <select name="leave_type" required class="w-full px-3 py-2 border rounded-lg">
          <option value="annual">Annual Leave</option>
          <option value="sick">Sick Leave</option>
          <option value="maternity">Maternity Leave</option>
          <option value="paternity">Paternity Leave</option>
          <option value="unpaid">Unpaid Leave</option>
          <option value="emergency">Emergency Leave</option>
        </select>
      </div>
      
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input type="date" name="start_date" required class="w-full px-3 py-2 border rounded-lg">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input type="date" name="end_date" required class="w-full px-3 py-2 border rounded-lg">
        </div>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Reason</label>
        <textarea name="reason" rows="4" required class="w-full px-3 py-2 border rounded-lg"></textarea>
      </div>
      
      <button type="submit" class="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700">
        Submit Leave Request
      </button>
    </form>
  `)
  
  document.getElementById('request-leave-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData)
    data.user_id = currentUser.id
    data.company_id = currentUser.company_id
    
    try {
      await apiCall('/leave-requests', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      showToast('Leave request submitted successfully!')
      closeModal()
      await showStaffLeaveView()
    } catch (error) {
      // Error already shown
    }
  })
}
