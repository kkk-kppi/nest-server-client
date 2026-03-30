import { visualizer } from 'rollup-plugin-visualizer'

export function createBundleReportPlugin() {
  return visualizer({
    filename: 'dist/bundle-report.html',
    gzipSize: true,
    brotliSize: true,
  })
}
