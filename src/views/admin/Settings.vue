<template>
  <div class="settings-page">
    <div class="settings-header">
      <div class="header-left">
        <Settings2 :size="24" style="color: var(--color-primary);" />
        <div>
          <h1 class="page-title">System Settings</h1>
          <p class="page-desc">ওয়েবসাইটের ব্র্যান্ডিং এবং পেমেন্ট কনফিগার করুন</p>
        </div>
      </div>
      <button @click="saveAll" class="save-btn" :disabled="saving">
        <Loader2 v-if="saving" :size="16" class="animate-spin" />
        <Save v-else :size="16" />
        {{ saving ? 'Saving...' : 'Save Changes' }}
      </button>
    </div>

    <!-- Tabs Navigation -->
    <div class="tabs-nav">
      <button v-for="tab in tabs" :key="tab.id"
              @click="activeTab = tab.id"
              class="tab-btn"
              :class="{ active: activeTab === tab.id }">
        <component :is="tab.icon" :size="16" />
        {{ tab.label }}
      </button>
    </div>

    <!-- Success Message -->
    <div v-if="showSuccess" class="success-bar">
      <CheckCircle2 :size="16" />
      {{ activeTab === 'theme' ? 'থিম সেটিংস' : 'পেমেন্ট সেটিংস' }} সফলভাবে আপডেট করা হয়েছে!
    </div>

    <!-- ── THEME SETTINGS TAB ────────────────────────────────────────── -->
    <div v-if="activeTab === 'theme'" class="settings-grid">
      <!-- Brand Colors -->
      <div class="settings-card">
        <div class="card-header">
          <Paintbrush :size="18" />
          <h2>Brand Colors</h2>
        </div>
        <div class="color-grid">
          <div v-for="item in brandColors" :key="item.key" class="color-field">
            <label class="color-label">{{ item.label }}</label>
            <div class="color-input-wrap">
              <input type="color" v-model="themeForm[item.key]" class="color-picker" />
              <input type="text" v-model="themeForm[item.key]" class="color-text" maxlength="7" />
            </div>
          </div>
        </div>
      </div>

      <!-- Background Colors -->
      <div class="settings-card">
        <div class="card-header">
          <Layout :size="18" />
          <h2>Background Colors</h2>
        </div>
        <div class="color-grid">
          <div v-for="item in bgColors" :key="item.key" class="color-field">
            <label class="color-label">{{ item.label }}</label>
            <div class="color-input-wrap">
              <input type="color" v-model="themeForm[item.key]" class="color-picker" />
              <input type="text" v-model="themeForm[item.key]" class="color-text" maxlength="7" />
            </div>
          </div>
        </div>
      </div>

      <!-- Typography -->
      <div class="settings-card full-width">
        <div class="card-header">
          <Bookmark :size="18" />
          <h2>Typography & Branding</h2>
        </div>
        <div class="typo-grid">
          <div class="typo-field">
            <label class="color-label">Site Name</label>
            <input v-model="themeForm.site_name" type="text" class="input-field" placeholder="BATTLEZONE" />
          </div>
          <div class="typo-field">
            <label class="color-label">Display Font</label>
            <select v-model="themeForm.font_display" class="input-field">
              <option v-for="f in fonts" :key="f" :value="f">{{ f }}</option>
            </select>
          </div>
          <div class="typo-field">
            <label class="color-label">Body Font</label>
            <select v-model="themeForm.font_body" class="input-field">
              <option v-for="f in fonts" :key="f" :value="f">{{ f }}</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- ── PAYMENT SETTINGS TAB ──────────────────────────────────────── -->
    <div v-if="activeTab === 'payment'" class="settings-grid">
      <!-- Method Toggles -->
      <div class="settings-card">
        <div class="card-header">
          <Zap :size="18" />
          <h2>Deposit Methods</h2>
        </div>
        <div class="toggle-list">
          <div class="toggle-item">
            <div class="toggle-info">
              <p class="toggle-label">Online Deposit (Instant)</p>
              <p class="toggle-desc">Enable automatic payment gateway</p>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="depositForm.online_deposit_active" true-value="1" false-value="0">
              <span class="slider round"></span>
            </label>
          </div>
          <div class="toggle-item">
            <div class="toggle-info">
              <p class="toggle-label">Manual Deposit</p>
              <p class="toggle-desc">Enable bKash/Nagad/Rocket screenshot uploads</p>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="depositForm.manual_deposit_active" true-value="1" false-value="0">
              <span class="slider round"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- Manual Payment Numbers -->
      <div class="settings-card">
        <div class="card-header">
          <Phone :size="18" />
          <h2>Manual Payment Numbers</h2>
        </div>
        <div class="number-inputs">
          <div class="input-group">
            <label>bKash Number</label>
            <div class="input-with-icon">
              <div class="method-icon bkash"></div>
              <input v-model="depositForm.manual_bkash_number" type="text" placeholder="017XXXXXXXX" />
            </div>
          </div>
          <div class="input-group">
            <label>Nagad Number</label>
            <div class="input-with-icon">
              <div class="method-icon nagad"></div>
              <input v-model="depositForm.manual_nagad_number" type="text" placeholder="018XXXXXXXX" />
            </div>
          </div>
          <div class="input-group">
            <label>Rocket Number</label>
            <div class="input-with-icon">
              <div class="method-icon rocket"></div>
              <input v-model="depositForm.manual_rocket_number" type="text" placeholder="019XXXXXXXX" />
            </div>
          </div>
        </div>
      </div>

      <!-- Online Gateway Config -->
      <div class="settings-card full-width">
        <div class="card-header">
          <CreditCard :size="18" />
          <h2>Online Gateway (OnlineMoneyPay)</h2>
        </div>
        <div class="p-4 bg-orange-50 rounded-xl border border-orange-100 flex items-start gap-3 mb-4">
          <AlertCircle :size="18" class="text-orange-500 flex-shrink-0 mt-0.5" />
          <p class="text-xs text-orange-800 leading-relaxed">
            অনলাইন পেমেন্ট গেটওয়ের API Keys কনফিগার করার জন্য অনুগ্রহ করে <strong>Payment Gateways</strong> সেকশনটি ব্যবহার করুন। এখানে শুধুমাত্র গেটওয়ের দৃশ্যমানতা এবং লিমিট কনফিগার করা যায়।
          </p>
        </div>
        <!-- Future: Add limits or other gateway specific toggles here -->
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme'
import api from '@/services/api'
import {
  Settings2, Palette, Paintbrush, Layout, Bookmark,
  Zap, CreditCard, Phone, AlertCircle,
  Save, Loader2, CheckCircle2
} from 'lucide-vue-next'

const themeStore = useThemeStore()
const saving = ref(false)
const showSuccess = ref(false)
const activeTab = ref('theme')

const tabs = [
  { id: 'theme',   label: 'Theme & Branding', icon: Palette },
  { id: 'payment', label: 'Payment Gateway',  icon: CreditCard },
]

const themeForm = reactive({ ...themeStore.defaults })
const depositForm = reactive({
  manual_deposit_active: '1',
  online_deposit_active: '1',
  manual_bkash_number: '',
  manual_nagad_number: '',
  manual_rocket_number: '',
})

const fonts = ['Inter', 'Outfit', 'Roboto', 'Poppins', 'Nunito', 'Montserrat', 'Raleway', 'Open Sans', 'Lato', 'DM Sans']

const brandColors = [
  { key: 'primary_color',   label: 'Primary Color' },
  { key: 'primary_dark',    label: 'Primary Dark' },
  { key: 'secondary_color', label: 'Secondary Color' },
]
const bgColors = [
  { key: 'bg_page', label: 'Page Background' },
  { key: 'bg_card', label: 'Card Background' },
]

async function fetchDepositSettings() {
  try {
    const { data } = await api.get('/settings/deposit')
    if (data.status) {
      Object.assign(depositForm, data.data)
    }
  } catch (e) {
    console.error('Error fetching deposit settings', e)
  }
}

async function saveAll() {
  saving.value = true
  try {
    if (activeTab.value === 'theme') {
      await themeStore.saveTheme({ ...themeForm })
    } else {
      await api.put('/admin/settings/deposit', { ...depositForm })
    }
    showSuccess.value = true
    setTimeout(() => { showSuccess.value = false }, 3000)
  } catch (e) {
    alert('Error saving settings!')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  if (!themeStore.loaded) await themeStore.loadTheme()
  Object.assign(themeForm, themeStore.theme)
  await fetchDepositSettings()
})
</script>

<style scoped>
.settings-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px 16px 60px;
}

/* Header */
.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}
.header-left { display: flex; align-items: center; gap: 12px; }
.page-title { font-size: 1.4rem; font-weight: 900; font-family: var(--font-display); }
.page-desc { font-size: 0.82rem; color: var(--color-text-muted); margin-top: 2px; }

.save-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  border-radius: 12px;
  font-size: 0.88rem;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}
.save-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(var(--color-primary-rgb), 0.4); }

/* Tabs */
.tabs-nav {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  padding: 4px;
  background: rgba(0,0,0,0.03);
  border-radius: 12px;
  width: fit-content;
}
.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--color-text-muted);
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
}
.tab-btn.active {
  background: white;
  color: var(--color-primary);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

/* Success */
.success-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #166534;
  background: #dcfce7;
  border: 1px solid #86efac;
}

/* Grid */
.settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.settings-card {
  background: white;
  border: 1px solid var(--color-border-subtle);
  border-radius: 16px;
  padding: 20px;
}
.settings-card.full-width { grid-column: 1 / -1; }
.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border-subtle);
  color: var(--color-primary);
}
.card-header h2 { font-size: 0.95rem; font-weight: 700; color: var(--color-text-primary); }

/* Color inputs */
.color-grid { display: flex; flex-direction: column; gap: 14px; }
.color-field { display: flex; align-items: center; gap: 12px; }
.color-label { flex: 1; font-size: 0.82rem; font-weight: 600; color: var(--color-text-secondary); }
.color-input-wrap { display: flex; align-items: center; gap: 8px; }
.color-picker { width: 36px; height: 36px; border-radius: 10px; border: 2px solid #eee; cursor: pointer; }
.color-text { width: 90px; padding: 8px; border-radius: 8px; border: 1px solid #eee; font-family: monospace; font-size: 0.75rem; }

/* Typo inputs */
.typo-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
.typo-field { display: flex; flex-direction: column; gap: 6px; }
.input-field { padding: 10px; border-radius: 10px; border: 1px solid #eee; font-size: 0.85rem; }

/* Payment specific */
.toggle-list { display: flex; flex-direction: column; gap: 16px; }
.toggle-item { display: flex; align-items: center; justify-content: space-between; }
.toggle-label { font-size: 0.88rem; font-weight: 700; color: var(--color-text-primary); }
.toggle-desc { font-size: 0.75rem; color: var(--color-text-muted); }

.number-inputs { display: flex; flex-direction: column; gap: 14px; }
.input-group label { display: block; font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); margin-bottom: 6px; text-transform: uppercase; }
.input-with-icon { display: flex; align-items: center; gap: 12px; padding: 10px; border: 1px solid #eee; border-radius: 12px; }
.input-with-icon input { flex: 1; border: none; font-size: 0.9rem; font-weight: 600; outline: none; }

.method-icon { width: 24px; height: 24px; border-radius: 6px; }
.method-icon.bkash { background: #D12053; }
.method-icon.nagad { background: #F7941D; }
.method-icon.rocket { background: #8C3494; }

/* Switch */
.switch { position: relative; display: inline-block; width: 44px; height: 24px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #eee; transition: .4s; }
.slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; }
input:checked + .slider { background-color: var(--color-primary); }
input:checked + .slider:before { transform: translateX(20px); }
.slider.round { border-radius: 34px; }
.slider.round:before { border-radius: 50%; }

@media (max-width: 768px) {
  .settings-grid { grid-template-columns: 1fr; }
  .typo-grid { grid-template-columns: 1fr; }
}
</style>
