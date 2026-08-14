import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from '@/app/App.vue'
import router from '@/app/router'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import '@/common/styles/main.css'

const pinia = createPinia()
const authStore = useAuthStore(pinia)

async function bootstrap() {
  await authStore.restoreSession()

  const app = createApp(App)

  app.use(pinia)
  app.use(router)

  app.mount('#app')
}

bootstrap()
