// TuloTech Africa HR System - Calendar, Messages, Documents, Companies (Part 4)

// ===== CALENDAR VIEW =====
async function showCalendarView() {
  await loadCalendarEvents()
  
  const content = document.getElementById('main-content')
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'manager'
  
  content.innerHTML = `
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-800 mb-2">
          <i class="fas fa-calendar-alt mr-3 text-purple-600"></i>Calendar & Events
        </h1>
        <p class="text-gray-600">Company events, holidays, and meetings</p>
      </div>
      ${isAdmin ? `
        <button onclick="showAddEventModal()" class="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors shadow-lg">
          <i class="fas fa-plus mr-2"></i>Add Event
        </button>
      ` : ''}
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2">
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h3 class="text-xl font-bold text-gray-800 mb-6">Upcoming Events</h3>
          <div class="space-y-4">
            ${state.calendarEvents
              .filter(e => new Date(e.start_date) >= new Date())
              .slice(0, 10)
              .map(event => `
                <div class="border-l-4 pl-4 py-3 hover:bg-gray-50 rounded-r-lg transition-colors" style="border-color: ${event.color}">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <h4 class="font-bold text-gray-800">${event.title}</h4>
                      ${event.description ? `<p class="text-sm text-gray-600 mt-1">${event.description}</p>` : ''}
                      <div class="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span><i class="fas fa-calendar mr-1"></i>${formatDate(event.start_date)}</span>
                        ${event.location ? `<span><i class="fas fa-map-marker-alt mr-1"></i>${event.location}</span>` : ''}
                        ${event.organizer_first_name ? `<span><i class="fas fa-user mr-1"></i>${event.organizer_first_name} ${event.organizer_last_name}</span>` : ''}
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <span class="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700 capitalize">${event.event_type}</span>
                      ${isAdmin ? `
                        <button onclick="deleteEvent(${event.id})" class="text-red-600 hover:text-red-800">
                          <i class="fas fa-trash"></i>
                        </button>
                      ` : ''}
                    </div>
                  </div>
                </div>
              `).join('')}
          </div>
        </div>
      </div>
      
      <div>
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h3 class="text-xl font-bold text-gray-800 mb-4">Event Types</h3>
          <div class="space-y-2">
            ${[
              { type: 'holiday', label: 'Holidays', icon: 'star', color: 'red' },
              { type: 'meeting', label: 'Meetings', icon: 'users', color: 'blue' },
              { type: 'training', label: 'Training', icon: 'graduation-cap', color: 'green' },
              { type: 'celebration', label: 'Celebrations', icon: 'birthday-cake', color: 'pink' },
              { type: 'deadline', label: 'Deadlines', icon: 'exclamation-triangle', color: 'orange' }
            ].map(item => {
              const count = state.calendarEvents.filter(e => e.event_type === item.type).length
              return `
                <div class="flex items-center justify-between p-3 rounded-lg bg-${item.color}-50">
                  <div class="flex items-center space-x-3">
                    <i class="fas fa-${item.icon} text-${item.color}-600"></i>
                    <span class="text-gray-700">${item.label}</span>
                  </div>
                  <span class="font-bold text-${item.color}-600">${count}</span>
                </div>
              `
            }).join('')}
          </div>
        </div>
      </div>
    </div>
  `
}

function showAddEventModal() {
  showModal(`
    <h3 class="text-2xl font-bold mb-4">Add Calendar Event</h3>
    <form id="add-event-form" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
        <input type="text" name="title" required class="w-full px-3 py-2 border rounded-lg">
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea name="description" rows="3" class="w-full px-3 py-2 border rounded-lg"></textarea>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
        <select name="event_type" required class="w-full px-3 py-2 border rounded-lg">
          <option value="meeting">Meeting</option>
          <option value="holiday">Holiday</option>
          <option value="training">Training</option>
          <option value="celebration">Celebration</option>
          <option value="deadline">Deadline</option>
          <option value="other">Other</option>
        </select>
      </div>
      
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input type="datetime-local" name="start_date" required class="w-full px-3 py-2 border rounded-lg">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">End Date (Optional)</label>
          <input type="datetime-local" name="end_date" class="w-full px-3 py-2 border rounded-lg">
        </div>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Location (Optional)</label>
        <input type="text" name="location" class="w-full px-3 py-2 border rounded-lg">
      </div>
      
      <div>
        <label class="flex items-center space-x-2">
          <input type="checkbox" name="is_all_day" class="rounded">
          <span class="text-sm text-gray-700">All Day Event</span>
        </label>
      </div>
      
      <button type="submit" class="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700">
        Add Event
      </button>
    </form>
  `)
  
  document.getElementById('add-event-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData)
    data.company_id = currentUser.company_id
    data.organizer_id = currentUser.id
    data.is_all_day = formData.get('is_all_day') ? 1 : 0
    
    try {
      await apiCall('/calendar-events', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      showToast('Event added successfully!')
      closeModal()
      await showCalendarView()
    } catch (error) {
      // Error already shown
    }
  })
}

async function deleteEvent(eventId) {
  if (!confirm('Delete this event?')) return
  
  try {
    await apiCall(`/calendar-events/${eventId}`, {
      method: 'DELETE'
    })
    showToast('Event deleted')
    await showCalendarView()
  } catch (error) {
    // Error already shown
  }
}

// ===== MESSAGES VIEW =====
async function showMessagesView() {
  await loadMessages()
  
  const content = document.getElementById('main-content')
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'manager'
  
  content.innerHTML = `
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-800 mb-2">
          <i class="fas fa-comments mr-3 text-blue-600"></i>Messages & Communications
        </h1>
        <p class="text-gray-600">Internal messaging and announcements</p>
      </div>
      <button onclick="showComposeMessageModal()" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg">
        <i class="fas fa-plus mr-2"></i>Compose Message
      </button>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2">
        <div class="bg-white rounded-xl shadow-lg">
          <div class="p-4 border-b">
            <div class="flex space-x-2">
              <button onclick="filterMessages('all')" class="px-4 py-2 rounded-lg bg-blue-100 text-blue-700 font-medium">All</button>
              <button onclick="filterMessages('sent')" class="px-4 py-2 rounded-lg hover:bg-gray-100">Sent</button>
              <button onclick="filterMessages('received')" class="px-4 py-2 rounded-lg hover:bg-gray-100">Received</button>
              <button onclick="filterMessages('announcements')" class="px-4 py-2 rounded-lg hover:bg-gray-100">Announcements</button>
            </div>
          </div>
          <div class="divide-y" id="messages-list">
            ${state.messages.map(msg => `
              <div class="p-4 hover:bg-gray-50 cursor-pointer ${msg.is_read ? '' : 'bg-blue-50'}" onclick="viewMessage(${msg.id})">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-2">
                      ${msg.is_announcement ? `
                        <span class="px-2 py-1 text-xs rounded bg-red-100 text-red-700 font-bold">
                          <i class="fas fa-bullhorn mr-1"></i>ANNOUNCEMENT
                        </span>
                      ` : ''}
                      ${msg.priority === 'urgent' ? `
                        <span class="px-2 py-1 text-xs rounded bg-red-100 text-red-700">URGENT</span>
                      ` : msg.priority === 'high' ? `
                        <span class="px-2 py-1 text-xs rounded bg-orange-100 text-orange-700">HIGH</span>
                      ` : ''}
                      ${!msg.is_read ? `
                        <span class="w-2 h-2 bg-blue-600 rounded-full"></span>
                      ` : ''}
                    </div>
                    <h4 class="font-semibold text-gray-800">${msg.subject || 'No Subject'}</h4>
                    <p class="text-sm text-gray-600 mt-1">${msg.message.substring(0, 100)}${msg.message.length > 100 ? '...' : ''}</p>
                    <div class="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span><i class="fas fa-user mr-1"></i>${msg.sender_first_name} ${msg.sender_last_name}</span>
                      <span><i class="fas fa-clock mr-1"></i>${formatDateTime(msg.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      
      <div>
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h3 class="text-xl font-bold text-gray-800 mb-4">Message Stats</h3>
          <div class="space-y-4">
            <div class="bg-blue-50 rounded-lg p-4">
              <p class="text-sm text-blue-700">Total Messages</p>
              <p class="text-2xl font-bold text-blue-800">${state.messages.length}</p>
            </div>
            <div class="bg-green-50 rounded-lg p-4">
              <p class="text-sm text-green-700">Read</p>
              <p class="text-2xl font-bold text-green-800">${state.messages.filter(m => m.is_read).length}</p>
            </div>
            <div class="bg-orange-50 rounded-lg p-4">
              <p class="text-sm text-orange-700">Unread</p>
              <p class="text-2xl font-bold text-orange-800">${state.messages.filter(m => !m.is_read).length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}

function showComposeMessageModal() {
  showModal(`
    <h3 class="text-2xl font-bold mb-4">Compose Message</h3>
    <form id="compose-message-form" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">To</label>
        <select name="recipient_id" class="w-full px-3 py-2 border rounded-lg">
          <option value="">All Staff (Announcement)</option>
          ${state.users.filter(u => u.id !== currentUser.id).map(user => `
            <option value="${user.id}">${user.first_name} ${user.last_name} (${user.department})</option>
          `).join('')}
        </select>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
        <select name="priority" class="w-full px-3 py-2 border rounded-lg">
          <option value="normal">Normal</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Subject</label>
        <input type="text" name="subject" required class="w-full px-3 py-2 border rounded-lg">
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Message</label>
        <textarea name="message" rows="6" required class="w-full px-3 py-2 border rounded-lg"></textarea>
      </div>
      
      <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
        <i class="fas fa-paper-plane mr-2"></i>Send Message
      </button>
    </form>
  `)
  
  document.getElementById('compose-message-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData)
    data.company_id = currentUser.company_id
    data.sender_id = currentUser.id
    data.is_announcement = !data.recipient_id ? 1 : 0
    
    if (!data.recipient_id) {
      delete data.recipient_id
    }
    
    try {
      await apiCall('/messages', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      showToast('Message sent successfully!')
      closeModal()
      await showMessagesView()
    } catch (error) {
      // Error already shown
    }
  })
}

async function viewMessage(messageId) {
  const message = state.messages.find(m => m.id === messageId)
  if (!message) return
  
  // Mark as read
  if (!message.is_read && message.recipient_id === currentUser.id) {
    await apiCall(`/messages/${messageId}/read`, {
      method: 'PUT'
    })
  }
  
  showModal(`
    <div class="mb-4">
      ${message.is_announcement ? `
        <span class="px-3 py-1 text-sm rounded bg-red-100 text-red-700 font-bold">
          <i class="fas fa-bullhorn mr-1"></i>ANNOUNCEMENT
        </span>
      ` : ''}
      ${message.priority === 'urgent' ? `
        <span class="px-3 py-1 text-sm rounded bg-red-100 text-red-700 ml-2">URGENT</span>
      ` : ''}
    </div>
    
    <h3 class="text-2xl font-bold mb-4">${message.subject || 'No Subject'}</h3>
    
    <div class="bg-gray-50 rounded-lg p-4 mb-4">
      <div class="flex items-center justify-between text-sm">
        <div>
          <p class="text-gray-600">From:</p>
          <p class="font-semibold">${message.sender_first_name} ${message.sender_last_name}</p>
        </div>
        ${message.recipient_first_name ? `
          <div>
            <p class="text-gray-600">To:</p>
            <p class="font-semibold">${message.recipient_first_name} ${message.recipient_last_name}</p>
          </div>
        ` : ''}
        <div>
          <p class="text-gray-600">Date:</p>
          <p class="font-semibold">${formatDateTime(message.created_at)}</p>
        </div>
      </div>
    </div>
    
    <div class="prose max-w-none">
      <p class="text-gray-800 whitespace-pre-wrap">${message.message}</p>
    </div>
  `)
}

// ===== DOCUMENTS VIEW =====
async function showDocumentsView() {
  const result = await apiCall(`/policy-documents?company_id=${currentUser.company_id}`)
  const documents = result.documents
  
  const content = document.getElementById('main-content')
  content.innerHTML = `
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">
        <i class="fas fa-file-alt mr-3 text-indigo-600"></i>Policy Documents
      </h1>
      <p class="text-gray-600">Access company policies and documentation</p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      ${documents.map(doc => `
        <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div class="flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-lg mb-4">
            <i class="fas fa-file-pdf text-3xl text-indigo-600"></i>
          </div>
          <h3 class="text-lg font-bold text-gray-800 mb-2">${doc.title}</h3>
          ${doc.description ? `<p class="text-sm text-gray-600 mb-4">${doc.description}</p>` : ''}
          <div class="flex items-center justify-between text-xs text-gray-500 mb-4">
            <span><i class="fas fa-tag mr-1"></i>${doc.category || 'General'}</span>
            <span><i class="fas fa-clock mr-1"></i>${formatDate(doc.created_at)}</span>
          </div>
          <div class="flex space-x-2">
            <button onclick="viewDocument(${doc.id})" class="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm">
              <i class="fas fa-eye mr-1"></i>View
            </button>
            <button onclick="downloadDocument(${doc.id})" class="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 text-sm">
              <i class="fas fa-download mr-1"></i>Download
            </button>
          </div>
        </div>
      `).join('')}
    </div>
    
    ${documents.length === 0 ? `
      <div class="bg-white rounded-xl shadow-lg p-12 text-center">
        <i class="fas fa-file-alt text-6xl text-gray-300 mb-4"></i>
        <p class="text-gray-600 text-lg">No documents available</p>
      </div>
    ` : ''}
  `
}

async function viewDocument(documentId) {
  showToast('Document viewer will be implemented with PDF.js library')
}

function downloadDocument(documentId) {
  showToast('Document download functionality available')
}

// ===== COMPANIES MANAGEMENT (Admin Only) =====
async function showCompaniesManagement() {
  await loadCompanies()
  
  const content = document.getElementById('main-content')
  content.innerHTML = `
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-800 mb-2">
          <i class="fas fa-building mr-3 text-blue-600"></i>Companies Management
        </h1>
        <p class="text-gray-600">Manage multiple companies under TuloTech Africa</p>
      </div>
      <button onclick="showAddCompanyModal()" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg">
        <i class="fas fa-plus mr-2"></i>Add Company
      </button>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      ${state.companies.map(company => `
        <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
          <div class="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
            <div class="flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-4">
              <i class="fas fa-building text-3xl"></i>
            </div>
            <h3 class="text-2xl font-bold">${company.name}</h3>
          </div>
          <div class="p-6">
            <div class="space-y-3 text-sm">
              <div>
                <p class="text-gray-600">Organization:</p>
                <p class="font-semibold text-gray-800">${company.organization_name}</p>
              </div>
              ${company.registration_number ? `
                <div>
                  <p class="text-gray-600">Registration:</p>
                  <p class="font-semibold text-gray-800">${company.registration_number}</p>
                </div>
              ` : ''}
              ${company.contact_email ? `
                <div>
                  <p class="text-gray-600">Email:</p>
                  <p class="font-semibold text-gray-800">${company.contact_email}</p>
                </div>
              ` : ''}
              ${company.contact_phone ? `
                <div>
                  <p class="text-gray-600">Phone:</p>
                  <p class="font-semibold text-gray-800">${company.contact_phone}</p>
                </div>
              ` : ''}
            </div>
            <div class="mt-6 pt-4 border-t">
              <p class="text-xs text-gray-500">Created ${formatDate(company.created_at)}</p>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `
}

function showAddCompanyModal() {
  showModal(`
    <h3 class="text-2xl font-bold mb-4">Add New Company</h3>
    <form id="add-company-form" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
        <input type="text" name="name" required class="w-full px-3 py-2 border rounded-lg">
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
        <input type="text" name="organization_name" value="TuloTech Africa" class="w-full px-3 py-2 border rounded-lg">
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
        <input type="text" name="registration_number" class="w-full px-3 py-2 border rounded-lg">
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
        <textarea name="address" rows="3" class="w-full px-3 py-2 border rounded-lg"></textarea>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
        <input type="email" name="contact_email" class="w-full px-3 py-2 border rounded-lg">
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
        <input type="tel" name="contact_phone" class="w-full px-3 py-2 border rounded-lg">
      </div>
      
      <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
        Add Company
      </button>
    </form>
  `)
  
  document.getElementById('add-company-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData)
    
    try {
      await apiCall('/companies', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      showToast('Company added successfully!')
      closeModal()
      await showCompaniesManagement()
    } catch (error) {
      // Error already shown
    }
  })
}

// ===== ANNOUNCEMENTS VIEW =====
async function showAnnouncementsView() {
  await loadAnnouncements()
  
  const content = document.getElementById('main-content')
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'manager'
  
  content.innerHTML = `
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-800 mb-2">
          <i class="fas fa-bullhorn mr-3 text-red-600"></i>Announcements
        </h1>
        <p class="text-gray-600">Company-wide announcements and news</p>
      </div>
      ${isAdmin ? `
        <button onclick="showAddAnnouncementModal()" class="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors shadow-lg">
          <i class="fas fa-plus mr-2"></i>New Announcement
        </button>
      ` : ''}
    </div>
    
    <div class="space-y-6">
      ${state.announcements.map(ann => `
        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
          <div class="bg-gradient-to-r ${
            ann.priority === 'high' ? 'from-red-500 to-red-600' :
            ann.priority === 'normal' ? 'from-blue-500 to-blue-600' :
            'from-gray-500 to-gray-600'
          } p-6 text-white">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <h3 class="text-2xl font-bold mb-2">${ann.title}</h3>
                <div class="flex items-center space-x-4 text-sm opacity-90">
                  <span><i class="fas fa-user mr-1"></i>${ann.first_name} ${ann.last_name}</span>
                  <span><i class="fas fa-clock mr-1"></i>${formatDate(ann.created_at)}</span>
                  ${ann.category ? `<span><i class="fas fa-tag mr-1"></i>${ann.category}</span>` : ''}
                </div>
              </div>
              <div>
                <span class="px-3 py-1 bg-white bg-opacity-20 rounded-lg text-sm font-semibold uppercase">${ann.priority}</span>
              </div>
            </div>
          </div>
          <div class="p-6">
            <p class="text-gray-700 whitespace-pre-wrap">${ann.content}</p>
          </div>
        </div>
      `).join('')}
    </div>
    
    ${state.announcements.length === 0 ? `
      <div class="bg-white rounded-xl shadow-lg p-12 text-center">
        <i class="fas fa-bullhorn text-6xl text-gray-300 mb-4"></i>
        <p class="text-gray-600 text-lg">No announcements yet</p>
      </div>
    ` : ''}
  `
}

function showAddAnnouncementModal() {
  showModal(`
    <h3 class="text-2xl font-bold mb-4">New Announcement</h3>
    <form id="add-announcement-form" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input type="text" name="title" required class="w-full px-3 py-2 border rounded-lg">
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Content</label>
        <textarea name="content" rows="6" required class="w-full px-3 py-2 border rounded-lg"></textarea>
      </div>
      
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <input type="text" name="category" class="w-full px-3 py-2 border rounded-lg" placeholder="e.g., General, HR, IT">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select name="priority" class="w-full px-3 py-2 border rounded-lg">
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
      
      <button type="submit" class="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700">
        Post Announcement
      </button>
    </form>
  `)
  
  document.getElementById('add-announcement-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData)
    data.company_id = currentUser.company_id
    data.posted_by = currentUser.id
    
    try {
      await apiCall('/announcements', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      showToast('Announcement posted successfully!')
      closeModal()
      await showAnnouncementsView()
    } catch (error) {
      // Error already shown
    }
  })
}

// ===== HELPER FUNCTIONS =====
function filterMessages(filter) {
  // Implementation for filtering messages
  showToast(`Filtering: ${filter}`)
}
