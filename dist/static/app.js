// TuloTech Africa HR Management System - Main Application
// Revolutionary, modern, and comprehensive HR solution

const API_BASE = '/api'
let currentUser = null
let currentView = 'login'

// State management
const state = {
  companies: [],
  users: [],
  attendance: [],
  payslips: [],
  leaveRequests: [],
  calendarEvents: [],
  messages: [],
  announcements: [],
  achievements: [],
  stats: {},
  selectedCompany: null
}

// ===== UTILITY FUNCTIONS =====
function showToast(message, type = 'success') {
  const toast = document.createElement('div')
  toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in ${
    type === 'success' ? 'bg-green-500' : 'bg-red-500'
  } text-white`
  toast.textContent = message
  document.body.appendChild(toast)
  setTimeout(() => {
    toast.remove()
  }, 3000)
}

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatDateTime(dateString) {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleString('en-US', { 
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function formatCurrency(amount) {
  return 'N$ ' + parseFloat(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function calculateWorkHours(clockIn, clockOut) {
  if (!clockIn || !clockOut) return 'N/A'
  const diff = new Date(clockOut) - new Date(clockIn)
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}h ${minutes}m`
}

// ===== API FUNCTIONS =====
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(API_BASE + endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'API request failed')
    }
    
    return await response.json()
  } catch (error) {
    console.error('API Error:', error)
    showToast(error.message || 'An error occurred', 'error')
    throw error
  }
}

// ===== AUTHENTICATION =====
async function login(email, password) {
  try {
    const result = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
    
    if (result.success) {
      currentUser = result.user
      localStorage.setItem('tulotech_user', JSON.stringify(currentUser))
      await loadDashboard()
      showToast('Welcome back, ' + currentUser.first_name + '!')
    }
  } catch (error) {
    showToast('Invalid credentials', 'error')
  }
}

function logout() {
  currentUser = null
  localStorage.removeItem('tulotech_user')
  showLoginScreen()
}

// ===== DATA LOADING FUNCTIONS =====
async function loadDashboardStats() {
  try {
    const result = await apiCall(`/stats/dashboard?company_id=${currentUser.company_id}&user_id=${currentUser.id}`)
    state.stats = result.stats
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

async function loadCompanies() {
  try {
    const result = await apiCall('/companies')
    state.companies = result.companies
  } catch (error) {
    console.error('Failed to load companies:', error)
  }
}

async function loadUsers() {
  try {
    const result = await apiCall(`/users?company_id=${currentUser.company_id}`)
    state.users = result.users
  } catch (error) {
    console.error('Failed to load users:', error)
  }
}

async function loadAttendance(userId = null, month = null) {
  try {
    let url = `/attendance?company_id=${currentUser.company_id}`
    if (userId) url += `&user_id=${userId}`
    if (month) url += `&month=${month}`
    
    const result = await apiCall(url)
    state.attendance = result.attendance
  } catch (error) {
    console.error('Failed to load attendance:', error)
  }
}

async function loadPayslips(userId = null) {
  try {
    let url = `/payslips?company_id=${currentUser.company_id}`
    if (userId) url += `&user_id=${userId}`
    
    const result = await apiCall(url)
    state.payslips = result.payslips
  } catch (error) {
    console.error('Failed to load payslips:', error)
  }
}

async function loadLeaveRequests(userId = null) {
  try {
    let url = `/leave-requests?company_id=${currentUser.company_id}`
    if (userId) url += `&user_id=${userId}`
    
    const result = await apiCall(url)
    state.leaveRequests = result.leave_requests
  } catch (error) {
    console.error('Failed to load leave requests:', error)
  }
}

async function loadCalendarEvents() {
  try {
    const result = await apiCall(`/calendar-events?company_id=${currentUser.company_id}`)
    state.calendarEvents = result.events
  } catch (error) {
    console.error('Failed to load calendar events:', error)
  }
}

async function loadMessages() {
  try {
    const result = await apiCall(`/messages?company_id=${currentUser.company_id}&user_id=${currentUser.id}`)
    state.messages = result.messages
  } catch (error) {
    console.error('Failed to load messages:', error)
  }
}

async function loadAnnouncements() {
  try {
    const result = await apiCall(`/announcements?company_id=${currentUser.company_id}`)
    state.announcements = result.announcements
  } catch (error) {
    console.error('Failed to load announcements:', error)
  }
}

async function loadAchievements(userId = null) {
  try {
    let url = `/achievements?company_id=${currentUser.company_id}`
    if (userId) url += `&user_id=${userId}`
    
    const result = await apiCall(url)
    state.achievements = result.achievements
  } catch (error) {
    console.error('Failed to load achievements:', error)
  }
}

async function loadMotivationalQuote() {
  try {
    const result = await apiCall('/motivational-quote')
    return result.quote
  } catch (error) {
    return null
  }
}

// ===== ATTENDANCE FUNCTIONS =====
async function clockIn() {
  try {
    const result = await apiCall('/attendance/clock-in', {
      method: 'POST',
      body: JSON.stringify({
        user_id: currentUser.id,
        company_id: currentUser.company_id
      })
    })
    
    if (result.success) {
      showToast('Clocked in successfully!')
      await loadAttendance(currentUser.id)
      showStaffAttendanceView()
    }
  } catch (error) {
    console.error('Clock in failed:', error)
  }
}

async function clockOut() {
  try {
    const result = await apiCall('/attendance/clock-out', {
      method: 'POST',
      body: JSON.stringify({
        user_id: currentUser.id
      })
    })
    
    if (result.success) {
      showToast('Clocked out successfully!')
      await loadAttendance(currentUser.id)
      showStaffAttendanceView()
    }
  } catch (error) {
    console.error('Clock out failed:', error)
  }
}

// ===== VIEW RENDERING =====
function renderApp() {
  const app = document.getElementById('app')
  
  if (!currentUser) {
    showLoginScreen()
    return
  }
  
  app.innerHTML = `
    <!-- Sidebar -->
    <div class="fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white shadow-xl z-10">
      <div class="p-6">
        <div class="flex items-center justify-center mb-8">
          <div class="text-center">
            <i class="fas fa-building text-4xl mb-2"></i>
            <h1 class="text-xl font-bold">${currentUser.organization_name}</h1>
            <p class="text-sm text-blue-200">${currentUser.company_name}</p>
          </div>
        </div>
        
        <div class="space-y-2" id="sidebar-menu"></div>
      </div>
      
      <div class="absolute bottom-0 w-full p-4 bg-blue-950">
        <div class="flex items-center space-x-3 mb-3">
          <div class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
            <i class="fas fa-user"></i>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">${currentUser.first_name} ${currentUser.last_name}</p>
            <p class="text-xs text-blue-300 capitalize">${currentUser.role}</p>
          </div>
        </div>
        <button onclick="logout()" class="w-full py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition-colors">
          <i class="fas fa-sign-out-alt mr-2"></i>Logout
        </button>
      </div>
    </div>
    
    <!-- Main Content -->
    <div class="ml-64 min-h-screen bg-gray-50">
      <div class="p-8">
        <div id="main-content"></div>
      </div>
    </div>
  `
  
  renderSidebarMenu()
}

function renderSidebarMenu() {
  const menu = document.getElementById('sidebar-menu')
  
  const menuItems = currentUser.role === 'admin' || currentUser.role === 'manager' ? [
    { id: 'dashboard', icon: 'tachometer-alt', label: 'Dashboard' },
    { id: 'staff', icon: 'users', label: 'Staff Management' },
    { id: 'attendance', icon: 'clock', label: 'Attendance' },
    { id: 'payslips', icon: 'money-bill-wave', label: 'Payslips' },
    { id: 'leave', icon: 'calendar-times', label: 'Leave Requests' },
    { id: 'calendar', icon: 'calendar-alt', label: 'Calendar' },
    { id: 'messages', icon: 'comments', label: 'Messages' },
    { id: 'announcements', icon: 'bullhorn', label: 'Announcements' },
    { id: 'documents', icon: 'file-alt', label: 'Documents' },
    { id: 'companies', icon: 'building', label: 'Companies' }
  ] : [
    { id: 'dashboard', icon: 'tachometer-alt', label: 'Dashboard' },
    { id: 'my-attendance', icon: 'clock', label: 'My Attendance' },
    { id: 'my-payslips', icon: 'money-bill-wave', label: 'My Payslips' },
    { id: 'my-leave', icon: 'calendar-times', label: 'My Leave' },
    { id: 'calendar', icon: 'calendar-alt', label: 'Calendar' },
    { id: 'messages', icon: 'comments', label: 'Messages' },
    { id: 'documents', icon: 'file-alt', label: 'Documents' }
  ]
  
  menu.innerHTML = menuItems.map(item => `
    <button onclick="navigate('${item.id}')" 
            class="nav-item w-full text-left px-4 py-3 rounded-lg hover:bg-blue-800 transition-colors flex items-center space-x-3"
            data-view="${item.id}">
      <i class="fas fa-${item.icon} w-5"></i>
      <span>${item.label}</span>
    </button>
  `).join('')
  
  // Highlight active view
  updateActiveMenuItem()
}

function updateActiveMenuItem() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('bg-blue-800', 'font-semibold')
    if (item.dataset.view === currentView) {
      item.classList.add('bg-blue-800', 'font-semibold')
    }
  })
}

async function navigate(view) {
  currentView = view
  updateActiveMenuItem()
  
  switch(view) {
    case 'dashboard':
      await showDashboard()
      break
    case 'staff':
      await showStaffManagement()
      break
    case 'attendance':
      await showAttendanceManagement()
      break
    case 'my-attendance':
      await showStaffAttendanceView()
      break
    case 'payslips':
      await showPayslipsManagement()
      break
    case 'my-payslips':
      await showStaffPayslipsView()
      break
    case 'leave':
      await showLeaveManagement()
      break
    case 'my-leave':
      await showStaffLeaveView()
      break
    case 'calendar':
      await showCalendarView()
      break
    case 'messages':
      await showMessagesView()
      break
    case 'announcements':
      await showAnnouncementsView()
      break
    case 'documents':
      await showDocumentsView()
      break
    case 'companies':
      await showCompaniesManagement()
      break
  }
}

// ===== LOGIN SCREEN =====
function showLoginScreen() {
  const app = document.getElementById('app')
  app.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 flex items-center justify-center p-4">
      <div class="max-w-md w-full">
        <div class="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div class="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white text-center">
            <i class="fas fa-building text-5xl mb-4"></i>
            <h1 class="text-3xl font-bold mb-2">TuloTech Africa</h1>
            <p class="text-blue-100">Human Resources Management System</p>
          </div>
          
          <form id="login-form" class="p-8 space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                <i class="fas fa-envelope mr-2"></i>Email Address
              </label>
              <input type="email" id="login-email" required
                     class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                     placeholder="your.email@company.com">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                <i class="fas fa-lock mr-2"></i>Password
              </label>
              <input type="password" id="login-password" required
                     class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                     placeholder="••••••••">
            </div>
            
            <button type="submit" 
                    class="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg">
              <i class="fas fa-sign-in-alt mr-2"></i>Sign In
            </button>
          </form>
          
          <div class="px-8 pb-8">
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
              <p class="text-blue-800 font-medium mb-2">Demo Credentials:</p>
              <p class="text-blue-700">Admin: admin@tulotech.com / admin123</p>
              <p class="text-blue-700">Staff: john.doe@sca.edu.na / staff123</p>
              <p class="text-blue-700">Manager: manager@sca.edu.na / manager123</p>
            </div>
          </div>
        </div>
        
        <div class="text-center mt-8 text-white">
          <p class="text-sm">© 2024 TuloTech Africa. All rights reserved.</p>
        </div>
      </div>
    </div>
  `
  
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = document.getElementById('login-email').value
    const password = document.getElementById('login-password').value
    await login(email, password)
  })
}

// ===== DASHBOARD =====
async function showDashboard() {
  await loadDashboardStats()
  const quote = await loadMotivationalQuote()
  
  const content = document.getElementById('main-content')
  content.innerHTML = `
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">
        <i class="fas fa-tachometer-alt mr-3 text-blue-600"></i>Dashboard
      </h1>
      <p class="text-gray-600">Welcome back, ${currentUser.first_name}! Here's your overview.</p>
    </div>
    
    <!-- Motivational Quote -->
    ${quote ? `
    <div class="mb-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white shadow-lg animate-fade-in">
      <div class="flex items-start space-x-4">
        <i class="fas fa-quote-left text-3xl opacity-50"></i>
        <div class="flex-1">
          <p class="text-lg font-medium mb-2">"${quote.quote}"</p>
          <p class="text-sm opacity-90">— ${quote.author}</p>
        </div>
      </div>
    </div>
    ` : ''}
    
    ${currentUser.role === 'admin' || currentUser.role === 'manager' ? `
    <!-- Admin Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm mb-1">Total Employees</p>
            <p class="text-3xl font-bold text-gray-800">${state.stats.total_employees || 0}</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <i class="fas fa-users text-blue-600 text-xl"></i>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm mb-1">Present Today</p>
            <p class="text-3xl font-bold text-gray-800">${state.stats.present_today || 0}</p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <i class="fas fa-check-circle text-green-600 text-xl"></i>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500 hover:shadow-xl transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm mb-1">Pending Leaves</p>
            <p class="text-3xl font-bold text-gray-800">${state.stats.pending_leaves || 0}</p>
          </div>
          <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <i class="fas fa-calendar-times text-yellow-600 text-xl"></i>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm mb-1">Upcoming Events</p>
            <p class="text-3xl font-bold text-gray-800">${state.stats.upcoming_events || 0}</p>
          </div>
          <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <i class="fas fa-calendar-alt text-purple-600 text-xl"></i>
          </div>
        </div>
      </div>
    </div>
    ` : `
    <!-- Staff Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <button onclick="clockIn()" class="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105">
        <i class="fas fa-sign-in-alt text-4xl mb-3"></i>
        <h3 class="text-xl font-bold">Clock In</h3>
        <p class="text-sm opacity-90">Start your work day</p>
      </button>
      
      <button onclick="clockOut()" class="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105">
        <i class="fas fa-sign-out-alt text-4xl mb-3"></i>
        <h3 class="text-xl font-bold">Clock Out</h3>
        <p class="text-sm opacity-90">End your work day</p>
      </button>
      
      <button onclick="navigate('my-leave')" class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105">
        <i class="fas fa-calendar-times text-4xl mb-3"></i>
        <h3 class="text-xl font-bold">Request Leave</h3>
        <p class="text-sm opacity-90">Submit leave application</p>
      </button>
    </div>
    `}
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <i class="fas fa-bullhorn mr-3 text-blue-600"></i>Recent Announcements
        </h3>
        <div id="announcements-list"></div>
      </div>
      
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <i class="fas fa-calendar-alt mr-3 text-purple-600"></i>Upcoming Events
        </h3>
        <div id="events-list"></div>
      </div>
    </div>
  `
  
  // Load announcements and events
  await loadAnnouncements()
  await loadCalendarEvents()
  
  renderDashboardAnnouncements()
  renderDashboardEvents()
}

function renderDashboardAnnouncements() {
  const list = document.getElementById('announcements-list')
  const recent = state.announcements.slice(0, 5)
  
  if (recent.length === 0) {
    list.innerHTML = '<p class="text-gray-500 text-center py-4">No announcements</p>'
    return
  }
  
  list.innerHTML = recent.map(ann => `
    <div class="mb-4 pb-4 border-b last:border-0">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <h4 class="font-semibold text-gray-800">${ann.title}</h4>
          <p class="text-sm text-gray-600 mt-1">${ann.content.substring(0, 100)}${ann.content.length > 100 ? '...' : ''}</p>
          <p class="text-xs text-gray-400 mt-2">
            <i class="fas fa-clock mr-1"></i>${formatDate(ann.created_at)}
          </p>
        </div>
        <span class="px-2 py-1 text-xs rounded ${
          ann.priority === 'high' ? 'bg-red-100 text-red-700' : 
          ann.priority === 'normal' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
        }">${ann.priority}</span>
      </div>
    </div>
  `).join('')
}

function renderDashboardEvents() {
  const list = document.getElementById('events-list')
  const upcoming = state.calendarEvents
    .filter(e => new Date(e.start_date) > new Date())
    .slice(0, 5)
  
  if (upcoming.length === 0) {
    list.innerHTML = '<p class="text-gray-500 text-center py-4">No upcoming events</p>'
    return
  }
  
  list.innerHTML = upcoming.map(event => `
    <div class="mb-4 pb-4 border-b last:border-0">
      <div class="flex items-start space-x-3">
        <div class="w-2 h-full rounded" style="background-color: ${event.color}"></div>
        <div class="flex-1">
          <h4 class="font-semibold text-gray-800">${event.title}</h4>
          ${event.description ? `<p class="text-sm text-gray-600 mt-1">${event.description}</p>` : ''}
          <p class="text-xs text-gray-400 mt-2">
            <i class="fas fa-calendar mr-1"></i>${formatDate(event.start_date)}
          </p>
        </div>
        <span class="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700 capitalize">${event.event_type}</span>
      </div>
    </div>
  `).join('')
}

async function loadDashboard() {
  renderApp()
  await showDashboard()
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  // Check if user is logged in
  const savedUser = localStorage.getItem('tulotech_user')
  if (savedUser) {
    currentUser = JSON.parse(savedUser)
    loadDashboard()
  } else {
    showLoginScreen()
  }
})
