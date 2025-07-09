

export const getFullImageUrl = (filePath) => {
  if (!filePath) return `${process.env.APP_URL}/default.jpg`;
  
  // Normalize slashes
  const normalizedPath = filePath.replace(/\\/g, "/");
  
  // If it's already an absolute URL, return as-is
  if (normalizedPath.startsWith("http")) return normalizedPath;

  return `${process.env.APP_URL}/${normalizedPath}`;
};

export const mapImageUrls = (files) => {
  return files.map((file) => getFullImageUrl(file.path));
};


