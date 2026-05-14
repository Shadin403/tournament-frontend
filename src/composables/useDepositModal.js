import { ref } from 'vue'

const isOpen = ref(false)

export function useDepositModal() {
  const open = () => {
    console.log('useDepositModal: opening modal')
    isOpen.value = true
  }

  const close = () => {
    console.log('useDepositModal: closing modal')
    isOpen.value = false
  }

  return {
    isOpen,
    open,
    close
  }
}
