/**
 * Release input validator
 * Validates release identifiers for CI/CD pipeline
 * Accepts: SemVer, repository release ID, or sha256:<64 hex>
 * Rejects: empty values, spaces, command substitution, semicolons, backticks
 */

const SEMVER_PATTERN = /^v?\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?(\+[a-zA-Z0-9.]+)?$/
const RELEASE_ID_PATTERN = /^\d+$/
const SHA256_PATTERN = /^sha256:[a-f0-9]{64}$/

const DANGEROUS_PATTERNS = [
  /\s/, // whitespace
  /[;&|`$(){}]/, // shell metacharacters
  /\.\./, // path traversal
  /--/, // command flags
]

export function validateReleaseInput(input) {
  if (!input || typeof input !== 'string') {
    return {
      valid: false,
      error: 'Release input is required and must be a string',
    }
  }

  const trimmed = input.trim()

  if (trimmed.length === 0) {
    return {
      valid: false,
      error: 'Release input cannot be empty',
    }
  }

  if (trimmed !== input) {
    return {
      valid: false,
      error: 'Release input cannot have leading or trailing whitespace',
    }
  }

  // Check for dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(input)) {
      return {
        valid: false,
        error: `Release input contains invalid characters: ${pattern}`,
      }
    }
  }

  // Check valid formats
  if (SEMVER_PATTERN.test(input)) {
    return { valid: true, type: 'semver' }
  }

  if (RELEASE_ID_PATTERN.test(input)) {
    return { valid: true, type: 'release-id' }
  }

  if (SHA256_PATTERN.test(input)) {
    return { valid: true, type: 'sha256' }
  }

  return {
    valid: false,
    error: `Release input must be SemVer (e.g., 1.0.0), release ID (e.g., 12345), or sha256:<64 hex>`,
  }
}

// CLI mode
if (process.argv[1] && process.argv[1].includes('validate-release-input')) {
  const input = process.argv[2]
  const result = validateReleaseInput(input)

  if (!result.valid) {
    console.error(`ERROR: ${result.error}`)
    process.exit(1)
  }

  console.log(`Valid ${result.type}: ${input}`)
}
