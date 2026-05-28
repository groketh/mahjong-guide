#!/usr/bin/env node
// Compiles source.jsx → index.html. Run: node build.js
const babel = require('@babel/core');
const fs = require('fs');

const compiled = babel.transformSync(fs.readFileSync('./source.jsx', 'utf8'), {
  presets: ['@babel/preset-react'],
  compact: false,
}).code;

const css = fs.readFileSync('./src/styles.css', 'utf8');
const indented = compiled.split('\n').map(l => '  ' + l).join('\n');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>Mahjong Monday — Learn American Mah Jongg</title>
<meta name="description" content="A mobile-first guide to American Mah Jongg: tiles, the Charleston, the NMJL card, and the loop of a turn.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;600&family=DM+Mono:ital,wght@0,400;0,500;1,400&family=DM+Serif+Display:ital@0;1&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400&display=swap" rel="stylesheet">
<script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin><\/script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin><\/script>
<style>
${css}
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
