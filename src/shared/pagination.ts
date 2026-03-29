export function getTotalPages(total: number, pageSize: number) {
  if (pageSize <= 0) {
    return 1
  }

  const pages = Math.ceil(total / pageSize)
  return pages > 0 ? pages : 1
}

export function clampPage(page: number, totalPages: number) {
  if (page < 1) {
    return 1
  }

  if (page > totalPages) {
    return totalPages
  }

  return page
}

export function hasPageItems<T>(items: T[] | null | undefined) {
  return (items?.length ?? 0) > 0
}

export function parsePositiveInt(value: unknown, fallback: number) {
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== 'string') {
    return fallback
  }

  const parsed = Number.parseInt(raw, 10)
  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback
  }

  return parsed
}

export function resolvePageSize(value: number, options: number[], fallback: number) {
  return options.includes(value) ? value : fallback
}
