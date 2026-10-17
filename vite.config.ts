import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({ plugins:[react()], define:{"process.env.NODE_ENV":JSON.stringify("production")}, build:{ lib:{ entry:"src/remote.tsx", formats:["es"], fileName:()=>"remoteEntry.js" }, cssCodeSplit:false, rollupOptions:{ output:{ assetFileNames:"assets/[name][extname]" } } } });

