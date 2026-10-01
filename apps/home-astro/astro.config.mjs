import {defineConfig} from 'astro/config';
export default defineConfig({site:'https://creativemk.net', output:'static', build:{assets:'home-astro/_astro'}, image:{service:{entrypoint:'astro/assets/services/sharp'}}});
