export function registerRouterGuards(router) {
  router.beforeEach((to) => {
    const accessToken = localStorage.getItem('accessToken')

    if (to.meta.requiresAuth && !accessToken) {
      return {
        name: 'social-login',
        query: { redirect: to.fullPath },
      }
    }

    return true
  })
}
