import { defineConfig } from 'vite';
export default defineConfig({resolve:{dedupe:['react','react-dom']},optimizeDeps:{include:['react','react-dom/client','react-router-dom','lucide-react']},server:{host:'127.0.0.1',port:5173,strictPort:true,proxy:{'/api':{target:'http://127.0.0.1:3001'}}}});
