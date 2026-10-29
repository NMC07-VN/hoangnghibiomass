import fs from 'node:fs/promises';
export const SOURCES = [
    { id: 'nang-luong-viet-nam', name: 'Năng lượng Việt Nam', url: 'https://nangluongvietnam.vn/tag/dien-sinh-khoi-629.tag', host: 'nangluongvietnam.vn' },
    { id: 'bao-cong-thuong', name: 'Báo Công Thương', url: 'https://congthuong.vn/chu-de/dien-sinh-khoi.topic', host: 'congthuong.vn' },
    { id: 'bao-chinh-phu', name: 'Báo Điện tử Chính phủ', url: 'https://baochinhphu.vn/tim-kiem.htm?keywords=sinh%20kh%E1%BB%91i', host: 'baochinhphu.vn' }
];
function text(value) { return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0*39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n))).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16))).replace(/\s+/g, ' ').trim().slice(0, 240); }
function sameSource(url, host) { try {
    const u = new URL(url);
    return u.protocol === 'https:' && (u.hostname === host || u.hostname.endsWith('.' + host));
}
catch {
    return false;
} }
function relevant(title) { return /sinh khối|viên nén|vỏ trấu|rơm rạ|gỗ băm|củi băm/i.test(title) && !/tuyển sinh|thí sinh|ngô sinh khối|nấm thượng hoàng/i.test(title); }
export function extractLink(body, source) {
    for (const m of body.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
        let url = '';
        try {
            url = new URL(m[1].replace(/&amp;/g, '&'), source.url).href;
        }
        catch {
            continue;
        }
        const path = new URL(url).pathname;
        if (!/\d+\.html?$/.test(path) || !sameSource(url, source.host))
            continue;
        const title = text(m[2]);
        if (title.length < 18 || !relevant(title))
            continue;
        return { title, url };
    }
    return null;
}
async function readPage(url, host) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
        const response = await fetch(url, { signal: controller.signal, headers: { Accept: 'text/html', 'User-Agent': 'HoangNghiBiomass-LinkMonitor/1.0' } });
        if (!response.ok || !sameSource(response.url, host))
            throw Error('Source unavailable');
        const reader = response.body?.getReader();
        if (!reader)
            throw Error('Empty source');
        const decoder = new TextDecoder();
        let body = '', size = 0;
        while (true) {
            const { done, value } = await reader.read();
            if (done)
                break;
            size += value.byteLength;
            if (size > 1500000) {
                await reader.cancel();
                throw Error('Source exceeds limit');
            }
            body += decoder.decode(value, { stream: true });
        }
        return body + decoder.decode();
    }
    finally {
        clearTimeout(timer);
    }
}
export function extractMetadata(body) {
    let imageUrl = null, publishedAt = null;
    for (const m of body.matchAll(/<meta\b[^>]*>/gi)) {
        const tag = m[0], key = tag.match(/(?:property|name)=["']([^"']+)["']/i)?.[1], value = tag.match(/content=["']([^"']*)["']/i)?.[1];
        if (!value)
            continue;
        if (key === 'og:image') {
            try {
                const u = new URL(value.replace(/&amp;/g, '&'));
                if (u.protocol === 'https:')
                    imageUrl = u.href;
            }
            catch { }
        }
        if (key === 'article:published_time' && !Number.isNaN(Date.parse(value)) && Date.parse(value) <= Date.now())
            publishedAt = new Date(value).toISOString();
    }
    return { imageUrl, publishedAt };
}
async function fetchLink(source) { const listing = await readPage(source.url, source.host); const link = extractLink(listing, source); if (!link)
    throw Error('No relevant source link'); const article = await readPage(link.url, source.host); return { ...link, ...extractMetadata(article) }; }

const prior=JSON.parse(await fs.readFile(new URL('../news.json',import.meta.url),'utf8'));
const now=new Date().toISOString();
const links=await Promise.all(SOURCES.map(async source=>{try{const item=await fetchLink(source);return {source:source.id,name:source.name,...item,checkedAt:now,attemptedAt:now,status:'ok'};}catch(error){const old=prior.links.find(x=>x.source===source.id);console.warn(source.name+': source unavailable; keeping last link');return {...old,attemptedAt:now,status:'source_unavailable'};}}));
if(links.some(x=>!x?.url))throw Error('Missing fallback source');
await fs.writeFile(new URL('../news.json',import.meta.url),JSON.stringify({timezone:'Asia/Ho_Chi_Minh',policy:'links_only',links},null,2)+'\n');
console.log('Checked '+links.length+' Vietnamese sources; no article content or image bytes saved.');
