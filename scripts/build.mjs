import fs from 'node:fs/promises';
await fs.mkdir('_site',{recursive:true});
for(const name of ['index.html','company.css','company.js','news.json','.nojekyll'])await fs.copyFile(name,'_site/'+name);
await fs.cp('assets','_site/assets',{recursive:true});
console.log('Static site ready in _site');
