import router from '@/router'

export default store => {
  let isLoggedIn = () => store.getters['auth/isLoggedIn']
  let hasActiveGroup = () => !!store.getters['groups/activeGroup']
  let getUserGroupId = () => isLoggedIn() && store.getters['auth/user'].currentGroup

  router.beforeEach((to, from, next) => {
    if (to.matched.some(m => m.meta.requireLoggedIn) && !isLoggedIn()) {
      let {name, params} = to
      store.dispatch('auth/setRedirectTo', {name, params})
      next({name: 'login'})
    }
    else {
      next()
    }
  })

  router.beforeEach((to, from, next) => {
    if (to.matched.some(m => m.meta.requireLoggedOut) && isLoggedIn()) {
      next({name: 'index'})
    }
    else {
      next()
    }
  })

  router.afterEach((to, from) => {
    // save Breadcrumbs to store
    if (!(to.meta) || !(to.meta.breadcrumbs)) {
      store.dispatch('breadcrumbs/setAll', {breadcrumbs: [{name: 'not defined'}]})
    }
    store.dispatch('breadcrumbs/setAll', {breadcrumbs: to.meta.breadcrumbs || []})

    // save active group/store/user
    if (to.params.groupId) {
      store.dispatch('groups/selectGroup', {groupId: to.params.groupId})
    }
    if (to.params.storeId) {
      store.dispatch('stores/selectStore', {storeId: to.params.storeId})
    }
    if (to.params.userId) {
      store.dispatch('users/selectUser', {userId: to.params.userId})
    }

    /* If:
        - the group is not mentioned in the URL
        - we do not have an active group
        - the user has a currentGroup
      Then:
        - set the users current group to be the active one
     */
    if (!to.params.groupId && !hasActiveGroup() && isLoggedIn()) {
      let groupId = getUserGroupId()
      if (groupId) store.dispatch('groups/selectGroup', { groupId })
    }
  })
}