<template>
  <div class="gateways-page">
    <div class="page-header">
      <div class="header-left">
        <CreditCard :size="24" class="text-primary" />
        <div>
          <h1 class="page-title">Payment Gateways</h1>
          <p class="page-desc">অনলাইন অটোমেটিক পেমেন্ট গেটওয়েগুলো কনফিগার করুন</p>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <Loader2 :size="40" class="animate-spin text-primary" />
    </div>

    <div v-else class="gateway-grid">
      <div v-for="gw in gateways" :key="gw.id" class="gateway-card">
        <div class="card-top">
          <div class="gw-icon">
            <Zap v-if="gw.slug === 'online-money-pay'" :size="24" class="text-orange-500" />
            <Globe v-else :size="24" class="text-blue-500" />
          </div>
          <div class="gw-info">
            <h3>{{ gw.name }}</h3>
            <span class="slug-badge">{{ gw.slug }}</span>
          </div>
          <div class="gw-status">
            <span :class="gw.is_active ? 'status-active' : 'status-inactive'">
              {{ gw.is_active ? 'Active' : 'Inactive' }}
            </span>
          </div>
        </div>

        <div class="card-config">
          <div class="config-header">
            <Settings :size="14" />
            <span>Credentials / Configuration</span>
          </div>
          <div class="config-fields">
            <div v-for="(value, key) in gw.config" :key="key" class="config-row">
              <label>{{ formatLabel(key) }}</label>
              <input v-model="gw.config[key]" type="text" class="config-input" />
            </div>
          </div>
        </div>

        <div class="card-footer">
          <label class="toggle-active">
            <input type="checkbox" v-model="gw.is_active" />
            <span>Enabled</span>
          </label>
          <button @click="saveGateway(gw)" class="save-btn" :disabled="saving === gw.id">
            <Loader2 v-if="saving === gw.id" :size="14" class="animate-spin" />
            <Save v-else :size="14" />
            Update
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import { CreditCard, Zap, Globe, Settings, Save, Loader2 } from 'lucide-vue-next'

const gateways = ref([])
const loading = ref(true)
const saving = ref(null)

async function fetchGateways() {
  loading.value = true
  try {
    const { data } = await api.get('/admin/gateways')
    if (data.status) {
      gateways.value = data.data
    }
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

async function saveGateway(gw) {
  saving.value = gw.id
  try {
    const { data } = await api.put(`/admin/gateways/${gw.id}`, {
      is_active: gw.is_active,
      config: gw.config
    })
    if (data.status) {
      alert('Gateway updated successfully!')
    }
  } catch (err) {
    alert(err.response?.data?.message || 'Error updating gateway')
  } finally {
    saving.value = null
  }
}

function formatLabel(key) {
  return key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

onMounted(fetchGateways)
</script>

<style scoped>
.gateways-page { max-width: 1200px; margin: 0 auto; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.header-left { display: flex; align-items: center; gap: 12px; }
.page-title { font-size: 1.4rem; font-weight: 900; font-family: var(--font-display); }
.page-desc { font-size: 0.82rem; color: var(--color-text-muted); }

.gateway-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
.gateway-card { background: white; border: 1px solid var(--color-border-subtle); border-radius: 20px; overflow: hidden; display: flex; flex-direction: column; }

.card-top { padding: 20px; display: flex; align-items: center; gap: 16px; border-bottom: 1px solid var(--color-border-subtle); }
.gw-icon { width: 48px; height: 48px; border-radius: 14px; background: rgba(0,0,0,0.03); display: flex; align-items: center; justify-content: center; }
.gw-info h3 { font-size: 1rem; font-weight: 800; }
.slug-badge { font-size: 0.7rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
.gw-status { margin-left: auto; }
.status-active { font-size: 0.7rem; font-weight: 800; color: #166534; background: #dcfce7; padding: 4px 10px; border-radius: 9999px; }
.status-inactive { font-size: 0.7rem; font-weight: 800; color: #991b1b; background: #fee2e2; padding: 4px 10px; border-radius: 9999px; }

.card-config { padding: 20px; flex: 1; background: rgba(0,0,0,0.01); }
.config-header { display: flex; align-items: center; gap: 8px; font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; margin-bottom: 16px; }
.config-fields { display: flex; flex-direction: column; gap: 12px; }
.config-row label { display: block; font-size: 0.72rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 6px; }
.config-input { width: 100%; padding: 10px; border-radius: 10px; border: 1px solid #eee; font-size: 0.85rem; font-weight: 500; }
.config-input:focus { border-color: var(--color-primary); outline: none; }

.card-footer { padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--color-border-subtle); }
.toggle-active { display: flex; align-items: center; gap: 8px; font-size: 0.82rem; font-weight: 700; cursor: pointer; }
.toggle-active input { width: 16px; height: 16px; accent-color: var(--color-primary); }

.save-btn { display: inline-flex; align-items: center; gap: 8px; padding: 8px 18px; border-radius: 10px; font-size: 0.82rem; font-weight: 700; color: white; background: var(--color-primary); border: none; cursor: pointer; transition: all 0.2s; }
.save-btn:hover { transform: translateY(-1px); opacity: 0.9; }
.save-btn:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 640px) {
  .gateway-grid { grid-template-columns: 1fr; }
}
</style>
