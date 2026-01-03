// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   // plugins: [react()],
//    plugins: [react()],
//   optimizeDeps: {
//     exclude: ['@ckeditor/ckeditor5-build-classic']
//   }
  
// })


import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      "@ckeditor/ckeditor5-react",
      "@ckeditor/ckeditor5-build-classic"
    ]
  }
});
