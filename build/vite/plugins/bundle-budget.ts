interface GeneratedChunk {
  type: 'chunk'
  fileName: string
  code: string
  imports: string[]
  dynamicImports?: string[]
  isEntry: boolean
  isImplicitEntry: boolean
  isDynamicEntry?: boolean
}

function toKib(bytes: number) {
  return Number((bytes / 1024).toFixed(2))
}

export function createBundleBudgetPlugin(entryBudgetKib: number, asyncBudgetKib: number) {
  return {
    name: 'bundle-budget',
    generateBundle(_: unknown, bundle: Record<string, unknown>) {
      const chunks = Object.values(bundle).filter((item): item is GeneratedChunk => {
        if (!item || typeof item !== 'object') {
          return false
        }
        const chunk = item as Partial<GeneratedChunk>
        return (
          chunk.type === 'chunk' &&
          typeof chunk.fileName === 'string' &&
          typeof chunk.code === 'string'
        )
      })
      const chunkByFileName = new Map(chunks.map((chunk) => [chunk.fileName, chunk]))
      const violations: string[] = []

      const resolveStaticImports = (entryChunk: GeneratedChunk) => {
        const visited = new Set<string>()
        const stack = [entryChunk]
        while (stack.length > 0) {
          const current = stack.pop()
          if (!current || visited.has(current.fileName)) {
            continue
          }
          visited.add(current.fileName)
          const dynamicImportSet = new Set(current.dynamicImports ?? [])
          for (const importFileName of current.imports) {
            if (dynamicImportSet.has(importFileName)) {
              continue
            }
            const imported = chunkByFileName.get(importFileName)
            if (imported && !visited.has(imported.fileName) && imported.isDynamicEntry !== true) {
              stack.push(imported)
            }
          }
        }
        return visited
      }

      for (const entryChunk of chunks.filter((chunk) => chunk.isEntry)) {
        const staticImports = resolveStaticImports(entryChunk)
        const totalBytes = [...staticImports].reduce((sum, fileName) => {
          const targetChunk = chunkByFileName.get(fileName)
          return sum + (targetChunk ? Buffer.byteLength(targetChunk.code, 'utf8') : 0)
        }, 0)
        const totalKib = toKib(totalBytes)
        if (totalKib > entryBudgetKib) {
          const details = [...staticImports]
            .map((fileName) => {
              const targetChunk = chunkByFileName.get(fileName)
              const bytes = targetChunk ? Buffer.byteLength(targetChunk.code, 'utf8') : 0
              return `${fileName}: ${toKib(bytes)} KiB`
            })
            .join(', ')
          violations.push(
            `入口 ${entryChunk.fileName} 静态依赖体积 ${totalKib} KiB，超过预算 ${entryBudgetKib} KiB（${details}）`,
          )
        }
      }

      for (const asyncChunk of chunks.filter((chunk) => !chunk.isEntry && !chunk.isImplicitEntry)) {
        const asyncKib = toKib(Buffer.byteLength(asyncChunk.code, 'utf8'))
        if (asyncKib > asyncBudgetKib) {
          violations.push(
            `异步 chunk ${asyncChunk.fileName} 体积 ${asyncKib} KiB，超过预算 ${asyncBudgetKib} KiB`,
          )
        }
      }

      if (violations.length > 0) {
        throw new Error(`性能预算校验失败:\n${violations.join('\n')}`)
      }
    },
  }
}
