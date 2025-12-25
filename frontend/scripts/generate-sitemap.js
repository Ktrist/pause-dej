import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '..', '.env') })

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes')
  console.error('Assurez-vous que VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont définies')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const baseUrl = 'https://pause-dej.fr'

async function generateSitemap() {
  console.log('🚀 Génération du sitemap...')

  // Pages statiques
  const staticPages = [
    { url: '/', priority: 1.0, changefreq: 'daily' },
    { url: '/a-la-carte', priority: 0.9, changefreq: 'daily' },
    { url: '/comment-ca-marche', priority: 0.8, changefreq: 'monthly' },
    { url: '/pause-dej-at-work', priority: 0.7, changefreq: 'weekly' },
    { url: '/contact', priority: 0.6, changefreq: 'monthly' },
    { url: '/login', priority: 0.4, changefreq: 'yearly' },
    { url: '/signup', priority: 0.4, changefreq: 'yearly' },
    { url: '/legal/mentions-legales', priority: 0.3, changefreq: 'yearly' },
    { url: '/legal/cgv', priority: 0.3, changefreq: 'yearly' },
    { url: '/legal/confidentialite', priority: 0.3, changefreq: 'yearly' },
    { url: '/legal/cookies', priority: 0.3, changefreq: 'yearly' }
  ]

  // Récupérer les plats disponibles depuis Supabase
  console.log('📡 Récupération des plats depuis Supabase...')
  const { data: dishes, error } = await supabase
    .from('dishes')
    .select('id, updated_at')
    .eq('is_available', true)

  if (error) {
    console.error('❌ Erreur lors de la récupération des plats:', error.message)
  }

  // Pages dynamiques (plats)
  const dishPages = dishes?.map(dish => ({
    url: `/a-la-carte?dish=${dish.id}`,
    priority: 0.7,
    changefreq: 'weekly',
    lastmod: dish.updated_at
  })) || []

  console.log(`✅ ${dishes?.length || 0} plats trouvés`)

  const allPages = [...staticPages, ...dishPages]

  // Générer XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    ${page.lastmod ? `<lastmod>${new Date(page.lastmod).toISOString()}</lastmod>` : `<lastmod>${new Date().toISOString()}</lastmod>`}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  // Écrire le fichier dans public/
  const publicDir = path.join(__dirname, '..', 'public')
  const sitemapPath = path.join(publicDir, 'sitemap.xml')

  // Créer le dossier public s'il n'existe pas
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }

  fs.writeFileSync(sitemapPath, xml)

  console.log(`✅ Sitemap généré avec succès!`)
  console.log(`   - ${allPages.length} URLs au total`)
  console.log(`   - ${staticPages.length} pages statiques`)
  console.log(`   - ${dishPages.length} pages de plats`)
  console.log(`   📄 Fichier: ${sitemapPath}`)
}

generateSitemap().catch(error => {
  console.error('❌ Erreur:', error)
  process.exit(1)
})
