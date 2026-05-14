<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()
const match = ref(null)
const players = ref([])
const results = reactive({})
const submitting = ref(null)
const loading = ref(false)

async function fetchData() {
  loading.value = true
  try {
    const [matchRes, playersRes] = await Promise.all([
      api.get(`/admin/matches/${route.params.id}`),
      api.get(`/admin/matches/${route.params.id}/players`)
    ])
    match.value = matchRes.data.data
    players.value = playersRes.data.data
    
    // Initialize results state
    players.value.forEach(p => {
      results[p.id] = {
        rank_position: p.rank_position || '',
        kills: p.kills || 0,
        prize_amount: p.prize_won || 0
      }
    })
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function submitResult(player) {
  const result = results[player.id]
  if (!result.rank_position) {
    Swal.fire({ icon: 'warning', title: 'Wait', text: 'Please enter rank position.' })
    return
  }

  const confirm = await Swal.fire({
    title: 'Confirm Prize?',
    text: `Send ৳${result.prize_amount} to ${player.in_game_name}? This cannot be undone.`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#696cff',
    confirmButtonText: 'Yes, Send Balance'
  })

  if (!confirm.isConfirmed) return

  submitting.value = player.id
  try {
    await api.post(`/admin/matches/${match.value.id}/players/${player.id}/award-prize`, result)
    Swal.fire({ icon: 'success', title: 'Balance Added!', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 })
    fetchData()
  } catch (e) {
    Swal.fire({ icon: 'error', title: 'Error', text: e.response?.data?.message || 'Failed to award prize' })
  } finally {
    submitting.value = null
  }
}

async function removePlayer(playerId) {
  const { isConfirmed } = await Swal.fire({
    title: 'Remove Player?',
    text: "This player will be removed from this match. Registration slot will be free.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ff3e1d',
    confirmButtonText: 'Yes, remove them'
  })

  if (isConfirmed) {
    try {
      await api.delete(`/admin/matches/${match.value.id}/players/${playerId}`)
      Swal.fire({ icon: 'success', title: 'Removed!', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 })
      fetchData()
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Could not remove player.' })
    }
  }
}

function applyPreset(rank) {
  const breakdown = match.value?.prize_breakdown || {}
  const prize = breakdown[rank] || breakdown[rank + 'st'] || breakdown[rank + 'nd'] || breakdown[rank + 'rd'] || 0
  
  Swal.fire({
    title: `Applying Preset for ${rank}`,
    text: `Found prize amount: ৳${prize}. Please assign it to the correct player in the list.`,
    icon: 'info',
    toast: true,
    position: 'top-end'
  })
}

onMounted(fetchData)
</script>

<template>
  <div>
    <VRow>
      <VCol cols="12">
        <div class="d-flex align-center gap-2 mb-4">
          <VBtn
            icon="bx-arrow-back"
            variant="text"
            color="secondary"
            @click="router.back()"
          />
          <div>
            <h3 class="text-h4 mb-1">Match Players</h3>
            <p class="text-subtitle-1 text-disabled" v-if="match">Managing results for: <span class="text-primary font-weight-bold">{{ match.title }}</span></p>
          </div>
        </div>
      </VCol>

      <!-- Players Table -->
      <VCol cols="12">
        <VCard>
          <VTable class="text-no-wrap">
            <thead>
              <tr>
                <th class="text-uppercase">Slot</th>
                <th class="text-uppercase">Player</th>
                <th class="text-uppercase">In-Game Name</th>
                <th class="text-uppercase text-center">Rank</th>
                <th class="text-uppercase text-center">Kills</th>
                <th class="text-uppercase text-center">Prize (৳)</th>
                <th class="text-uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in players" :key="p.id">
                <td>
                  <span class="font-weight-black text-primary">#{{ p.slot_number }}</span>
                </td>
                <td>
                  <div class="d-flex flex-column">
                    <span class="font-weight-bold">{{ p.user?.name }}</span>
                    <span class="text-xs text-disabled">@{{ p.user?.username }}</span>
                  </div>
                </td>
                <td>
                  <span class="font-weight-bold">{{ p.in_game_name }}</span>
                </td>
                <td class="text-center" style="width: 100px;">
                  <VTextField
                    v-model="results[p.id].rank_position"
                    type="number"
                    density="compact"
                    hide-details
                    variant="outlined"
                    class="mx-auto"
                    style="max-width: 70px;"
                    :disabled="p.prize_won > 0"
                  />
                </td>
                <td class="text-center" style="width: 100px;">
                  <VTextField
                    v-model="results[p.id].kills"
                    type="number"
                    density="compact"
                    hide-details
                    variant="outlined"
                    class="mx-auto"
                    style="max-width: 70px;"
                    :disabled="p.prize_won > 0"
                  />
                </td>
                <td class="text-center" style="width: 130px;">
                  <VTextField
                    v-model="results[p.id].prize_amount"
                    type="number"
                    density="compact"
                    hide-details
                    variant="outlined"
                    class="mx-auto"
                    style="max-width: 100px;"
                    prefix="৳"
                    :disabled="p.prize_won > 0"
                  />
                </td>
                <td class="text-right">
                  <div class="d-flex align-center justify-end gap-1">
                    <template v-if="p.prize_won <= 0">
                      <VBtn
                        color="primary"
                        size="small"
                        variant="tonal"
                        :loading="submitting === p.id"
                        @click="submitResult(p)"
                      >
                        Award
                      </VBtn>
                      <VBtn
                        icon="bx-trash"
                        variant="text"
                        color="error"
                        size="small"
                        @click="removePlayer(p.id)"
                      />
                    </template>
                    <VChip
                      v-else
                      color="success"
                      size="small"
                      prepend-icon="bx-check-circle"
                      label
                    >
                      Awarded ৳{{ p.prize_won }}
                    </VChip>
                  </div>
                </td>
              </tr>
              <tr v-if="!players.length && !loading">
                <td colspan="7" class="text-center py-10 text-disabled italic">
                  No players registered for this match.
                </td>
              </tr>
            </tbody>
          </VTable>
        </VCard>
      </VCol>

      <!-- Quick Award Presets -->
      <VCol cols="12" md="6">
        <VCard title="Winner Presets">
          <VCardText>
            <div class="d-flex flex-wrap gap-3">
              <VBtn
                color="warning"
                variant="tonal"
                size="small"
                prepend-icon="bx-trophy"
                @click="applyPreset(1)"
              >
                1st Place
              </VBtn>
              <VBtn
                color="secondary"
                variant="tonal"
                size="small"
                prepend-icon="bx-medal"
                @click="applyPreset(2)"
              >
                2nd Place
              </VBtn>
              <VBtn
                color="error"
                variant="tonal"
                size="small"
                prepend-icon="bx-award"
                @click="applyPreset(3)"
              >
                3rd Place
              </VBtn>
            </div>
            <p class="text-caption text-disabled mt-3">These presets are based on the prize breakdown defined in match settings.</p>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>

<style lang="scss" scoped>
.v-table {
  thead {
    background-color: rgba(var(--v-theme-on-surface), 0.04);
  }
}
</style>
