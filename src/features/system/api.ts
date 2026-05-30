import {
  defineGetEndpoint,
  definePostEndpoint,
  definePutEndpoint,
  defineDeleteEndpoint,
  requestEndpoint,
  type InferEndpointRequest,
  type InferEndpointResponse,
  type PageResult,
} from '@/core/http'

interface SystemUser {
  id: string
  username: string
  nickname: string
  email: string
  phone: string
  status: '0' | '1'
  roles: string[]
  createdAt: string
}

interface SystemRole {
  id: string
  name: string
  code: string
  sort: number
  status: '0' | '1'
  createdAt: string
}

interface DictType {
  id: string
  name: string
  code: string
  status: '0' | '1'
}

interface DictData {
  id: string
  label: string
  value: string
  sort: number
  status: '0' | '1'
  typeCode: string
}

export const getSystemUserPageEndpoint = defineGetEndpoint<
  '/api/system/users',
  PageResult<SystemUser>,
  { page: number; pageSize: number; username?: string; status?: string }
>('/api/system/users')

export const createSystemUserEndpoint = definePostEndpoint<
  '/api/system/users',
  void,
  Omit<SystemUser, 'id' | 'createdAt'>
>('/api/system/users')

export const updateSystemUserEndpoint = definePutEndpoint<
  '/api/system/users/:id',
  void,
  Partial<Omit<SystemUser, 'id' | 'createdAt'>>
>('/api/system/users/:id')

export const deleteSystemUserEndpoint = defineDeleteEndpoint<'/api/system/users/:id', void>(
  '/api/system/users/:id',
)

export const getSystemRoleListEndpoint = defineGetEndpoint<'/api/system/roles', SystemRole[]>(
  '/api/system/roles',
)

export const createSystemRoleEndpoint = definePostEndpoint<
  '/api/system/roles',
  void,
  Omit<SystemRole, 'id' | 'createdAt'>
>('/api/system/roles')

export const updateSystemRoleEndpoint = definePutEndpoint<
  '/api/system/roles/:id',
  void,
  Partial<Omit<SystemRole, 'id' | 'createdAt'>>
>('/api/system/roles/:id')

export const deleteSystemRoleEndpoint = defineDeleteEndpoint<'/api/system/roles/:id', void>(
  '/api/system/roles/:id',
)

export const getDictTypeListEndpoint = defineGetEndpoint<'/api/system/dicts', DictType[]>(
  '/api/system/dicts',
)

export const createDictTypeEndpoint = definePostEndpoint<
  '/api/system/dicts',
  void,
  Omit<DictType, 'id'>
>('/api/system/dicts')

export const updateDictTypeEndpoint = definePutEndpoint<
  '/api/system/dicts/:id',
  void,
  Partial<Omit<DictType, 'id'>>
>('/api/system/dicts/:id')

export const deleteDictTypeEndpoint = defineDeleteEndpoint<'/api/system/dicts/:id', void>(
  '/api/system/dicts/:id',
)

export const getDictDataListEndpoint = defineGetEndpoint<
  '/api/system/dicts/:type/data',
  DictData[],
  { typeCode: string }
>('/api/system/dicts/:type/data')

export const createDictDataEndpoint = definePostEndpoint<
  '/api/system/dicts/:type/data',
  void,
  Omit<DictData, 'id' | 'typeCode'>
>('/api/system/dicts/:type/data')

export const updateDictDataEndpoint = definePutEndpoint<
  '/api/system/dicts/data/:id',
  void,
  Partial<Omit<DictData, 'id' | 'typeCode'>>
>('/api/system/dicts/data/:id')

export const deleteDictDataEndpoint = defineDeleteEndpoint<'/api/system/dicts/data/:id', void>(
  '/api/system/dicts/data/:id',
)

export type SystemUserData = InferEndpointResponse<typeof getSystemUserPageEndpoint>
export type SystemRoleData = InferEndpointResponse<typeof getSystemRoleListEndpoint>
export type DictTypeData = InferEndpointResponse<typeof getDictTypeListEndpoint>
export type DictDataItem = InferEndpointResponse<typeof getDictDataListEndpoint>[number]

export async function getSystemUserPage(
  params: InferEndpointRequest<typeof getSystemUserPageEndpoint>,
) {
  return requestEndpoint(getSystemUserPageEndpoint, {
    payload: params,
    config: { timeout: 8000 },
  })
}

export async function createSystemUser(
  data: InferEndpointRequest<typeof createSystemUserEndpoint>,
) {
  return requestEndpoint(createSystemUserEndpoint, {
    payload: data,
    config: { timeout: 8000 },
  })
}

export async function updateSystemUser(
  id: string,
  data: InferEndpointRequest<typeof updateSystemUserEndpoint>,
) {
  void id
  return requestEndpoint(updateSystemUserEndpoint, {
    payload: data,
    config: { timeout: 8000 },
  })
}

export async function deleteSystemUser(id: string) {
  void id
  return requestEndpoint(deleteSystemUserEndpoint, {
    payload: undefined,
    config: { timeout: 8000 },
  })
}

export async function getSystemRoleList() {
  return requestEndpoint(getSystemRoleListEndpoint, {
    config: { timeout: 8000 },
  })
}

export async function createSystemRole(
  data: InferEndpointRequest<typeof createSystemRoleEndpoint>,
) {
  return requestEndpoint(createSystemRoleEndpoint, {
    payload: data,
    config: { timeout: 8000 },
  })
}

export async function updateSystemRole(
  id: string,
  data: InferEndpointRequest<typeof updateSystemRoleEndpoint>,
) {
  void id
  return requestEndpoint(updateSystemRoleEndpoint, {
    payload: data,
    config: { timeout: 8000 },
  })
}

export async function deleteSystemRole(id: string) {
  void id
  return requestEndpoint(deleteSystemRoleEndpoint, {
    payload: undefined,
    config: { timeout: 8000 },
  })
}

export async function getDictTypeList() {
  return requestEndpoint(getDictTypeListEndpoint, {
    config: { timeout: 8000 },
  })
}

export async function createDictType(data: InferEndpointRequest<typeof createDictTypeEndpoint>) {
  return requestEndpoint(createDictTypeEndpoint, {
    payload: data,
    config: { timeout: 8000 },
  })
}

export async function updateDictType(
  id: string,
  data: InferEndpointRequest<typeof updateDictTypeEndpoint>,
) {
  void id
  return requestEndpoint(updateDictTypeEndpoint, {
    payload: data,
    config: { timeout: 8000 },
  })
}

export async function deleteDictType(id: string) {
  void id
  return requestEndpoint(deleteDictTypeEndpoint, {
    payload: undefined,
    config: { timeout: 8000 },
  })
}

export async function getDictDataList(typeCode: string) {
  return requestEndpoint(getDictDataListEndpoint, {
    payload: { typeCode },
    config: { timeout: 8000 },
  })
}

export async function createDictData(
  typeCode: string,
  data: InferEndpointRequest<typeof createDictDataEndpoint>,
) {
  void typeCode
  return requestEndpoint(createDictDataEndpoint, {
    payload: data,
    config: { timeout: 8000 },
  })
}

export async function updateDictData(
  id: string,
  data: InferEndpointRequest<typeof updateDictDataEndpoint>,
) {
  void id
  return requestEndpoint(updateDictDataEndpoint, {
    payload: data,
    config: { timeout: 8000 },
  })
}

export async function deleteDictData(id: string) {
  void id
  return requestEndpoint(deleteDictDataEndpoint, {
    payload: undefined,
    config: { timeout: 8000 },
  })
}
