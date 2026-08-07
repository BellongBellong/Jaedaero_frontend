<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AssetAccountListItem from '@/features/dashboard/components/AssetAccountListItem.vue'
import { getDashboardMock } from '@/features/dashboard/mocks/dashboard.mock'

const route = useRoute()
const router = useRouter()
const dashboard = computed(() => {
  const persona = Array.isArray(route.query.persona) ? route.query.persona[0] : route.query.persona
  const scenario = Array.isArray(route.query.scenario)
    ? route.query.scenario[0]
    : route.query.scenario
  return getDashboardMock({ persona, scenario })
})
const accounts = computed(() => dashboard.value.assetSummary.total.accounts ?? [])

function openAccount(account) {
  router.push({
    name: 'account-transactions',
    params: { accountId: account.id ?? account.accountId },
    query: route.query,
  })
}
</script>

<template>
  <main class="transaction-history screen app-page">
    <h1>내 계좌</h1>
    <ul v-if="accounts.length">
      <AssetAccountListItem
        v-for="account in accounts"
        :key="account.id || account.accountId"
        :account="account"
        clickable
        @select="openAccount"
      />
    </ul>
    <p v-else>
      연결된 계좌가 없어요.
    </p>
  </main>
</template>

<style scoped>
.transaction-history {
  background: var(--ui-background);
}

.transaction-history h1 {
  margin: 0 0 16px;
  color: var(--gray-600);
  font-size: 16px;
  line-height: 1.5;
}

.transaction-history ul {
  display: grid;
  gap: 10px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.transaction-history > p {
  display: grid;
  min-height: 160px;
  margin: 0;
  border-radius: 28px;
  background: var(--white);
  color: var(--gray-400);
  font-size: 13px;
  place-items: center;
}
</style>
