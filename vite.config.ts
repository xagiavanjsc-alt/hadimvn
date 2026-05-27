import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import AutoImport from "unplugin-auto-import/vite";
// import { readdyJsxRuntimeProxyPlugin } from "./vite.jsx-runtime-proxy";

const base = process.env.BASE_PATH || "/";
const isPreview = process.env.IS_PREVIEW ? true : false;
// Single source of truth for public URL. Mirrors src/lib/siteConfig.ts default
// so static index.html, dynamic React SEO, and the sitemap generator agree.
const siteUrl = (process.env.VITE_SITE_URL || "https://hanquocoi.vn").replace(/\/+$/, "");
//const proxyPlugins = isPreview ? [readdyJsxRuntimeProxyPlugin()] : [];
// https://vite.dev/config/
export default defineConfig({
  define: {
    __BASE_PATH__: JSON.stringify(base),
    __IS_PREVIEW__: JSON.stringify(isPreview),
    __READDY_PROJECT_ID__: JSON.stringify(process.env.PROJECT_ID || ""),
    __READDY_VERSION_ID__: JSON.stringify(process.env.VERSION_ID || ""),
    __READDY_AI_DOMAIN__: JSON.stringify(process.env.READDY_AI_DOMAIN || ""),
  },
  plugins: [
    // ...proxyPlugins,
    {
      // Replace __SITE_URL__ tokens in index.html with the resolved site URL
      // so canonical/og:url/JSON-LD don't need source edits on domain change.
      name: "inject-site-url",
      transformIndexHtml(html: string) {
        return html.replaceAll("__SITE_URL__", siteUrl);
      },
    },
    react(),
    AutoImport({
      imports: [
        {
          react: [
            ["default", "React"],
            "useState",
            "useEffect",
            "useContext",
            "useReducer",
            "useCallback",
            "useMemo",
            "useRef",
            "useImperativeHandle",
            "useLayoutEffect",
            "useDebugValue",
            "useDeferredValue",
            "useId",
            "useInsertionEffect",
            "useSyncExternalStore",
            "useTransition",
            "startTransition",
            "lazy",
            "memo",
            "forwardRef",
            "createContext",
            "createElement",
            "cloneElement",
            "isValidElement",
          ],
        },
        {
          "react-router-dom": [
            "useNavigate",
            "useLocation",
            "useParams",
            "useSearchParams",
            "Link",
            "NavLink",
            "Navigate",
            "Outlet",
          ],
        },
      ],
      dts: true,
    }),
  ],
  base,
  build: {
    sourcemap: true,
    outDir: 'dist',
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) return 'react-vendor';
          if (id.includes('node_modules/@supabase')) return 'supabase';
          if (id.includes('node_modules/xlsx') || id.includes('node_modules/html2canvas') || id.includes('node_modules/dompurify')) return 'heavy-libs';
          if (id.includes('src/services/aiService')) return 'ai-service';
          // Large static data — split into own chunks for lazy loading
          if (id.includes('src/mocks/data/seoul-books-data')) return 'data-seoul';
          if (id.includes('src/mocks/data/eps-lessons-data')) return 'data-eps';
          if (id.includes('src/mocks/data/vocabulary-data-data')) return 'data-vocab';
          if (id.includes('src/mocks/data/hanja-data')) return 'data-hanja';
        }
      }
    }
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    host: "0.0.0.0",
  },
});
