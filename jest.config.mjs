import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    // Handle module aliases (this will be automatically configured for you based on your tsconfig.json paths)
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
}

// react-markdown and its dependency tree are ESM-only; next/jest must transpile them.
const esmPackages = [
  'react-markdown',
  'remark-[\\w-]+',
  'rehype-[\\w-]+',
  'mdast-[\\w-]+',
  'micromark',
  'micromark-[\\w-]+',
  'unist-[\\w-]+',
  'hast-[\\w-]+',
  'estree-[\\w-]+',
  'vfile',
  'vfile-[\\w-]+',
  'unified',
  'bail',
  'devlop',
  'trough',
  'html-url-attributes',
  'property-information',
  'comma-separated-tokens',
  'space-separated-tokens',
  'decode-named-character-reference',
  'character-entities',
  'character-entities-[\\w-]+',
  'trim-lines',
  'stringify-entities',
  'ccount',
  'escape-string-regexp',
  'markdown-table',
  'zwitch',
  'longest-streak',
  'is-plain-obj',
].join('|')

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async.
// Override transformIgnorePatterns after next/jest merges defaults (it otherwise ignores custom values).
export default async function jestConfig() {
  const config = await createJestConfig(customJestConfig)()
  config.transformIgnorePatterns = [
    `/node_modules/(?!.pnpm)(?!(${esmPackages})/)`,
    `/node_modules/\\.pnpm/(?!(${esmPackages.replace(/-/g, '\\+')})@)`,
    '^.+\\.module\\.(css|sass|scss)$',
  ]
  return config
}
