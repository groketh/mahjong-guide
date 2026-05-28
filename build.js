#!/usr/bin/env node
// Compiles source.jsx → index.html. Run: node build.js
const babel = require('@babel/core');
const fs = require('fs');

const compiled = babel.transformSync(fs.readFileSync('./source.jsx', 'utf8'), {
  presets: ['@babel/preset-react'],
  compact: false,
}).code;

const indented = compiled.split('\n').map(l => '  ' + l).join('\n');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>American Mahjong — The Definitive Guide</title>
<meta name="description" content="The complete guide to American Mah Jongg: tiles, hands, setup, the Charleston, scoring, etiquette, and strategy.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
<script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin><\/script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin><\/script>
<script src="https://cdn.tailwindcss.com"><\/script>
<style>
  html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
  body { margin: 0; font-family: 'Cormorant Garamond', Georgia, serif; }
  nav::-webkit-scrollbar { display: none; height: 0; }
</style>
</head>
<body>
<div id="root"></div>
<script>
${indented}
<\/script>
</body>
</html>`;

fs.writeFileSync('./index.html', html);
console.log(`Built index.html (${html.length} bytes)`);
