/**
 * Utility to normalize school branding images (logo, coverImage)
 */
export const normalizeSchoolImages = (school: any) => {
    if (!school) return school;

    const fixPath = (imgPath: string) => {
        if (!imgPath || imgPath.startsWith('http') || imgPath.startsWith('/api/images')) return imgPath;

        // If it starts with /uploads/schools/, convert to /api/images/uploads/schools/
        if (imgPath.startsWith('/uploads/schools/')) {
            return `/api/images${imgPath}`;
        }

        // Otherwise just prefix
        return `/api/images/uploads/schools/${imgPath.replace(/^\//, '')}`;
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
            if (trimmedImg.startsWith('http') || trimmedImg.startsWith('/api/images')) return trimmedImg;

            if (trimmedImg.startsWith('/uploads/classes/')) {
                return `/api/images${trimmedImg}`;
            }

            return `/api/images/uploads/classes/${trimmedImg.replace(/^\//, '')}`;
        });

    return cls;
};
