
const urls = [
    // Standard
    "https://www.youtube.com/watch?v=cM0la5wAAx4",
    "https://youtu.be/cM0la5wAAx4",
    // Embed
    "https://www.youtube.com/embed/cM0la5wAAx4",
    // Shorts
    "https://www.youtube.com/shorts/cM0la5wAAx4",
    // Live
    "https://www.youtube.com/live/cM0la5wAAx4",
    // Mobile
    "https://m.youtube.com/watch?v=cM0la5wAAx4",
    // With params
    "https://www.youtube.com/watch?v=cM0la5wAAx4&t=123s",
    // Dirty (spaces)
    " https://www.youtube.com/watch?v=cM0la5wAAx4 ",
    // Vimeo
    "https://vimeo.com/123456789",
    "https://player.vimeo.com/video/123456789"
];

const getEmbedUrl = (url) => {
    if (!url) return '';
    let cleanUrl = url.trim();

    // 1. YouTube Parser (Aggressive)
    if (cleanUrl.match(/(youtube|youtu\.be)/)) {
        // Try standard ID extraction
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/|live\/)([^#&?]*).*/;
        const match = cleanUrl.match(regExp);

        let videoId = (match && match[2].length === 11) ? match[2] : null;

        // Fallback: search for "v=" directly if regex failed
        if (!videoId && cleanUrl.includes('v=')) {
            const parts = cleanUrl.split('v=');
            videoId = parts[parts.length - 1].split('&')[0];
        }

        // If we found something that looks like an ID
        if (videoId && videoId.length >= 10) {
            return `https://www.youtube.com/embed/${videoId}`;
        }
    }

    // 2. Vimeo Parser
    if (cleanUrl.includes('vimeo')) {
        const match = cleanUrl.match(/(?:vimeo.com\/|player.vimeo.com\/video\/)(\d+)/);
        if (match && match[1]) {
            return `https://player.vimeo.com/video/${match[1]}`;
        }
    }

    // Return original if it looks like an embed link already
    if (cleanUrl.includes('/embed/') || cleanUrl.includes('player.')) return cleanUrl;

    return '';
};

urls.forEach(url => {
    console.log(`Input: '${url}'\nOutput: ${getEmbedUrl(url)}\n`);
});
