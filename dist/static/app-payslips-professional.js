// TuloTech Africa HR System - Enhanced Payslip Generation
// Professional Template Integration with SCA Design

// ===== ENHANCED PAYSLIP GENERATION =====

function showGeneratePayslipModalEnhanced() {
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()
  
  showModal(`
    <h3 class="text-2xl font-bold mb-4 flex items-center">
      <i class="fas fa-money-bill-wave mr-3 text-green-600"></i>
      Generate Professional Payslip
    </h3>
    <form id="generate-payslip-form-enhanced" class="space-y-4">
      <!-- Employee Selection -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          <i class="fas fa-user mr-2"></i>Select Employee
        </label>
        <select name="user_id" id="payslip-employee" required class="w-full px-3 py-2 border rounded-lg">
          <option value="">Choose employee...</option>
          ${state.users.filter(u => u.role === 'staff').map(user => `
            <option value="${user.id}" data-salary="${user.salary}">
              ${user.first_name} ${user.last_name} - ${user.employee_id} (${user.position})
            </option>
          `).join('')}
        </select>
      </div>
      
      <!-- Period -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Month</label>
          <select name="month" required class="w-full px-3 py-2 border rounded-lg">
            ${[1,2,3,4,5,6,7,8,9,10,11,12].map(m => `
              <option value="${m}" ${m === currentMonth ? 'selected' : ''}>
                ${getMonthName(m)}
              </option>
            `).join('')}
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Year</label>
          <input type="number" name="year" value="${currentYear}" required class="w-full px-3 py-2 border rounded-lg">
        </div>
      </div>
      
      <!-- EARNINGS SECTION -->
      <div class="bg-blue-50 p-4 rounded-lg">
        <h4 class="font-bold text-blue-900 mb-3 flex items-center">
          <i class="fas fa-plus-circle mr-2"></i>EARNINGS
        </h4>
        
        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              <i class="fas fa-money-bill mr-2"></i>Basic Salary
            </label>
            <input type="number" name="basic_salary" id="basic-salary" step="0.01" required 
                   class="w-full px-3 py-2 border rounded-lg">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              <i class="fas fa-wallet mr-2"></i>Other Income (Allowances)
            </label>
            <input type="number" name="allowances" step="0.01" value="0" 
                   class="w-full px-3 py-2 border rounded-lg">
          </div>
        </div>
      </div>
      
      <!-- DEDUCTIONS SECTION -->
      <div class="bg-red-50 p-4 rounded-lg">
        <h4 class="font-bold text-red-900 mb-3 flex items-center">
          <i class="fas fa-minus-circle mr-2"></i>DEDUCTIONS
        </h4>
        
        <div class="space-y-3">
          <div class="bg-white p-3 rounded border">
            <label class="flex items-center space-x-2 mb-2">
              <input type="checkbox" name="auto_calculate_tax" id="auto-tax" checked class="rounded">
              <span class="text-sm font-medium text-gray-700">
                <i class="fas fa-calculator mr-2 text-blue-600"></i>
                Auto-calculate PAYE & Social Security (Namibian Tax Law)
              </span>
            </label>
            <p class="text-xs text-gray-500 ml-6">Automatically applies current Namibian tax rates</p>
          </div>
          
          <div id="manual-tax-fields" style="display:none;">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                <i class="fas fa-receipt mr-2"></i>PAYE (Manual)
              </label>
              <input type="number" name="tax_deduction_manual" step="0.01" value="0" 
                     class="w-full px-3 py-2 border rounded-lg">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                <i class="fas fa-shield-alt mr-2"></i>Social Security (Manual)
              </label>
              <input type="number" name="ssc_manual" step="0.01" value="0" 
                     class="w-full px-3 py-2 border rounded-lg">
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              <i class="fas fa-heartbeat mr-2"></i>Medical Aid
            </label>
            <input type="number" name="medical_aid_deduction" step="0.01" value="0" 
                   class="w-full px-3 py-2 border rounded-lg">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              <i class="fas fa-ellipsis-h mr-2"></i>Other Deductions
            </label>
            <input type="number" name="other_deductions" step="0.01" value="0" 
                   class="w-full px-3 py-2 border rounded-lg">
          </div>
        </div>
      </div>
      
      <!-- Payment Details -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
          <input type="date" name="payment_date" value="${new Date().toISOString().split('T')[0]}" 
                 class="w-full px-3 py-2 border rounded-lg">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
          <select name="payment_method" class="w-full px-3 py-2 border rounded-lg">
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cash">Cash</option>
            <option value="Cheque">Cheque</option>
          </select>
        </div>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
        <textarea name="notes" rows="2" class="w-full px-3 py-2 border rounded-lg"></textarea>
      </div>
      
      <button type="submit" class="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg hover:from-green-700 hover:to-green-800 font-semibold shadow-lg">
        <i class="fas fa-check-circle mr-2"></i>Generate Professional Payslip
      </button>
    </form>
  `)
  
  // Auto-fill salary when employee selected
  document.getElementById('payslip-employee').addEventListener('change', function() {
    const selected = this.options[this.selectedIndex]
    const salary = selected.getAttribute('data-salary')
    if (salary) {
      document.getElementById('basic-salary').value = salary
    }
  })
  
  // Toggle manual tax fields
  document.getElementById('auto-tax').addEventListener('change', function() {
    document.getElementById('manual-tax-fields').style.display = this.checked ? 'none' : 'block'
  })
  
  document.getElementById('generate-payslip-form-enhanced').addEventListener('submit', async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData)
    data.company_id = currentUser.company_id
    data.generated_by = currentUser.id
    data.auto_calculate_tax = formData.get('auto_calculate_tax') ? true : false
    
    try {
      const result = await apiCall('/payslips', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      
      showToast('Professional payslip generated successfully!')
      closeModal()
      await showPayslipsManagement()
      
      // Auto-open the generated payslip
      if (result.id) {
        setTimeout(() => viewPayslipDetailsProfessional(result.id), 500)
      }
    } catch (error) {
      // Error already shown
    }
  })
}

// ===== PROFESSIONAL PAYSLIP VIEW (SCA TEMPLATE) =====

async function viewPayslipDetailsProfessional(payslipId) {
  try {
    const result = await apiCall(`/payslips/${payslipId}`)
    const payslip = result.payslip
    
    // Get company template settings
    const templateResult = await apiCall(`/api/payslip-template?company_id=${payslip.company_id}`)
    const template = templateResult?.template || {}
    
    showModal(`
      <div class="payslip-professional max-w-4xl mx-auto bg-white" id="payslip-print-area">
        <!-- Header Section -->
        <div class="border-4 border-gray-200 rounded-2xl overflow-hidden shadow-2xl">
          <!-- Company Header -->
          <div class="bg-white p-8 border-b-4" style="border-color: ${template.header_color || '#8B1A1A'}">
            <div class="flex items-start justify-between">
              <div class="flex items-center space-x-6">
                <!-- Logo -->
                <div class="w-24 h-24 bg-gradient-to-br from-red-800 to-red-900 rounded-lg flex items-center justify-center shadow-lg">
                  <i class="fas fa-graduation-cap text-white text-4xl"></i>
                </div>
                
                <!-- Company Info -->
                <div>
                  <h1 class="text-3xl font-bold text-gray-900 uppercase tracking-wide">
                    ${payslip.company_name}
                  </h1>
                  <p class="text-sm text-gray-600 mt-1">${template.show_registration || 'CC/99/1262'}</p>
                  <p class="text-sm italic text-gray-700 mt-1">
                    ${template.company_motto || 'By His Power For His Glory'}
                  </p>
                </div>
              </div>
              
              <!-- Period Badge -->
              <div class="bg-gray-100 px-6 py-3 rounded-lg border-2" style="border-color: ${template.header_color || '#8B1A1A'}">
                <p class="text-xs text-gray-600 uppercase tracking-wider">Period</p>
                <p class="text-xl font-bold text-gray-900">${getMonthName(payslip.month).toUpperCase()} ${payslip.year}</p>
              </div>
            </div>
          </div>
          
          <!-- Pay Slip Title -->
          <div class="bg-gradient-to-r from-gray-100 to-gray-50 py-4 px-8">
            <h2 class="text-3xl font-bold text-gray-900 uppercase tracking-wider">PAY SLIP</h2>
          </div>
          
          <!-- Employee Details -->
          <div class="p-8 bg-white">
            <div class="grid grid-cols-3 gap-6 mb-8">
              <!-- Name Card -->
              <div class="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border-2 border-gray-200 shadow-sm">
                <div class="h-1 w-16 mb-3 rounded" style="background-color: ${template.header_color || '#8B1A1A'}"></div>
                <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">NAME</p>
                <p class="text-lg font-bold text-gray-900">${payslip.first_name} ${payslip.last_name}</p>
              </div>
              
              <!-- ID Number Card -->
              <div class="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border-2 border-gray-200 shadow-sm">
                <div class="h-1 w-16 mb-3 rounded" style="background-color: ${template.header_color || '#8B1A1A'}"></div>
                <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">I.D. NUMBER</p>
                <p class="text-lg font-bold text-gray-900">${payslip.employee_id}</p>
              </div>
              
              <!-- Designation Card -->
              <div class="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border-2 border-gray-200 shadow-sm">
                <div class="h-1 w-16 mb-3 rounded" style="background-color: ${template.header_color || '#8B1A1A'}"></div>
                <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">DESIGNATION</p>
                <p class="text-lg font-bold text-gray-900 uppercase">${payslip.position}</p>
              </div>
            </div>
            
            <!-- Earnings and Deductions Grid -->
            <div class="grid grid-cols-2 gap-8 mb-8">
              <!-- EARNINGS -->
              <div>
                <h3 class="text-2xl font-bold text-gray-900 mb-6 uppercase tracking-wide">EARNINGS</h3>
                <div class="space-y-1">
                  <!-- Header -->
                  <div class="grid grid-cols-2 gap-4 pb-3 border-b-2 border-gray-300">
                    <p class="text-sm font-bold text-gray-600 uppercase">DESCRIPTION</p>
                    <p class="text-sm font-bold text-gray-600 uppercase text-right">AMOUNT (N$)</p>
                  </div>
                  
                  <!-- Basic Salary -->
                  <div class="grid grid-cols-2 gap-4 py-3 bg-gray-50 px-3 rounded">
                    <p class="text-sm flex items-center">
                      <i class="fas fa-money-bill-wave mr-2 text-green-600"></i>
                      Basic Salary
                    </p>
                    <p class="text-sm font-semibold text-right">N$ ${parseFloat(payslip.basic_salary).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                  </div>
                  
                  <!-- Other Income -->
                  <div class="grid grid-cols-2 gap-4 py-3 px-3">
                    <p class="text-sm flex items-center">
                      <i class="fas fa-plus-circle mr-2 text-blue-600"></i>
                      Other Income
                    </p>
                    <p class="text-sm font-semibold text-right">N$ ${parseFloat(payslip.allowances || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                  </div>
                  
                  <!-- Total -->
                  <div class="grid grid-cols-2 gap-4 py-4 px-3 bg-green-50 border-t-2 border-green-600 rounded mt-2">
                    <p class="text-base font-bold text-gray-900">Total Earnings</p>
                    <p class="text-base font-bold text-right text-green-700">N$ ${parseFloat(payslip.gross_salary).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                  </div>
                </div>
              </div>
              
              <!-- DEDUCTIONS -->
              <div>
                <h3 class="text-2xl font-bold text-gray-900 mb-6 uppercase tracking-wide">DEDUCTIONS</h3>
                <div class="space-y-1">
                  <!-- Header -->
                  <div class="grid grid-cols-2 gap-4 pb-3 border-b-2 border-gray-300">
                    <p class="text-sm font-bold text-gray-600 uppercase">DESCRIPTION</p>
                    <p class="text-sm font-bold text-gray-600 uppercase text-right">AMOUNT (N$)</p>
                  </div>
                  
                  <!-- PAYE -->
                  <div class="grid grid-cols-2 gap-4 py-3 bg-gray-50 px-3 rounded">
                    <p class="text-sm flex items-center">
                      <i class="fas fa-file-invoice-dollar mr-2 text-red-600"></i>
                      PAYE
                    </p>
                    <p class="text-sm font-semibold text-right">N$ ${parseFloat(payslip.tax_deduction || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                  </div>
                  
                  <!-- Social Security -->
                  <div class="grid grid-cols-2 gap-4 py-3 px-3">
                    <p class="text-sm flex items-center">
                      <i class="fas fa-shield-alt mr-2 text-blue-600"></i>
                      Social Security
                    </p>
                    <p class="text-sm font-semibold text-right">N$ ${parseFloat(payslip.pension_deduction || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                  </div>
                  
                  <!-- Medical Aid -->
                  <div class="grid grid-cols-2 gap-4 py-3 bg-gray-50 px-3 rounded">
                    <p class="text-sm flex items-center">
                      <i class="fas fa-heartbeat mr-2 text-purple-600"></i>
                      Medical Aid
                    </p>
                    <p class="text-sm font-semibold text-right">N$ ${parseFloat(payslip.insurance_deduction || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                  </div>
                  
                  <!-- Other -->
                  <div class="grid grid-cols-2 gap-4 py-3 px-3">
                    <p class="text-sm flex items-center">
                      <i class="fas fa-ellipsis-h mr-2 text-gray-600"></i>
                      Other
                    </p>
                    <p class="text-sm font-semibold text-right">N$ ${parseFloat(payslip.other_deductions || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                  </div>
                  
                  <!-- Total -->
                  <div class="grid grid-cols-2 gap-4 py-4 px-3 bg-red-50 border-t-2 border-red-600 rounded mt-2">
                    <p class="text-base font-bold text-gray-900">Total Deductions</p>
                    <p class="text-base font-bold text-right text-red-700">N$ ${parseFloat(payslip.total_deductions).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- NET SALARY HIGHLIGHT -->
            <div class="bg-gradient-to-r from-green-100 to-emerald-100 border-4 border-green-600 rounded-xl p-6 mb-8 shadow-lg">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <div class="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center shadow-lg">
                    <i class="fas fa-hand-holding-usd text-white text-2xl"></i>
                  </div>
                  <div>
                    <p class="text-sm text-green-700 font-medium uppercase tracking-wider">Net Salary</p>
                    <p class="text-4xl font-bold text-green-900">N$ ${parseFloat(payslip.net_salary).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-xs text-green-700">Payment Date</p>
                  <p class="text-sm font-semibold text-green-900">${formatDate(payslip.payment_date || payslip.created_at)}</p>
                </div>
              </div>
            </div>
            
            <!-- BANKING DETAILS -->
            ${payslip.bank_name ? `
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
              <h3 class="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wide flex items-center">
                <i class="fas fa-university mr-3 text-blue-600"></i>
                BANKING DETAILS
              </h3>
              <div class="grid grid-cols-2 gap-6">
                <div class="bg-white p-4 rounded-lg border border-blue-200">
                  <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">Bank Name</p>
                  <p class="text-base font-semibold text-gray-900">${payslip.bank_name}</p>
                </div>
                <div class="bg-white p-4 rounded-lg border border-blue-200">
                  <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">Branch Code</p>
                  <p class="text-base font-semibold text-gray-900">${payslip.branch_code || 'N/A'}</p>
                </div>
                <div class="bg-white p-4 rounded-lg border border-blue-200">
                  <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">Account Number</p>
                  <p class="text-base font-semibold text-gray-900">${payslip.account_number || 'N/A'}</p>
                </div>
                <div class="bg-white p-4 rounded-lg border border-blue-200">
                  <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">Account Holder</p>
                  <p class="text-base font-semibold text-gray-900">${payslip.account_holder || payslip.first_name + ' ' + payslip.last_name}</p>
                </div>
              </div>
            </div>
            ` : ''}
            
            <!-- Footer -->
            <div class="mt-8 pt-6 border-t-2 border-gray-200 text-center">
              <p class="text-sm text-gray-600 mb-2">This is a computer-generated payslip. No signature required.</p>
              <p class="text-xs text-gray-500">Generated on ${formatDateTime(payslip.created_at)}</p>
              <p class="text-xs text-gray-400 mt-2">
                <i class="fas fa-lock mr-1"></i>Confidential Document - For ${payslip.first_name} ${payslip.last_name} Only
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="mt-6 flex space-x-4 no-print">
        <button onclick="downloadPayslipPDFProfessional(${payslip.id})" 
                class="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold shadow-lg">
          <i class="fas fa-download mr-2"></i>Download PDF
        </button>
        <button onclick="printPayslipProfessional()" 
                class="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold shadow-lg">
          <i class="fas fa-print mr-2"></i>Print Payslip
        </button>
        <button onclick="emailPayslipProfessional(${payslip.id})" 
                class="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 font-semibold shadow-lg">
          <i class="fas fa-envelope mr-2"></i>Email to Employee
        </button>
      </div>
    `)
  } catch (error) {
    showToast('Failed to load payslip', 'error')
  }
}

// Print function for professional payslip
function printPayslipProfessional() {
  window.print()
}

// Download PDF placeholder
function downloadPayslipPDFProfessional(payslipId) {
  showToast('PDF generation will use jsPDF library - coming soon!')
  // TODO: Implement jsPDF generation matching the template
}

// Email payslip placeholder
function emailPayslipProfessional(payslipId) {
  showToast('Email functionality will use SendGrid API - coming soon!')
  // TODO: Implement email sending
}

// API endpoint to get template
async function getPayslipTemplate(companyId) {
  try {
    const result = await apiCall(`/api/payslip-template?company_id=${companyId}`)
    return result.template
  } catch (error) {
    return null
  }
}

// ===== EXPOSE FUNCTIONS GLOBALLY =====
window.showGeneratePayslipModalEnhanced = showGeneratePayslipModalEnhanced
window.viewPayslipDetailsProfessional = viewPayslipDetailsProfessional
window.downloadPayslipPDFProfessional = downloadPayslipPDFProfessional
window.emailPayslipProfessional = emailPayslipProfessional
window.printPayslipProfessional = printPayslipProfessional
window.getPayslipTemplate = getPayslipTemplate
