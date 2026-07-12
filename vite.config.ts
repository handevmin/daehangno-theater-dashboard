import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

// 개발 서버에서 Vercel 서버리스 함수와 동일한 KOPIS 프록시를 제공한다.
// (프로덕션은 /api/*.js 가 Vercel 함수로 동작, 로컬은 이 미들웨어가 같은 핸들러를 실행)
function kopisDevProxy(mode: string) {
  return {
    name: 'kopis-dev-proxy',
    async configureServer(server: any) {
      const env = loadEnv(mode, process.cwd(), '')
      if (env.KOPIS_SERVICE_KEY) process.env.KOPIS_SERVICE_KEY = env.KOPIS_SERVICE_KEY
      if (env.OPENAI_API_KEY) process.env.OPENAI_API_KEY = env.OPENAI_API_KEY
      if (env.OPENAI_MODEL) process.env.OPENAI_MODEL = env.OPENAI_MODEL
      const { handleKopis, handleKopisImage } = await import('./api/_kopis.js')
      const { handleDashboard } = await import('./api/_dashboard.js')
      const { handleAiCuration } = await import('./api/_ai-curation.js')
      const { handleQuizRecommend } = await import('./api/_quiz-recommend.js')
      const fs = await import('node:fs')
      const path = await import('node:path')
      server.middlewares.use('/api/dashboard', (req: any, res: any) => handleDashboard(req, res))
      server.middlewares.use('/api/ai-curation', (req: any, res: any) => handleAiCuration(req, res))
      server.middlewares.use('/api/quiz-recommend', (req: any, res: any) => handleQuizRecommend(req, res))
      server.middlewares.use('/api/kopis-img', (req: any, res: any) => handleKopisImage(req, res))
      server.middlewares.use('/api/kopis', (req: any, res: any) => handleKopis(req, res))
      // 편집모드 저장: 핀 좌표를 venuePositions.json 에 기록 (개발서버 전용)
      server.middlewares.use('/api/save-venues', (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('POST only')
          return
        }
        let body = ''
        req.on('data', (c: any) => (body += c))
        req.on('end', () => {
          try {
            const data = JSON.parse(body)
            const file = path.resolve(process.cwd(), 'src/imports/지도/venuePositions.json')
            fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf-8')
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({ ok: true, count: Object.keys(data).length }))
          } catch (e: any) {
            res.statusCode = 400
            res.end('invalid: ' + (e?.message || e))
          }
        })
      })
    },
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [
    figmaAssetResolver(),
    kopisDevProxy(mode),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
}))
