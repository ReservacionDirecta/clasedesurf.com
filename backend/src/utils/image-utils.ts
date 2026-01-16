/**
 * Utility to normalize school branding images (logo, coverImage)
 */
export const normalizeSchoolImages = (school: any) => {
    if (!school) return school;

    const fixPath = (imgPath: string) => {
        if (!imgPath) return imgPath;
        // If it sends a full URL or already correct path, return it
        if (imgPath.startsWith('http') || imgPath.startsWith('/uploads')) return imgPath;

        // Legacy/Fallback: try to fix older paths or bare filenames
        // If it has /api/images, keep it (legacy)
        if (imgPath.startsWith('/api/images')) return imgPath;

        // Assume it's a filename in the root of uploads (new behavior)
        return `/uploads/${imgPath.replace(/^\//, '')}`;
    };

    school.logo = fixPath(school.logo);
    school.coverImage = fixPath(school.coverImage);

    // Fallback: if coverImage is missing, use logo as cover
    if (!school.coverImage && school.logo) {
        school.coverImage = school.logo;
    }

    return school;
};

/**
 * Utility to normalize class images
 */
export const normalizeClassImages = (cls: any) => {
    if (!cls || !cls.images || !Array.isArray(cls.images)) return cls;

    cls.images = cls.images
        .filter((img: string) => img && typeof img === 'string' && img.trim() !== '')
        .map((img: string) => {
            const trimmedImg = img.trim();
            if (trimmedImg.startsWith('http')) return trimmedImg;

            // If it already points to the storage volume, keep it
            if (trimmedImg.startsWith('/uploads')) return trimmedImg;

            // Legacy paths
            if (trimmedImg.startsWith('/api/images')) return trimmedImg;

            // Otherwise assume it's a filename in the persistent storage
            return `/uploads/${trimmedImg.replace(/^\//, '')}`;
        });

    return cls;
};
