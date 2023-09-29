// debug-build.js
const { build } = require('vite');

(async () => {
  try {
    await build({
      // your build options here
    });
  } catch (e) {
    console.error('Build failed:', e);
  }
})();
