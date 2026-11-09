/** Check every committed V4 image referenced by README.md, including linked buttons. */
import { readFileSync, existsSync, statSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const readme = readFileSync(resolve(ROOT, 'README.md'), 'utf8')
const refs = [...new Set([...readme.matchAll(/\.\/assets\/studio-v4\/[\w./-]+\.webp/g)].map(m=>m[0].slice(2)))].sort()
const budgets = {hero:550000,gallery:250000,glance:50000,buttons:15000,cards:200000,footer:120000}
let problems=0,total=0
for(const ref of refs){
 const file=resolve(ROOT,ref)
 if (!existsSync(file)) {console.error(`MISSING ${ref}`);problems++;continue}
 const size=statSync(file).size,totalOld=total;total += size
 const buf=readFileSync(file)
 if(buf.toString('ascii',0,4)!=='RIFF'||buf.toString('ascii',8,12)!=='WEBP'){console.error(`INVALID WebP ${ref}`);problems++}
 const type=ref.split('/')[3]
 const budget=budgets[type]
 if(!budget||size>budget){console.error(`OVERSIZE ${ref} (${size} > ${budget ?? 0})`);problems++}
 console.log(`${ref}: ${size} bytes`)
}
if(refs.length<12){console.error(`Expected V4 hero, glance, gallery & linked buttons; found ${refs.length} image refs`);problems++}
console.log(`V4: ${refs.length} unique assets, ${total} bytes, ${problems} problems`)
process.exit(problems?1:0)
