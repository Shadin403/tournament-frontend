<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '@/services/api'
import Swal from 'sweetalert2'

const matches = ref([])
const gameModes = ref([])
const search = ref('')
const filters = reactive({ status: '', game_mode: '' })
const showModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const editingId = ref(null)
const prizeList = ref([{ label: '1st', value: 0 }])

const form = reactive({
  title: '',
  game_mode_id: '',
  mode: 'solo',
  type: 'paid',
  entry_fee: 10,
  prize_pool: 50,
  max_players: 48,
  map: 'Bermuda',
  match_starts_at: '',
  server_region: 'Bangladesh',
  rules: '',
  status: 'upcoming'
})

let timer = null
function debounceSearch() { clearTimeout(timer); timer = setTimeout(fetchMatches, 400) }

async function fetchMatches() {
  try {
    const params = { 
      search: search.value, 
      status: filters.status,
      game_mode_id: filters.game_mode 
    }
    const { data } = await api.get('/admin/matches', { params })
    matches.value = data.data?.data || []
  } catch(e) {
    console.error(e)
  }
}

async function fetchGameModes() {
  try {
    const { data } = await api.get('/game-modes')
    gameModes.value = data.data
  } catch {}
}

function addPrizeItem() {
  prizeList.value.push({ label: '', value: 0 })
}

function removePrizeItem(index) {
  if (prizeList.value.length > 1) {
    prizeList.value.splice(index, 1)
  }
}

function openCreateModal() {
  isEditing.value = false
  editingId.value = null
  prizeList.value = [{ label: '1st', value: 0 }]
  Object.assign(form, {
    title: '',
    game_mode_id: gameModes.value[0]?.id || '',
    mode: 'solo',
    type: 'paid',
    entry_fee: 10,
    prize_pool: 50,
    max_players: 48,
    map: 'Bermuda',
    match_starts_at: '',
    server_region: 'Bangladesh',
    rules: '',
    status: 'upcoming'
  })
  showModal.value = true
}

function editMatch(m) {
  isEditing.value = false // Set false first to reset
  setTimeout(() => {
    isEditing.value = true
    editingId.value = m.id
    
    if (m.prize_breakdown && typeof m.prize_breakdown === 'object') {
      prizeList.value = Object.entries(m.prize_breakdown).map(([label, value]) => ({ label, value }))
    } else {
      prizeList.value = [{ label: '1st', value: 0 }]
    }

    Object.assign(form, {
      ...m,
      match_starts_at: m.match_starts_at ? new Date(m.match_starts_at).toISOString().slice(0, 16) : ''
    })
    showModal.value = true
  }, 50)
}

async function saveMatch() {
  saving.value = true
  try {
    const breakdown = {}
    prizeList.value.forEach(item => {
      if (item.label) breakdown[item.label] = item.value
    })
    form.prize_breakdown = breakdown

    const payload = { ...form }
    if (isEditing.value) {
      await api.put(`/admin/matches/${editingId.value}`, payload)
      Swal.fire({ icon: 'success', title: 'Match Updated', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 })
    } else {
      await api.post('/admin/matches', payload)
      Swal.fire({ icon: 'success', title: 'Match Created', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 })
    }
    showModal.value = false
    fetchMatches()
  } catch(e) {
    Swal.fire({ icon: 'error', title: 'Error', text: e.response?.data?.message || 'Something went wrong' })
  } finally {
    saving.value = false
  }
}

async function deleteMatch(id) {
  const { isConfirmed } = await Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ff4d4d',
    confirmButtonText: 'Yes, delete it!'
  })

  if (isConfirmed) {
    try {
      await api.delete(`/admin/matches/${id}`)
      Swal.fire('Deleted!', 'Match has been deleted.', 'success')
      fetchMatches()
    } catch(e) {
      Swal.fire('Error!', e.response?.data?.message || 'Failed to delete match.', 'error')
    }
  }
}

async function manageRoomDetails(m) {
  const { value: formValues } = await Swal.fire({
    title: 'Room Details',
    html: `
      <div style="display: flex; flex-direction: column; gap: 1rem; text-align: left;">
        <div>
          <label style="font-size: 12px; font-weight: bold; text-transform: uppercase;">Room ID</label>
          <input id="swal-room-id" class="swal2-input m-0 w-full" value="${m.room_details?.room_id || ''}" placeholder="123456">
        </div>
        <div>
          <label style="font-size: 12px; font-weight: bold; text-transform: uppercase;">Room Password</label>
          <input id="swal-room-pass" class="swal2-input m-0 w-full" value="${m.room_details?.room_password || ''}" placeholder="****">
        </div>
        <div>
          <label style="font-size: 12px; font-weight: bold; text-transform: uppercase;">Description / Instructions</label>
          <textarea id="swal-room-desc" class="swal2-textarea m-0 w-full" placeholder="Optional instructions...">${m.room_details?.description || ''}</textarea>
        </div>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Save Details',
    confirmButtonColor: '#696cff',
    background: '#fff',
    preConfirm: () => {
      return {
        room_id: document.getElementById('swal-room-id').value,
        room_password: document.getElementById('swal-room-pass').value,
        room_description: document.getElementById('swal-room-desc').value
      }
    }
  });

  if (formValues) {
    try {
      await api.put(`/admin/matches/${m.id}`, formValues);
      Swal.fire({ icon: 'success', title: 'Saved!', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
      fetchMatches();
    } catch(e) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Could not save room details.' });
    }
  }
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { 
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function getStatusColor(status) {
  const map = {
    upcoming: 'info',
    registration_open: 'success',
    running: 'warning',
    completed: 'secondary',
    cancelled: 'error'
  }
  return map[status] || 'primary'
}

onMounted(() => {
  fetchMatches()
  fetchGameModes()
})
</script>

<template>
  <div>
    <VRow>
      <VCol cols="12" class="d-flex justify-space-between align-center">
        <div>
          <h3 class="text-h4 mb-1">Match Management</h3>
          <p class="text-subtitle-1 text-disabled">Create and manage your tournament matches</p>
        </div>
        <VBtn
          prepend-icon="bx-plus"
          @click="openCreateModal"
        >
          Create Match
        </VBtn>
      </VCol>

      <!-- Filters -->
      <VCol cols="12">
        <VCard>
          <VCardText>
            <VRow>
              <VCol cols="12" md="6">
                <VTextField
                  v-model="search"
                  label="Search matches"
                  placeholder="Search by title..."
                  prepend-inner-icon="bx-search"
                  density="compact"
                  hide-details
                  @input="debounceSearch"
                />
              </VCol>
              <VCol cols="12" md="3">
                <VSelect
                  v-model="filters.status"
                  label="Status"
                  :items="[
                    { title: 'All Status', value: '' },
                    { title: 'Upcoming', value: 'upcoming' },
                    { title: 'Registration Open', value: 'registration_open' },
                    { title: 'Running', value: 'running' },
                    { title: 'Completed', value: 'completed' },
                    { title: 'Cancelled', value: 'cancelled' },
                  ]"
                  density="compact"
                  hide-details
                  @update:model-value="fetchMatches"
                />
              </VCol>
              <VCol cols="12" md="3">
                <VSelect
                  v-model="filters.game_mode"
                  label="Game Mode"
                  :items="[{ title: 'All Modes', value: '' }, ...gameModes.map(m => ({ title: m.name, value: m.id }))]"
                  density="compact"
                  hide-details
                  @update:model-value="fetchMatches"
                />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Matches Table -->
      <VCol cols="12">
        <VCard>
          <VTable class="text-no-wrap">
            <thead>
              <tr>
                <th class="text-uppercase">Match</th>
                <th class="text-uppercase text-center">Status</th>
                <th class="text-uppercase text-center">Players</th>
                <th class="text-uppercase text-center">Entry / Prize</th>
                <th class="text-uppercase text-center">Schedule</th>
                <th class="text-uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in matches" :key="m.id">
                <td>
                  <div class="d-flex flex-column">
                    <span class="font-weight-bold text-high-emphasis">{{ m.title }}</span>
                    <span class="text-xs text-primary font-weight-black text-uppercase">{{ m.game_mode?.name || m.mode }}</span>
                  </div>
                </td>
                <td class="text-center">
                  <VChip
                    :color="getStatusColor(m.status)"
                    size="small"
                    label
                    class="text-uppercase"
                  >
                    {{ m.status?.replace('_', ' ') }}
                  </VChip>
                </td>
                <td class="text-center">
                  <div class="d-flex align-center justify-center gap-1 text-disabled text-sm">
                    <VIcon icon="bx-user" size="14" />
                    {{ m.players_count || 0 }} / {{ m.max_players }}
                  </div>
                </td>
                <td class="text-center">
                  <div class="d-flex flex-column">
                    <span class="text-primary font-weight-bold">৳{{ m.entry_fee }}</span>
                    <span class="text-xs text-disabled">Pool: ৳{{ m.prize_pool }}</span>
                  </div>
                </td>
                <td class="text-center text-disabled text-xs">
                  {{ formatDate(m.match_starts_at) }}
                </td>
                <td class="text-right">
                  <VBtn
                    icon="bx-user-circle"
                    variant="text"
                    color="primary"
                    size="small"
                    title="View Players"
                    :to="{ name: 'admin-match-players', params: { id: m.id } }"
                  />
                  <VBtn
                    icon="bx-key"
                    variant="text"
                    color="warning"
                    size="small"
                    title="Room Details"
                    @click="manageRoomDetails(m)"
                  />
                  <VBtn
                    icon="bx-edit"
                    variant="text"
                    color="secondary"
                    size="small"
                    title="Edit"
                    @click="editMatch(m)"
                  />
                  <VBtn
                    icon="bx-trash"
                    variant="text"
                    color="error"
                    size="small"
                    title="Delete"
                    @click="deleteMatch(m.id)"
                  />
                </td>
              </tr>
              <tr v-if="!matches.length">
                <td colspan="6" class="text-center py-10 text-disabled italic">
                  No matches found.
                </td>
              </tr>
            </tbody>
          </VTable>
        </VCard>
      </VCol>
    </VRow>

    <!-- Match Modal -->
    <VDialog
      v-model="showModal"
      max-width="800"
      persistent
    >
      <VCard :title="isEditing ? 'Edit Match' : 'Create New Match'">
        <VBtn
          icon="bx-x"
          variant="text"
          color="secondary"
          class="position-absolute"
          style="top: 0.75rem; right: 0.75rem;"
          @click="showModal = false"
        />

        <VCardText>
          <VForm @submit.prevent="saveMatch">
            <VRow>
              <!-- Basic Info -->
              <VCol cols="12" md="6">
                <VTextField
                  v-model="form.title"
                  label="Match Title"
                  placeholder="e.g. Solo Match #123"
                  required
                />
              </VCol>
              <VCol cols="12" md="6">
                <VSelect
                  v-model="form.game_mode_id"
                  label="Game Mode"
                  :items="gameModes.map(m => ({ title: m.name, value: m.id }))"
                  required
                />
              </VCol>

              <VCol cols="12" md="4">
                <VSelect
                  v-model="form.mode"
                  label="Mode Type"
                  :items="[
                    { title: 'SOLO', value: 'solo' },
                    { title: 'DUO', value: 'duo' },
                    { title: 'SQUAD', value: 'squad' },
                    { title: 'CLASH SQUAD', value: 'clash_squad' },
                  ]"
                  required
                />
              </VCol>
              <VCol cols="12" md="4">
                <VTextField
                  v-model="form.map"
                  label="Map"
                  placeholder="Bermuda"
                />
              </VCol>
              <VCol cols="12" md="4">
                <VTextField
                  v-model="form.server_region"
                  label="Server Region"
                  placeholder="Bangladesh"
                />
              </VCol>

              <VCol cols="12" md="4">
                <VTextField
                  v-model="form.entry_fee"
                  label="Entry Fee (৳)"
                  type="number"
                  required
                />
              </VCol>
              <VCol cols="12" md="4">
                <VTextField
                  v-model="form.prize_pool"
                  label="Prize Pool (৳)"
                  type="number"
                  required
                />
              </VCol>
              <VCol cols="12" md="4">
                <VTextField
                  v-model="form.max_players"
                  label="Max Players"
                  type="number"
                  required
                />
              </VCol>

              <VCol cols="12" md="6">
                <VTextField
                  v-model="form.match_starts_at"
                  label="Match Start Time"
                  type="datetime-local"
                  required
                />
              </VCol>
              <VCol cols="12" md="6" v-if="isEditing">
                <VSelect
                  v-model="form.status"
                  label="Status"
                  :items="[
                    { title: 'Upcoming', value: 'upcoming' },
                    { title: 'Registration Open', value: 'registration_open' },
                    { title: 'Running / Live', value: 'running' },
                    { title: 'Completed', value: 'completed' },
                    { title: 'Cancelled', value: 'cancelled' },
                  ]"
                />
              </VCol>

              <!-- Prize Breakdown -->
              <VCol cols="12">
                <div class="d-flex align-center justify-space-between mb-4 mt-2">
                  <span class="text-sm font-weight-bold text-uppercase text-disabled">Prize Breakdown</span>
                  <VBtn
                    variant="tonal"
                    size="small"
                    prepend-icon="bx-plus-circle"
                    @click="addPrizeItem"
                  >
                    Add Item
                  </VBtn>
                </div>
                <VRow v-for="(item, index) in prizeList" :key="index" class="mb-2">
                  <VCol cols="7">
                    <VTextField
                      v-model="item.label"
                      placeholder="Title (e.g. 1st)"
                      density="compact"
                      hide-details
                    />
                  </VCol>
                  <VCol cols="4">
                    <VTextField
                      v-model="item.value"
                      placeholder="Amount"
                      type="number"
                      density="compact"
                      hide-details
                    />
                  </VCol>
                  <VCol cols="1" class="d-flex align-center">
                    <VBtn
                      icon="bx-trash"
                      variant="text"
                      color="error"
                      size="small"
                      @click="removePrizeItem(index)"
                    />
                  </VCol>
                </VRow>
                <p class="text-caption text-disabled mt-1">Specify how the prize pool will be distributed among winners.</p>
              </VCol>

              <VCol cols="12">
                <VTextarea
                  v-model="form.rules"
                  label="Match Rules"
                  rows="3"
                  placeholder="Enter match rules..."
                />
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
                  {{ isEditing ? 'Update Match' : 'Create Match' }}
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
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
