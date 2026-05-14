import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref({})
  const loaded = ref(false)

  // Default fallback values
  const defaults = {
    primary_color:   '#A0C878',
    primary_dark:    '#74992E',
    secondary_color: '#DDEB9D',
    bg_page:         '#FFFDF6',
    bg_card:         '#FAF6E9',
    text_primary:    '#1A1A1A',
    text_secondary:  '#4A4A4A',
    text_muted:      '#8E8E8E',
    accent_green:    '#A0C878',
    accent_red:      '#E74C3C',
    accent_blue:     '#5D9C59',
    font_display:    'Outfit',
    font_body:       'Inter',
    site_name:       'BATTLEZONE',
  }

  /**
   * Fetch theme settings from API and apply to CSS variables.
   */
  async function loadTheme() {
    try {
      const { data } = await api.get('/settings/theme')
      theme.value = { ...defaults, ...(data.data || {}) }
    } catch {
      theme.value = { ...defaults }
    }
    applyTheme()
    loaded.value = true
  }

  /**
   * Apply theme colors to the document as CSS custom properties.
   */
  function applyTheme() {
    const t = theme.value
    const root = document.documentElement

    // Helper: convert hex to rgba components
    function hexToRgb(hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result
        ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
        : '160, 200, 120'
    }

    root.style.setProperty('--color-primary',        t.primary_color)
    root.style.setProperty('--color-primary-dark',    t.primary_dark)
    root.style.setProperty('--color-secondary',       t.secondary_color)
    root.style.setProperty('--color-bg-page',         t.bg_page)
    root.style.setProperty('--color-bg-card',         t.bg_card)
    root.style.setProperty('--color-bg-darkest',      t.bg_page)
    root.style.setProperty('--color-bg-dark',         t.bg_card)
    root.style.setProperty('--color-text-primary',    t.text_primary)
    root.style.setProperty('--color-text-secondary',  t.text_secondary)
    root.style.setProperty('--color-text-muted',      t.text_muted)
    root.style.setProperty('--color-neon-orange',     t.primary_dark)
    root.style.setProperty('--color-neon-green',      t.accent_green)
    root.style.setProperty('--color-neon-red',        t.accent_red)
    root.style.setProperty('--color-neon-blue',       t.accent_blue)
    root.style.setProperty('--color-border-subtle',   `rgba(${hexToRgb(t.primary_color)}, 0.2)`)
    root.style.setProperty('--color-border-glass',    `rgba(${hexToRgb(t.primary_color)}, 0.3)`)
    root.style.setProperty('--font-display',          `'${t.font_display}', sans-serif`)
    root.style.setProperty('--font-body',             `'${t.font_body}', sans-serif`)

    // Also update body background
    // Removed to prevent conflict with Vuetify themes in Admin panel
  }

  /**
   * Save theme to backend and re-apply.
   */
  async function saveTheme(newTheme) {
    const { data } = await api.put('/admin/settings/theme', newTheme)
    theme.value = { ...defaults, ...(data.data || {}) }
    applyTheme()
    return data
  }

  return { theme, loaded, defaults, loadTheme, applyTheme, saveTheme }
})
