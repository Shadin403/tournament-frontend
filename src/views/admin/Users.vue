<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import api from '@/services/api'
import Swal from 'sweetalert2'

const props = defineProps({
  roleType: { type: String, default: '' } // 'staff' or 'player'
})

const users = ref([])
const loading = ref(false)
const search = ref('')

const filters = reactive({ 
  role: props.roleType === 'staff' ? 'admin' : (props.roleType === 'player' ? 'user' : ''), 
  status: '' 
})

// Watch for prop changes to re-filter
watch(() => props.roleType, (newVal) => {
  filters.role = newVal === 'staff' ? 'admin' : (newVal === 'player' ? 'user' : '')
  fetchUsers(1)
})

const viewTitle = computed(() => {
  if (props.roleType === 'staff') return 'Staff List'
  if (props.roleType === 'player') return 'Players List'
  return 'Users List'
})

const viewSubtitle = computed(() => {
  if (props.roleType === 'staff') return 'Manage and monitor admins and moderators'
  if (props.roleType === 'player') return 'Manage and monitor platform players'
  return 'Manage and monitor all platform users'
})
const showModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const editingId = ref(null)

const pagination = ref({
  current_page: 1,
  last_page: 1,
  total: 0
})

const form = reactive({
  name: '',
  username: '',
  email: '',
  password: '',
  role: 'user',
  status: 'active',
  permissions: []
})

let timer = null
function debounceSearch() {
  clearTimeout(timer)
  timer = setTimeout(fetchUsers, 400)
}

async function fetchUsers(page = 1) {
  loading.value = true
  try {
    const params = { page, search: search.value, ...filters }
    const { data } = await api.get('/admin/users', { params })
    users.value = data.data.data
    pagination.value = { 
      current_page: data.data.current_page, 
      last_page: data.data.last_page, 
      total: data.data.total 
    }
  } catch(e) {
    console.error(e)
  } finally { 
    loading.value = false 
  }
}

function openCreateModal() {
  isEditing.value = false
  editingId.value = null
  Object.assign(form, {
    name: '',
    username: '',
    email: '',
    password: '',
    role: props.roleType === 'staff' ? 'admin' : 'user',
    status: 'active',
    permissions: []
  })
  showModal.value = true
}

function editUser(user) {
  isEditing.value = true
  editingId.value = user.id
  Object.assign(form, {
    name: user.name,
    username: user.username,
    email: user.email,
    password: '',
    role: user.role,
    status: user.status || 'active',
    permissions: user.permissions || []
  })
  showModal.value = true
}

async function saveUser() {
  saving.value = true
  try {
    if (isEditing.value) {
      await api.put(`/admin/users/${editingId.value}`, form)
      Swal.fire({ icon: 'success', title: 'User Updated', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 })
    } else {
      await api.post('/admin/users', form)
      Swal.fire({ icon: 'success', title: 'User Created', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 })
    }
    showModal.value = false
    fetchUsers()
  } catch(e) {
    Swal.fire({ icon: 'error', title: 'Error', text: e.response?.data?.message || 'Something went wrong' })
  } finally {
    saving.value = false
  }
}

async function banUser(user) {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: `You want to ban ${user.name}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ff3e1d',
    confirmButtonText: 'Yes, ban them!',
    background: '#fff',
  })
  
  if (result.isConfirmed) {
    try { 
      await api.post(`/admin/users/${user.id}/ban`)
      user.status = 'banned'
      Swal.fire({ icon: 'success', title: 'Banned!', text: 'User has been banned.', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 })
    } catch {}
  }
}

async function unbanUser(user) {
  try { 
    await api.post(`/admin/users/${user.id}/unban`)
    user.status = 'active'
    Swal.fire({ icon: 'success', title: 'Unbanned!', text: 'User is active again.', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 })
  } catch {}
}

function avatarUrl(u) {
  return u.avatar ? `/storage/${u.avatar}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=696cff&color=fff&size=100`
}

const showBalanceModal = ref(false)
const balanceForm = reactive({ amount: 0, type: 'add', note: 'Admin added balance' })
const balanceUser = ref(null)

async function deleteUser(user) {
  const result = await Swal.fire({
    title: 'Delete User?',
    text: `Are you sure you want to permanently delete ${user.name}? This action cannot be undone.`,
    icon: 'error',
    showCancelButton: true,
    confirmButtonColor: '#ff3e1d',
    confirmButtonText: 'Yes, delete forever'
  })

  if (result.isConfirmed) {
    try {
      await api.delete(`/admin/users/${user.id}`)
      Swal.fire({ icon: 'success', title: 'Deleted!', text: 'User has been removed.', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 })
      fetchUsers()
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to delete user.' })
    }
  }
}

function openBalanceModal(user) {
  balanceUser.value = user
  balanceForm.amount = 0
  balanceForm.note = 'Admin added balance'
  showBalanceModal.value = true
}

async function updateBalance() {
  if (balanceForm.amount <= 0) return
  
  try {
    await api.post(`/admin/users/${balanceUser.value.id}/update-balance`, balanceForm)
    Swal.fire({ icon: 'success', title: 'Balance Updated!', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 })
    showBalanceModal.value = false
    fetchUsers()
  } catch (e) {
    Swal.fire({ icon: 'error', title: 'Error', text: e.response?.data?.message || 'Failed to update balance' })
  }
}

function getRoleColor(role) {
  const map = {
    admin: 'primary',
    moderator: 'info',
    user: 'secondary'
  }
  return map[role] || 'secondary'
}

onMounted(() => fetchUsers())
</script>

<template>
  <div>
    <VRow>
      <VCol cols="12">
        <div class="d-flex justify-space-between align-center mb-4">
          <div>
            <h3 class="text-h4 mb-1">{{ viewTitle }}</h3>
            <p class="text-subtitle-1 text-disabled">{{ viewSubtitle }}</p>
          </div>
          <div class="d-flex gap-4 align-center">
            <VChip
              color="primary"
              variant="tonal"
              size="small"
              class="d-none d-sm-flex"
            >
              {{ pagination.total }} Total Users
            </VChip>
            <VBtn
              prepend-icon="bx-plus"
              @click="openCreateModal"
            >
              Add New User
            </VBtn>
          </div>
        </div>
      </VCol>

      <!-- Filters -->
      <VCol cols="12">
        <VCard>
          <VCardText>
            <VRow>
              <VCol cols="12" md="6">
                <VTextField
                  v-model="search"
                  label="Search users"
                  placeholder="Name, Username or Email"
                  prepend-inner-icon="bx-search"
                  density="compact"
                  hide-details
                  @input="debounceSearch"
                />
              </VCol>
              <VCol cols="12" md="3">
                <VSelect
                  v-model="filters.role"
                  label="Role"
                  :items="[
                    { title: 'All Roles', value: '' },
                    { title: 'Admin', value: 'admin' },
                    { title: 'Moderator', value: 'moderator' },
                    { title: 'User', value: 'user' },
                  ]"
                  density="compact"
                  hide-details
                  @update:model-value="fetchUsers(1)"
                />
              </VCol>
              <VCol cols="12" md="3">
                <VSelect
                  v-model="filters.status"
                  label="Status"
                  :items="[
                    { title: 'All Status', value: '' },
                    { title: 'Active', value: 'active' },
                    { title: 'Banned', value: 'banned' },
                  ]"
                  density="compact"
                  hide-details
                  @update:model-value="fetchUsers(1)"
                />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Users Table -->
      <VCol cols="12">
        <VCard>
          <VTable class="text-no-wrap">
            <thead>
              <tr>
                <th class="text-uppercase">User</th>
                <th class="text-uppercase">Email</th>
                <th class="text-uppercase text-center">Role</th>
                <th class="text-uppercase text-center">Status</th>
                <th class="text-uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>
                  <div class="d-flex align-center gap-3">
                    <VAvatar size="38">
                      <VImg :src="avatarUrl(user)" />
                    </VAvatar>
                    <div class="d-flex flex-column">
                      <span class="font-weight-bold text-high-emphasis">{{ user.name }}</span>
                      <span class="text-xs text-disabled">@{{ user.username }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="text-sm">{{ user.email }}</span>
                </td>
                <td class="text-center">
                  <VChip
                    :color="getRoleColor(user.role)"
                    size="x-small"
                    label
                    class="text-uppercase font-weight-bold"
                  >
                    {{ user.role }}
                  </VChip>
                </td>
                <td class="text-center">
                  <div class="d-flex align-center justify-center gap-1">
                    <VIcon
                      icon="bxs-circle"
                      size="8"
                      :color="user.status === 'banned' ? 'error' : 'success'"
                    />
                    <span :class="user.status === 'banned' ? 'text-error' : 'text-success'" class="text-sm text-capitalize font-weight-medium">
                      {{ user.status || 'active' }}
                    </span>
                  </div>
                </td>
                <td class="text-right">
                  <VBtn
                    v-if="props.roleType === 'player'"
                    icon="bx-wallet-alt"
                    variant="text"
                    color="success"
                    size="small"
                    title="Add Balance"
                    @click="openBalanceModal(user)"
                  />
                  <VBtn
                    icon="bx-edit-alt"
                    variant="text"
                    color="secondary"
                    size="small"
                    title="Edit User"
                    @click="editUser(user)"
                  />
                  <VBtn
                    v-if="user.status !== 'banned'"
                    icon="bx-block"
                    variant="text"
                    color="warning"
                    size="small"
                    title="Ban User"
                    @click="banUser(user)"
                  />
                  <VBtn
                    v-else
                    icon="bx-check-circle"
                    variant="text"
                    color="success"
                    size="small"
                    title="Unban User"
                    @click="unbanUser(user)"
                  />
                  <VBtn
                    icon="bx-trash"
                    variant="text"
                    color="error"
                    size="small"
                    title="Delete User"
                    @click="deleteUser(user)"
                  />
                </td>
              </tr>
              <tr v-if="!users.length && !loading">
                <td colspan="5" class="text-center py-10 text-disabled italic">
                  No users found.
                </td>
              </tr>
            </tbody>
          </VTable>

          <!-- Pagination -->
          <VDivider />
          <VCardText class="d-flex align-center justify-space-between flex-wrap gap-4 py-3">
            <span class="text-sm text-disabled">
              Showing page {{ pagination.current_page }} of {{ pagination.last_page }}
            </span>

            <VPagination
              v-model="pagination.current_page"
              :length="pagination.last_page"
              :total-visible="5"
              density="compact"
              @update:model-value="fetchUsers"
            />
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- User Modal -->
    <VDialog
      v-model="showModal"
      max-width="600"
      persistent
    >
      <VCard :title="isEditing ? 'Edit User' : 'Create New User'">
        <VBtn
          icon="bx-x"
          variant="text"
          color="secondary"
          class="position-absolute"
          style="top: 0.75rem; right: 0.75rem;"
          @click="showModal = false"
        />

        <VCardText>
          <VForm @submit.prevent="saveUser">
            <VRow>
              <VCol cols="12">
                <VTextField
                  v-model="form.name"
                  label="Full Name"
                  placeholder="John Doe"
                  required
                />
              </VCol>
              <VCol cols="12" md="6">
                <VTextField
                  v-model="form.username"
                  label="Username"
                  placeholder="johndoe"
                  required
                />
              </VCol>
              <VCol cols="12" md="6">
                <VTextField
                  v-model="form.email"
                  label="Email"
                  type="email"
                  placeholder="john@example.com"
                  required
                />
              </VCol>
              <VCol cols="12" md="6">
                <VTextField
                  v-model="form.password"
                  label="Password"
                  type="password"
                  :placeholder="isEditing ? 'Leave blank to keep current' : 'Enter password'"
                  :required="!isEditing"
                />
              </VCol>
              <VCol cols="12" md="6">
                <VSelect
                  v-model="form.role"
                  label="Role"
                  :items="['admin', 'moderator', 'user']"
                  required
                />
              </VCol>
              <VCol cols="12" md="6">
                <VSelect
                  v-model="form.status"
                  label="Status"
                  :items="['active', 'banned']"
                />
              </VCol>

              <!-- Permissions for Staff -->
              <VCol cols="12" v-if="form.role !== 'user'">
                <div class="text-subtitle-1 font-weight-bold mb-2">Staff Permissions</div>
                <div class="d-flex flex-wrap gap-4">
                  <VCheckbox
                    v-model="form.permissions"
                    label="Dashboard"
                    value="view_dashboard"
                    density="compact"
                    hide-details
                  />
                  <VCheckbox
                    v-model="form.permissions"
                    label="Matches"
                    value="manage_matches"
                    density="compact"
                    hide-details
                  />
                  <VCheckbox
                    v-model="form.permissions"
                    label="Users"
                    value="manage_users"
                    density="compact"
                    hide-details
                  />
                  <VCheckbox
                    v-model="form.permissions"
                    label="Finance"
                    value="manage_finance"
                    density="compact"
                    hide-details
                  />
                  <VCheckbox
                    v-model="form.permissions"
                    label="Settings"
                    value="manage_settings"
                    density="compact"
                    hide-details
                  />
                </div>
              </VCol>

              <VCol cols="12" class="d-flex gap-4 mt-4">
                <VBtn
                  color="secondary"
                  variant="tonal"
                  @click="showModal = false"
                >
                  Cancel
                </VBtn>
                <VSpacer />
                <VBtn
                  type="submit"
                  :loading="saving"
                >
                  {{ isEditing ? 'Update User' : 'Create User' }}
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VDialog>

    <!-- Balance Adjustment Modal -->
    <VDialog
      v-model="showBalanceModal"
      max-width="400"
    >
      <VCard title="Update User Balance">
        <VCardText>
          <div v-if="balanceUser" class="mb-4">
            <span class="text-disabled">Updating for:</span>
            <div class="font-weight-bold">{{ balanceUser.name }}</div>
          </div>

          <VRow>
            <VCol cols="12">
              <VTextField
                v-model="balanceForm.amount"
                label="Amount (৳)"
                type="number"
                prefix="৳"
                placeholder="0"
                required
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="balanceForm.note"
                label="Note / Reason"
                placeholder="e.g. Prize money or Manual Deposit"
              />
            </VCol>
            <VCol cols="12" class="d-flex gap-4 mt-2">
              <VBtn
                color="secondary"
                variant="tonal"
                @click="showBalanceModal = false"
              >
                Cancel
              </VBtn>
              <VSpacer />
              <VBtn
                color="success"
                @click="updateBalance"
                :disabled="balanceForm.amount <= 0"
              >
                Add Balance
              </VBtn>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VDialog>
  </div>
</template>

<style lang="scss" scoped>
.v-table {
  thead {
    background-color: rgba(var(--v-theme-on-surface), 0.04);
  }
}
</style>
