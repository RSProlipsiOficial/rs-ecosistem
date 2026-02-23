
const urls = [
    "https://www.youtube.com/watch?v=cM0la5wAAx4",
    "https://youtu.be/cM0la5wAAx4",
    "https://www.youtube.com/embed/cM0la5wAAx4",
    "https://www.youtube.com/shorts/cM0la5wAAx4",
    "https://www.youtube.com/live/cM0la5wAAx4", // New live format
    " https://www.youtube.com/watch?v=cM0la5wAAx4 " // Whitespace
];

const getEmbedUrl = (url) => {
    if (!url) return '';
    const cleanUrl = url.trim();

    console.log(`Testing: '${cleanUrl}'`);

    // Vimeo
    if (cleanUrl.includes('vimeo.com')) {
        const vimeoMatch = cleanUrl.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/);
        if (vimeoMatch && vimeoMatch[1]) {
            return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
        }
    }

    // YouTube (Enhanced)
    // Support: standard, short, embed, shorts, and just ID (if 11 chars)
    // ADDED: support for /live/
    const ytRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/|live\/)([^#&?]*).*/;
    const match = cleanUrl.match(ytRegExp);

    if (match && match[2]) {
        console.log(`  Matched! ID: ${match[2]}`);
        if (match[2].length >= 10) {
            return `https://www.youtube.com/embed/${match[2]}`;
        }
    }

    // Fallback: If it looks like a direct link to a video file or generic embed
    if (cleanUrl.includes('youtube.com/embed/') || cleanUrl.includes('player.vimeo.com')) return cleanUrl;

    return '';
};

urls.forEach(url => {
    console.log(`Result: ${getEmbedUrl(url)}\n`);
});
