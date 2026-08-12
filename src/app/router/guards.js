export function registerRouterGuards(router) {
  router.beforeEach((to) => {
    if (to.meta.requiresAuth && !localStorage.getItem('accessToken')) {
      return {
        name: 'social-login',
        query: { redirect: to.fullPath },
      }
    }

    return true
  })
}
