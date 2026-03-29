import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export type UserRole = 'admin' | 'editor' | 'viewer'
const storage = typeof window === 'undefined' ? undefined : window.sessionStorage

export const useAuthStore = defineStore(
  'auth',
  () => {
    const accessToken = ref('')
    const roles = ref<UserRole[]>([])
    const permissions = ref<string[]>([])
    const authNotice = ref('')

    const isAuthenticated = computed(() => accessToken.value.length > 0)

    function setSession(payload: {
      accessToken: string
      roles: UserRole[]
      permissions: string[]
    }) {
      accessToken.value = payload.accessToken
      roles.value = payload.roles
      permissions.value = payload.permissions
    }

    function clearSession() {
      accessToken.value = ''
      roles.value = []
      permissions.value = []
    }

    function setAuthNotice(message: string) {
      authNotice.value = message
    }

    function clearAuthNotice() {
      authNotice.value = ''
    }

    return {
      accessToken,
      roles,
      permissions,
      authNotice,
      isAuthenticated,
      setSession,
      clearSession,
      setAuthNotice,
      clearAuthNotice,
    }
  },
  {
    persist: {
      storage,
      pick: ['accessToken', 'roles', 'permissions'],
    },
  },
)
