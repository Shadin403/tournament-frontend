<script setup>
import AnalyticsCongratulations from './dashboard/AnalyticsCongratulations.vue'
import AnalyticsFinanceTabs from './dashboard/AnalyticsFinanceTab.vue'
import AnalyticsOrderStatistics from './dashboard/AnalyticsOrderStatistics.vue'
import AnalyticsProfitReport from './dashboard/AnalyticsProfitReport.vue'
import AnalyticsTotalRevenue from './dashboard/AnalyticsTotalRevenue.vue'
import AnalyticsTransactions from './dashboard/AnalyticsTransactions.vue'

// 👉 Images
import chart from '@images/cards/chart-success.png'
import card from '@images/cards/credit-card-primary.png'
import paypal from '@images/cards/paypal-error.png'
import wallet from '@images/cards/wallet-info.png'

import { ref, onMounted } from 'vue'
import api from '@/services/api'

const data = ref({})

onMounted(async () => {
  try {
    const res = await api.get('/admin/dashboard')
    data.value = res.data.data
  } catch (err) {
    console.error('Failed to fetch dashboard data:', err)
  }
})

function formatNum(n) { return Number(n || 0).toLocaleString() }
</script>

<template>
  <VRow>
    <!-- 👉 Congratulations -->
    <VCol
      cols="12"
      md="8"
    >
      <AnalyticsCongratulations :data="data" />
    </VCol>

    <VCol
      cols="12"
      sm="4"
    >
      <VRow>
        <!-- 👉 Users -->
        <VCol
          cols="12"
          md="6"
        >
          <CardStatisticsVertical
            v-bind="{
              title: 'Total Users',
              image: chart,
              stats: data.total_users || '0',
              change: 12.5, // Mock change for now
            }"
          />
        </VCol>

        <!-- 👉 Matches -->
        <VCol
          cols="12"
          md="6"
        >
          <CardStatisticsVertical
            v-bind="{
              title: 'Matches',
              image: wallet,
              stats: data.active_matches || '0',
              change: 5.2,
            }"
          />
        </VCol>
      </VRow>
    </VCol>

    <!-- 👉 Total Revenue -->
    <VCol
      cols="12"
      md="8"
      order="2"
      order-md="1"
    >
      <AnalyticsTotalRevenue :data="data" />
    </VCol>

    <VCol
      cols="12"
      sm="8"
      md="4"
      order="1"
      order-md="2"
    >
      <VRow>
        <!-- 👉 Deposits -->
        <VCol
          cols="12"
          sm="6"
        >
          <CardStatisticsVertical
            v-bind=" {
              title: 'Deposits',
              image: paypal,
              stats: '৳' + formatNum(data.total_deposits),
              change: 14.8,
            }"
          />
        </VCol>

        <!-- 👉 Withdrawals -->
        <VCol
          cols="12"
          sm="6"
        >
          <CardStatisticsVertical
            v-bind="{
              title: 'Withdrawals',
              image: card,
              stats: '৳' + formatNum(data.total_withdrawals),
              change: 2.4,
            }"
          />
        </VCol>
      </VRow>

      <VRow>
        <!-- 👉 Profit Report -->
        <VCol
          cols="12"
          sm="12"
        >
          <AnalyticsProfitReport :data="data" />
        </VCol>
      </VRow>
    </VCol>

    <!-- 👉 Order Statistics -->
    <VCol
      cols="12"
      md="4"
      sm="6"
      order="3"
    >
      <AnalyticsOrderStatistics :data="data" />
    </VCol>

    <!-- 👉 Tabs chart -->
    <VCol
      cols="12"
      md="4"
      sm="6"
      order="3"
    >
      <AnalyticsFinanceTabs :data="data" />
    </VCol>

    <!-- 👉 Transactions -->
    <VCol
      cols="12"
      md="4"
      sm="6"
      order="3"
    >
      <AnalyticsTransactions :data="data.recent_deposits || []" />
    </VCol>
  </VRow>
</template>
