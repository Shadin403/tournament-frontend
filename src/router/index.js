import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Auth pages
const Login = () => import('@/views/auth/Login.vue')
const Register = () => import('@/views/auth/Register.vue')
const ForgotPassword = () => import('@/views/auth/ForgotPassword.vue')

// User panel pages
const Home = () => import('@/views/user/Home.vue')           // "/" — banner + categories
const Dashboard = () => import('@/views/user/Dashboard.vue')  // "/dashboard" — stats
const Wallet = () => import('@/views/user/Wallet.vue')
const Deposit = () => import('@/views/user/Deposit.vue')
const Withdraw = () => import('@/views/user/Withdraw.vue')
const Transactions = () => import('@/views/user/Transactions.vue')
const AllMatches = () => import('@/views/user/AllMatches.vue')
const MatchDetails = () => import('@/views/user/MatchDetails.vue')
const MyMatches = () => import('@/views/user/MyMatches.vue')
const Tournaments = () => import('@/views/user/Tournaments.vue')
const TournamentDetails = () => import('@/views/user/TournamentDetails.vue')
const Leaderboard = () => import('@/views/user/Leaderboard.vue')
const Profile = () => import('@/views/user/Profile.vue')
const Notifications = () => import('@/views/user/Notifications.vue')
const Referral = () => import('@/views/user/Referral.vue')

// Admin pages
const AdminDashboard = () => import('@/views/admin/Dashboard.vue')
const AdminUsers = () => import('@/views/admin/Users.vue')
const AdminMatches = () => import('@/views/admin/Matches.vue')
const AdminDeposits = () => import('@/views/admin/Deposits.vue')
const AdminWithdrawals = () => import('@/views/admin/Withdrawals.vue')
const AdminGateways = () => import('@/views/admin/Gateways.vue')

const routes = [
  // ── Auth (guest only) ──────────────────────────────────────────────
  { path: '/login',          component: Login,          name: 'login',          meta: { layout: 'auth', guestOnly: true } },
  { path: '/register',       component: Register,       name: 'register',       meta: { guestOnly: true } },
  { path: '/forgot-password', component: ForgotPassword, name: 'forgot-password', meta: { layout: 'auth', guestOnly: true } },

  // ── User Panel (requires auth) ─────────────────────────────────────
  { path: '/',               component: Home,           name: 'home' },
  { path: '/dashboard',      component: Dashboard,      name: 'dashboard',      meta: { requiresAuth: true } },
  { path: '/wallet',         component: Wallet,         name: 'wallet',         meta: { requiresAuth: true } },
  { path: '/wallet/deposit', component: Deposit,        name: 'deposit',        meta: { requiresAuth: true } },
  { path: '/wallet/withdraw', component: Withdraw,      name: 'withdraw',       meta: { requiresAuth: true } },
  { path: '/wallet/transactions', component: Transactions, name: 'transactions', meta: { requiresAuth: true } },
  { path: '/matches',        component: AllMatches,     name: 'matches' },
  { path: '/matches/:id',    component: MatchDetails,   name: 'match-details' },
  { path: '/my-matches',     component: MyMatches,      name: 'my-matches',     meta: { requiresAuth: true } },
  { path: '/tournaments',    component: Tournaments,    name: 'tournaments',    meta: { requiresAuth: true } },
  { path: '/tournaments/:id', component: TournamentDetails, name: 'tournament-details', meta: { requiresAuth: true } },
  { path: '/leaderboard',    component: Leaderboard,    name: 'leaderboard',    meta: { requiresAuth: true } },
  { path: '/profile',        component: Profile,        name: 'profile',        meta: { requiresAuth: true } },
  { path: '/notifications',  component: Notifications,  name: 'notifications',  meta: { requiresAuth: true } },
  { path: '/referral',       component: Referral,       name: 'referral',       meta: { requiresAuth: true } },

  // ── Admin Panel ────────────────────────────────────────────────────
  { path: '/admin',          redirect: '/admin/dashboard' },
  { path: '/admin/dashboard', component: AdminDashboard, name: 'admin-dashboard', meta: { requiresAuth: true, requiresAdmin: true, layout: 'admin' } },
  { path: '/admin/staff',    component: AdminUsers,     name: 'admin-staff',    meta: { requiresAuth: true, requiresAdmin: true, layout: 'admin' }, props: { roleType: 'staff' } },
  { path: '/admin/players',  component: AdminUsers,     name: 'admin-players',  meta: { requiresAuth: true, requiresAdmin: true, layout: 'admin' }, props: { roleType: 'player' } },
  { path: '/admin/users',    redirect: '/admin/players' },
  { path: '/admin/matches',  component: AdminMatches,   name: 'admin-matches',  meta: { requiresAuth: true, requiresAdmin: true, layout: 'admin' } },
  { path: '/admin/matches/:id/players', component: () => import('@/views/admin/MatchPlayers.vue'), name: 'admin-match-players', meta: { requiresAuth: true, requiresAdmin: true, layout: 'admin' } },
  { path: '/admin/deposits', component: AdminDeposits,  name: 'admin-deposits', meta: { requiresAuth: true, requiresAdmin: true, layout: 'admin' } },
  { path: '/admin/withdrawals', component: AdminWithdrawals, name: 'admin-withdrawals', meta: { requiresAuth: true, requiresAdmin: true, layout: 'admin' } },
  { path: '/admin/gateways',    component: AdminGateways,    name: 'admin-gateways',    meta: { requiresAuth: true, requiresAdmin: true, layout: 'admin' } },
  { path: '/admin/settings', component: () => import('@/views/admin/Settings.vue'), name: 'admin-settings', meta: { requiresAuth: true, requiresAdmin: true, layout: 'admin' } },
  { path: '/admin/tables', component: () => import('@/views/admin/Tables.vue'), name: 'admin-tables', meta: { requiresAuth: true, requiresAdmin: true, layout: 'admin' } },
  { path: '/admin/forms', component: () => import('@/views/admin/Forms.vue'), name: 'admin-forms', meta: { requiresAuth: true, requiresAdmin: true, layout: 'admin' } },

  // ── Catch-all ─────────────────────────────────────────────────────
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (!authStore.initialized) {
    await authStore.init()
  }

  // Must be logged in
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }

  // Already logged in → redirect away from auth pages
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return next({ name: 'home' })
  }

  // Must be admin
  if (to.meta.requiresAdmin && authStore.user?.role !== 'admin') {
    return next({ name: 'home' })
  }

  next()
})

export default router
