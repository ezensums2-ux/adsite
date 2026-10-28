import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readdirSync, existsSync, cpSync, copyFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 루트 디렉토리의 모든 HTML 파일을 다중 페이지 엔트리로 등록
const htmlFiles = readdirSync(__dirname)
  .filter(file => file.endsWith('.html'))
  .reduce((entries, file) => {
    const name = file.replace(/\.html$/, '');
    entries[name] = resolve(__dirname, file);
    return entries;
  }, {});

// 정적 파일 복사 플러그인 (assets/js, assets/images, robots.txt, sitemap.xml)
function copyAssetsPlugin() {
  return {
    name: 'copy-assets-plugin',
    closeBundle() {
      const distDir = resolve(__dirname, 'dist');
      if (!existsSync(distDir)) return;

      // assets/js 복사
      const jsSrc = resolve(__dirname, 'assets/js');
      const jsDest = resolve(distDir, 'assets/js');
      if (existsSync(jsSrc)) {
        cpSync(jsSrc, jsDest, { recursive: true, force: true });
      }

      // assets/images 복사
      const imgSrc = resolve(__dirname, 'assets/images');
      const imgDest = resolve(distDir, 'assets/images');
      if (existsSync(imgSrc)) {
        cpSync(imgSrc, imgDest, { recursive: true, force: true });
      }

      // assets/css도 원본 필요시 복사
      const cssSrc = resolve(__dirname, 'assets/css');
      const cssDest = resolve(distDir, 'assets/css');
      if (existsSync(cssSrc)) {
        cpSync(cssSrc, cssDest, { recursive: true, force: true });
      }

      // robots.txt 복사
      const robotsSrc = resolve(__dirname, 'robots.txt');
      const robotsDest = resolve(distDir, 'robots.txt');
      if (existsSync(robotsSrc)) {
        copyFileSync(robotsSrc, robotsDest);
      }

      // sitemap.xml 복사
      const sitemapSrc = resolve(__dirname, 'sitemap.xml');
      const sitemapDest = resolve(distDir, 'sitemap.xml');
      if (existsSync(sitemapSrc)) {
        copyFileSync(sitemapSrc, sitemapDest);
      }
    }
  };
}

export default defineConfig({
  plugins: [copyAssetsPlugin()],
  server: {
    open: true,
    port: 3000
  },
  build: {
    rollupOptions: {
      input: htmlFiles
    }
  }
});
