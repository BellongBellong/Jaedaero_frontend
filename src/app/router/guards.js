export function registerRouterGuards(router) {
  router.beforeEach((to) => {
    // 인증 기능이 연결되면 requiresAuth 메타를 기준으로 접근을 제어한다.
    if (to.meta.requiresAuth) {
      return true
    }

    return true
  })
}
