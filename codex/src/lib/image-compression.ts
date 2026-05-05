export async function compressImage(file: File, maxWidth = 1024, quality = 0.6): Promise<File> {
  // Only compress images
  if (!file.type.startsWith('image/')) return file;

  // Don't compress very small images (e.g. < 200KB)
  if (file.size < 200 * 1024) return file;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file); // Fallback to original if canvas context fails
        return;
      }

      // Draw image to canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Check if compressed version is actually smaller
            if (blob.size < file.size) {
              resolve(new File([blob], file.name, { 
                type: 'image/jpeg', 
                lastModified: Date.now() 
              }));
            } else {
              resolve(file); // Keep original if compression didn't help
            }
          } else {
            resolve(file); // Fallback
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(img.src);
      console.warn('Image compression failed, using original file', err);
      resolve(file);
    };
  });
}
