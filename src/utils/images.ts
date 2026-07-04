const localImagePrefix = "/images/";
const localThumbPrefix = "/images/_thumbs/";

export const cardImageSrc = (src: string) => {
    if (src.startsWith(localThumbPrefix)) return src;

    if (src.startsWith(localImagePrefix)) {
        const withoutPrefix = src.slice(localImagePrefix.length);
        const withoutExt = withoutPrefix.replace(/\.[a-z0-9]+$/i, ".jpg");
        return `${localThumbPrefix}${withoutExt}`;
    }

    if (src.includes("image.tmdb.org/t/p/")) {
        return src.replace(/\/t\/p\/[^/]+\//, "/t/p/w780/");
    }

    return src;
};

