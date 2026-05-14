<template>
  <div class="admin-withdrawals">
    <div class="page-header">
      <h1 class="page-title">Withdrawal Requests</h1>
      <div class="tab-bar">
        <button v-for="t in tabs" :key="t.value" @click="filters.status = t.value; fetchData()"
                class="tab-btn" :class="{ active: filters.status === t.value }">
          {{ t.label }}
        </button>
      </div>
    </div>

    <div class="search-bar">
      <Search :size="16" class="search-icon" />
      <input v-model="search" @input="debounceSearch" type="text" placeholder="Search by user..." class="search-input" />
    </div>

    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr><th>User</th><th>Amount</th><th>Method</th><th>Account</th><th>Date</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          <tr v-for="w in withdrawals" :key="w.id">
            <td class="bold">{{ w.user?.name }}</td>
            <td class="amount">৳{{ w.amount }}</td>
            <td>{{ w.method || 'bKash' }}</td>
            <td class="mono">{{ w.account_number || '—' }}</td>
            <td class="muted">{{ formatDate(w.created_at) }}</td>
            <td><span class="status-badge" :class="w.status">{{ w.status }}</span></td>
            <td>
              <div v-if="w.status === 'pending'" class="actions-cell">
                <button @click="approve(w)" class="action-btn approve" :disabled="w._loading">
                  <CheckCircle :size="14" /> Approve
                </button>
                <button @click="reject(w)" class="action-btn reject" :disabled="w._loading">
                  <XCircle :size="14" /> Reject
                </button>
              </div>
              <span v-else class="muted">—</span>
            </td>
          </tr>
          <tr v-if="!withdrawals.length"><td colspan="7" class="empty">No withdrawals found</td></tr>
        </tbody>
      </table>
    </div>

    <div v-if="pagination.last_page > 1" class="pagination">
      <button @click="goPage(pagination.current_page - 1)" :disabled="pagination.current_page <= 1" class="page-btn">← Prev</button>
      <span class="page-info">Page {{ pagination.current_page }} of {{ pagination.last_page }}</span>
      <button @click="goPage(pagination.current_page + 1)" :disabled="pagination.current_page >= pagination.last_page" class="page-btn">Next →</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import api from '@/services/api'
import { Search, CheckCircle, XCircle } from 'lucide-vue-next'

const withdrawals = ref([])
const search = ref('')
const filters = reactive({ status: 'pending' })
const pagination = ref({})
let timer = null

const tabs = computed(() => [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'All', value: '' },
])

function debounceSearch() { clearTimeout(timer); timer = setTimeout(() => fetchData(), 400) }

async function fetchData(page = 1) {
  const params = { page, status: filters.status, search: search.value }
  const { data } = await api.get('/admin/withdrawals', { params })
  withdrawals.value = (data.data.data || []).map(w => ({ ...w, _loading: false }))
  pagination.value = { current_page: data.data.current_page, last_page: data.data.last_page }
}

function goPage(p) { if (p >= 1 && p <= pagination.value.last_page) fetchData(p) }

async function approve(w) {
  if (!confirm(`Approve ৳${w.amount} withdrawal for ${w.user?.name}?`)) return
  w._loading = true
  try { await api.post(`/admin/withdrawals/${w.id}/approve`); w.status = 'approved' } catch {} finally { w._loading = false }
}

async function reject(w) {
  if (!confirm(`Reject and refund this withdrawal?`)) return
  w._loading = true
  try { await api.post(`/admin/withdrawals/${w.id}/reject`); w.status = 'rejected' } catch {} finally { w._loading = false }
}

function formatDate(d) { return d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '' }

onMounted(() => fetchData())
</script>

<style scoped>
.admin-withdrawals { max-width: 1200px; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
.page-title { font-size: 1.5rem; font-weight: 900; font-family: var(--font-display); }

.tab-bar { display: flex; gap: 4px; background: var(--color-bg-card); border: 1px solid var(--color-border-subtle); border-radius: 10px; padding: 3px; }
.tab-btn { padding: 6px 14px; border: none; background: transparent; border-radius: 8px; font-size: 0.8rem; font-weight: 600; cursor: pointer; color: var(--color-text-muted); transition: all 0.2s; }
.tab-btn.active { background: var(--color-primary); color: white; }

.search-bar { position: relative; margin-bottom: 16px; }
.search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--color-text-muted); }
.search-input { width: 100%; padding: 10px 14px 10px 40px; border-radius: 10px; border: 1px solid var(--color-border-subtle); background: white; font-size: 0.85rem; }

.table-wrap { background: var(--color-bg-card); border: 1px solid var(--color-border-subtle); border-radius: 14px; overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); padding: 12px 16px; }
.data-table td { padding: 12px 16px; font-size: 0.82rem; border-top: 1px solid var(--color-border-subtle); }
.bold { font-weight: 600; }
.amount { font-weight: 700; font-family: var(--font-display); color: #E74C3C; }
.mono { font-family: monospace; font-size: 0.78rem; }
.muted { color: var(--color-text-muted); font-size: 0.78rem; }
.empty { text-align: center; padding: 32px; color: var(--color-text-muted); }

.status-badge { padding: 3px 10px; border-radius: 9999px; font-size: 0.7rem; font-weight: 700; text-transform: capitalize; }
.status-badge.pending { background: #FFF3CD; color: #856404; }
.status-badge.approved { background: #D4EDDA; color: #155724; }
.status-badge.rejected { background: #F8D7DA; color: #721C24; }

.actions-cell { display: flex; gap: 6px; }
.action-btn { display: inline-flex; align-items: center; gap: 4px; padding: 5px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 600; border: none; cursor: pointer; transition: all 0.2s; }
.action-btn.approve { background: #D1FAE5; color: #059669; }
.action-btn.approve:hover { background: #A7F3D0; }
.action-btn.reject { background: #FEE2E2; color: #DC2626; }
.action-btn.reject:hover { background: #FECACA; }
.action-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.pagination { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 20px; }
.page-btn { padding: 8px 16px; border-radius: 8px; border: 1px solid var(--color-border-subtle); background: white; font-size: 0.82rem; cursor: pointer; }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-info { font-size: 0.82rem; color: var(--color-text-muted); }
</style>
