// TuloTech Africa HR System - Additional Views (Part 2)

// ===== STAFF MANAGEMENT (Admin) =====
async function showStaffManagement() {
  await loadUsers()
  
  const content = document.getElementById('main-content')
  content.innerHTML = `
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-800 mb-2">
          <i class="fas fa-users mr-3 text-blue-600"></i>Staff Management
        </h1>
        <p class="text-gray-600">Manage employee records and information</p>
      </div>
      <button onclick="showAddStaffModal()" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg">
        <i class="fas fa-plus mr-2"></i>Add Staff Member
      </button>
    </div>
    
    <div class="bg-white rounded-xl shadow-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            ${state.users.filter(u => u.role !== 'admin').map(user => `
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span class="text-blue-600 font-semibold">${user.first_name[0]}${user.last_name[0]}</span>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">${user.first_name} ${user.last_name}</div>
                      <div class="text-sm text-gray-500">${user.email}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${user.department || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${user.position || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatCurrency(user.salary)}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs rounded ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                    ${user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <button onclick="viewUserDetails(${user.id})" class="text-blue-600 hover:text-blue-800 mr-3">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button onclick="editUser(${user.id})" class="text-green-600 hover:text-green-800">
                    <i class="fas fa-edit"></i>
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

function showAddStaffModal() {
  showModal(`
    <h3 class="text-2xl font-bold mb-4">Add Staff Member</h3>
    <form id="add-staff-form" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
          <input type="text" name="first_name" required class="w-full px-3 py-2 border rounded-lg">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
          <input type="text" name="last_name" required class="w-full px-3 py-2 border rounded-lg">
        </div>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input type="email" name="email" required class="w-full px-3 py-2 border rounded-lg">
      </div>
      
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
          <input type="text" name="employee_id" required class="w-full px-3 py-2 border rounded-lg">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Department</label>
          <input type="text" name="department" required class="w-full px-3 py-2 border rounded-lg">
        </div>
      </div>
      
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Position</label>
          <input type="text" name="position" required class="w-full px-3 py-2 border rounded-lg">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Salary</label>
          <input type="number" name="salary" required class="w-full px-3 py-2 border rounded-lg">
        </div>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Hire Date</label>
        <input type="date" name="hire_date" required class="w-full px-3 py-2 border rounded-lg">
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <input type="tel" name="phone" class="w-full px-3 py-2 border rounded-lg">
      </div>
      
      <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
        Add Staff Member
      </button>
    </form>
  `)
  
  document.getElementById('add-staff-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData)
    data.company_id = currentUser.company_id
    
    try {
      await apiCall('/users', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      showToast('Staff member added successfully!')
      closeModal()
      await showStaffManagement()
    } catch (error) {
      // Error already shown by apiCall
    }
  })
}

// ===== ATTENDANCE MANAGEMENT (Admin) =====
async function showAttendanceManagement() {
  const today = new Date().toISOString().split('T')[0]
  await loadAttendance(null, new Date().toISOString().substr(0, 7))
  
  const content = document.getElementById('main-content')
  content.innerHTML = `
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-800 mb-2">
          <i class="fas fa-clock mr-3 text-blue-600"></i>Attendance Management
        </h1>
        <p class="text-gray-600">Monitor and manage staff attendance</p>
      </div>
      <button onclick="showAddAttendanceModal()" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg">
        <i class="fas fa-plus mr-2"></i>Manual Entry
      </button>
    </div>
    
    <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h3 class="text-xl font-bold text-gray-800 mb-4">Today's Attendance (${formatDate(today)})</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        ${renderTodayAttendanceStats()}
      </div>
    </div>
    
    <div class="bg-white rounded-xl shadow-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clock In</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clock Out</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            ${state.attendance.map(att => `
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">${att.first_name} ${att.last_name}</div>
                  <div class="text-sm text-gray-500">${att.department}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatDate(att.date)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${att.clock_in ? new Date(att.clock_in).toLocaleTimeString() : 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${att.clock_out ? new Date(att.clock_out).toLocaleTimeString() : 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${calculateWorkHours(att.clock_in, att.clock_out)}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs rounded ${
                    att.status === 'present' ? 'bg-green-100 text-green-800' :
                    att.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                    att.status === 'absent' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }">
                    ${att.status}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `
}

function renderTodayAttendanceStats() {
  const today = new Date().toISOString().split('T')[0]
  const todayAttendance = state.attendance.filter(a => a.date === today)
  const present = todayAttendance.filter(a => a.status === 'present').length
  const late = todayAttendance.filter(a => a.status === 'late').length
  const absent = state.users.filter(u => u.role === 'staff').length - todayAttendance.length
  
  return `
    <div class="bg-green-50 rounded-lg p-4 border border-green-200">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-green-700">Present</p>
          <p class="text-2xl font-bold text-green-800">${present}</p>
        </div>
        <i class="fas fa-check-circle text-3xl text-green-500"></i>
      </div>
    </div>
    <div class="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-yellow-700">Late</p>
          <p class="text-2xl font-bold text-yellow-800">${late}</p>
        </div>
        <i class="fas fa-clock text-3xl text-yellow-500"></i>
      </div>
    </div>
    <div class="bg-red-50 rounded-lg p-4 border border-red-200">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-red-700">Absent</p>
          <p class="text-2xl font-bold text-red-800">${absent}</p>
        </div>
        <i class="fas fa-times-circle text-3xl text-red-500"></i>
      </div>
    </div>
  `
}

// ===== STAFF ATTENDANCE VIEW =====
async function showStaffAttendanceView() {
  await loadAttendance(currentUser.id)
  
  const today = new Date().toISOString().split('T')[0]
  const todayAttendance = state.attendance.find(a => a.date === today)
  
  const content = document.getElementById('main-content')
  content.innerHTML = `
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">
        <i class="fas fa-clock mr-3 text-blue-600"></i>My Attendance
      </h1>
      <p class="text-gray-600">Track your attendance and work hours</p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
        <h3 class="text-xl font-bold mb-4">Clock In</h3>
        ${todayAttendance && todayAttendance.clock_in ? `
          <p class="text-3xl font-bold mb-2">${new Date(todayAttendance.clock_in).toLocaleTimeString()}</p>
          <p class="text-sm opacity-90">Already clocked in today</p>
        ` : `
          <button onclick="clockIn()" class="bg-white text-green-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors">
            <i class="fas fa-sign-in-alt mr-2"></i>Clock In Now
          </button>
        `}
      </div>
      
      <div class="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
        <h3 class="text-xl font-bold mb-4">Clock Out</h3>
        ${todayAttendance && todayAttendance.clock_out ? `
          <p class="text-3xl font-bold mb-2">${new Date(todayAttendance.clock_out).toLocaleTimeString()}</p>
          <p class="text-sm opacity-90">Already clocked out today</p>
        ` : todayAttendance && todayAttendance.clock_in ? `
          <button onclick="clockOut()" class="bg-white text-red-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors">
            <i class="fas fa-sign-out-alt mr-2"></i>Clock Out Now
          </button>
        ` : `
          <p class="text-sm opacity-90">Clock in first to enable clock out</p>
        `}
      </div>
    </div>
    
    <div class="bg-white rounded-xl shadow-lg overflow-hidden">
      <div class="p-6 border-b">
        <h3 class="text-xl font-bold text-gray-800">Attendance History</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clock In</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clock Out</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours Worked</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            ${state.attendance.map(att => `
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${formatDate(att.date)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${att.clock_in ? new Date(att.clock_in).toLocaleTimeString() : 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${att.clock_out ? new Date(att.clock_out).toLocaleTimeString() : 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${calculateWorkHours(att.clock_in, att.clock_out)}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs rounded ${
                    att.status === 'present' ? 'bg-green-100 text-green-800' :
                    att.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }">
                    ${att.status}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `
}

// ===== MISSING FUNCTIONS =====

// Add manual attendance entry
function showAddAttendanceModal() {
  const today = new Date().toISOString().split('T')[0]
  
  showModal(`
    <h3 class="text-2xl font-bold mb-4">Manual Attendance Entry</h3>
    <form id="add-attendance-form" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Select Employee</label>
        <select name="user_id" required class="w-full px-3 py-2 border rounded-lg">
          <option value="">Choose employee...</option>
          ${state.users.filter(u => u.role === 'staff').map(user => `
            <option value="${user.id}">${user.first_name} ${user.last_name} (${user.employee_id})</option>
          `).join('')}
        </select>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input type="date" name="date" value="${today}" required class="w-full px-3 py-2 border rounded-lg">
      </div>
      
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Clock In</label>
          <input type="time" name="clock_in" required class="w-full px-3 py-2 border rounded-lg">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Clock Out (Optional)</label>
          <input type="time" name="clock_out" class="w-full px-3 py-2 border rounded-lg">
        </div>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select name="status" required class="w-full px-3 py-2 border rounded-lg">
          <option value="present">Present</option>
          <option value="late">Late</option>
          <option value="absent">Absent</option>
          <option value="half-day">Half Day</option>
        </select>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea name="notes" rows="2" class="w-full px-3 py-2 border rounded-lg"></textarea>
      </div>
      
      <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
        Save Attendance
      </button>
    </form>
  `)
  
  document.getElementById('add-attendance-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData)
    
    // Construct datetime strings
    data.clock_in = `${data.date}T${data.clock_in}:00`
    if (data.clock_out) {
      data.clock_out = `${data.date}T${data.clock_out}:00`
    }
    data.company_id = state.currentUser.company_id
    
    try {
      await apiCall('/api/attendance', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      showToast('Attendance record added successfully!')
      closeModal()
      await showAttendanceManagement()
    } catch (error) {
      // Error already shown by apiCall
    }
  })
}

// View user details
async function viewUserDetails(userId) {
  const user = state.users.find(u => u.id === userId)
  if (!user) {
    showToast('User not found', 'error')
    return
  }
  
  showModal(`
    <h3 class="text-2xl font-bold mb-4">Employee Details</h3>
    <div class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <p class="text-gray-900">${user.first_name} ${user.last_name}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
          <p class="text-gray-900">${user.employee_id}</p>
        </div>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <p class="text-gray-900">${user.email}</p>
      </div>
      
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Department</label>
          <p class="text-gray-900">${user.department || 'N/A'}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Position</label>
          <p class="text-gray-900">${user.position || 'N/A'}</p>
        </div>
      </div>
      
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Salary</label>
          <p class="text-gray-900">${formatCurrency(user.salary)}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <p class="text-gray-900">
            <span class="px-2 py-1 text-xs rounded ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
              ${user.is_active ? 'Active' : 'Inactive'}
            </span>
          </p>
        </div>
      </div>
      
      ${user.phone ? `
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <p class="text-gray-900">${user.phone}</p>
        </div>
      ` : ''}
      
      ${user.address ? `
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <p class="text-gray-900">${user.address}</p>
        </div>
      ` : ''}
      
      ${user.bank_name ? `
        <div class="bg-blue-50 p-4 rounded-lg">
          <h4 class="font-bold text-blue-900 mb-2">Banking Details</h4>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Bank</label>
              <p class="text-gray-900">${user.bank_name}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Branch Code</label>
              <p class="text-gray-900">${user.branch_code}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
              <p class="text-gray-900">${user.account_number}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Account Holder</label>
              <p class="text-gray-900">${user.account_holder}</p>
            </div>
          </div>
        </div>
      ` : ''}
    </div>
  `)
}

// Edit user
async function editUser(userId) {
  const user = state.users.find(u => u.id === userId)
  if (!user) {
    showToast('User not found', 'error')
    return
  }
  
  showModal(`
    <h3 class="text-2xl font-bold mb-4">Edit Employee</h3>
    <form id="edit-user-form" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
          <input type="text" name="first_name" value="${user.first_name}" required class="w-full px-3 py-2 border rounded-lg">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
          <input type="text" name="last_name" value="${user.last_name}" required class="w-full px-3 py-2 border rounded-lg">
        </div>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input type="email" name="email" value="${user.email}" required class="w-full px-3 py-2 border rounded-lg">
      </div>
      
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Department</label>
          <input type="text" name="department" value="${user.department || ''}" class="w-full px-3 py-2 border rounded-lg">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Position</label>
          <input type="text" name="position" value="${user.position || ''}" class="w-full px-3 py-2 border rounded-lg">
        </div>
      </div>
      
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Salary</label>
          <input type="number" name="salary" value="${user.salary || 0}" step="0.01" class="w-full px-3 py-2 border rounded-lg">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input type="tel" name="phone" value="${user.phone || ''}" class="w-full px-3 py-2 border rounded-lg">
        </div>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
        <input type="text" name="address" value="${user.address || ''}" class="w-full px-3 py-2 border rounded-lg">
      </div>
      
      <div>
        <label class="flex items-center space-x-2">
          <input type="checkbox" name="is_active" ${user.is_active ? 'checked' : ''} class="rounded">
          <span class="text-sm font-medium text-gray-700">Active Employee</span>
        </label>
      </div>
      
      <button type="submit" class="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
        Update Employee
      </button>
    </form>
  `)
  
  document.getElementById('edit-user-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData)
    data.is_active = formData.has('is_active') ? 1 : 0
    
    try {
      await apiCall(`/api/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      })
      showToast('Employee updated successfully!')
      closeModal()
      await showStaffManagement()
    } catch (error) {
      // Error already shown by apiCall
    }
  })
}

// ===== MODAL HELPER =====
function showModal(content) {
  const modal = document.createElement('div')
  modal.id = 'modal'
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
  modal.innerHTML = `
    <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        ${content}
      </div>
      <div class="bg-gray-50 px-6 py-4 flex justify-end">
        <button onclick="closeModal()" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
          Close
        </button>
      </div>
    </div>
  `
  document.body.appendChild(modal)
}

function closeModal() {
  const modal = document.getElementById('modal')
  if (modal) modal.remove()
}
