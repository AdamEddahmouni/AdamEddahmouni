/**
 * Local README preview.
 *
 * Converts README.md into a standalone HTML page styled to approximate
 * GitHub's README column (max-width 1012px, 32px gutters, GitHub's heading and
 * code treatments) so the artwork can be judged at the width it will actually
 * occupy. Raw HTML in the README, which is most of it, is passed through
 * untouched — exactly as GitHub's sanitizer would mostly leave it.
 *
 * This is a development harness. It is not the acceptance test; the acceptance
 * test is GitHub's own renderer.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT } from './lib/svg.mjs'

const markdown = readFileSync(join(ROOT, 'README.md'), 'utf8')

const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function inline(src) {
  let out = escape(src)
  // images before links
  out = out.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img alt="$1" src="$2">')
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>')
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>')
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  out = out.replace(/(^|\s)_([^_]+)_/g, '$1<em>$2</em>')
  return out
}

function toHtml(md) {
  const lines = md.split('\n')
  const out = []
  let i = 0
  let list = null

  const flushList = () => {
    if (list) { out.push(`</${list}>`); list = null }
  }

  while (i < lines.length) {
    const line = lines[i]

    // raw HTML block passes through until a blank line
    if (/^\s*</.test(line)) {
      flushList()
      const block = []
      while (i < lines.length && !/^\s*$/.test(lines[i])) block.push(lines[i++])
      out.push(block.join('\n'))
      continue
    }

    if (/^\s*$/.test(line)) { flushList(); i++; continue }
    if (/^---+\s*$/.test(line)) { flushList(); out.push('<hr>'); i++; continue }

    const heading = line.match(/^(#{1,6})\s+(.*)$/)
    if (heading) {
      flushList()
      const level = heading[1].length
      out.push(`<h${level}>${inline(heading[2])}</h${level}>`)
      i++
      continue
    }

    const bullet = line.match(/^\s*[-*]\s+(.*)$/)
    if (bullet) {
      if (list !== 'ul') { flushList(); out.push('<ul>'); list = 'ul' }
      out.push(`<li>${inline(bullet[1])}</li>`)
      i++
      continue
    }

    flushList()
    const para = [line]
    i++
    while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^(#{1,6})\s|^\s*[-*]\s|^\s*</.test(lines[i])) {
      para.push(lines[i++])
    }
    out.push(`<p>${inline(para.join(' '))}</p>`)
  }
  flushList()
  return out.join('\n')
}

const css = `
:root { color-scheme: light dark; }
* { box-sizing: border-box; }
body { margin: 0; }
main {
  max-width: 1012px; margin: 0 auto; padding: 32px;
  font: 400 16px/1.55 -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
  background: #ffffff; color: #1f2328;
}
main.dark, @media (prefers-color-scheme: dark) { }
@media (prefers-color-scheme: dark) {
  main { background: #0d1117; color: #e6edf3; }
}
main h1, main h2, main h3, main h4 { margin: 26px 0 12px; font-weight: 600; line-height: 1.25; }
main h1 { font-size: 2em; }
main h2 { font-size: 1.5em; padding-bottom: .3em; border-bottom: 1px solid #d1d9e0; }
main h3 { font-size: 1.22em; }
main p { margin: 0 0 14px; }
main a { color: #0969da; text-decoration: none; }
main a:hover { text-decoration: underline; }
main code {
  font: 85% ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  background: rgba(175,184,193,.2); padding: .2em .4em; border-radius: 6px;
}
main ul { padding-left: 2em; margin: 0 0 14px; }
main li { margin: 4px 0; }
main hr { border: 0; border-top: 1px solid #d1d9e0; margin: 24px 0; }
main img { max-width: 100%; height: auto; }
main picture { display: block; }
main img + em, main p > em { color: #57606a; }
@media (prefers-color-scheme: dark) {
  main h2 { border-color: #3d444d; }
  main a { color: #4493f8; }
  main hr { border-color: #3d444d; }
  main img + em, main p > em { color: #9198a1; }
}
`

// The harness lives in tools/.preview/, so the README's ./assets/... paths must
// be rebased to the repository root.
const body = toHtml(markdown).replace(/\.\/assets\//g, '../../assets/')

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>README preview</title>
<style>${css}</style>
</head>
<body>
<main class="markdown-body">
${body}
</main>
</body>
</html>
`

mkdirSync(join(ROOT, 'tools', '.preview'), { recursive: true })
writeFileSync(join(ROOT, 'tools', '.preview', 'index.html'), html)
console.log('tools/.preview/index.html written')
