import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useWalletStore = defineStore('wallet', () => {
  const wallet = ref(null)
  const loading = ref(false)

  async function fetchWallet() {
    loading.value = true
    try {
      const { data } = await api.get('/wallet')
      wallet.value = data.data
    } finally {
      loading.value = false
    }
  }

  function updateBalance(bucket, amount, direction) {
    if (!wallet.value) return
    const key = `${bucket}_balance`
    if (direction === 'credit') {
      wallet.value[key] = parseFloat(wallet.value[key]) + parseFloat(amount)
    } else {
      wallet.value[key] = Math.max(0, parseFloat(wallet.value[key]) - parseFloat(amount))
    }
  }

  const totalBalance = computed(() => {
    if (!wallet.value) return 0
    return parseFloat(wallet.value.main_balance)
      + parseFloat(wallet.value.winning_balance)
      + parseFloat(wallet.value.bonus_balance)
  })

  return { wallet, loading, fetchWallet, updateBalance, totalBalance }
})
