/**
 * Image Performance Testing Utility
 * Run this in the browser console to measure image loading performance
 */

interface ImageLoadResult {
  src: string;
  fileName: string;
  loadTime: number;
  size: number | null;
  status: 'loaded' | 'failed';
  naturalWidth?: number;
  naturalHeight?: number;
}

interface PerformanceReport {
  totalImages: number;
  loadedImages: number;
  failedImages: number;
  averageLoadTime: number;
  slowestImage: ImageLoadResult | null;
  fastestImage: ImageLoadResult | null;
  totalSize: number;
  imagesOver100KB: ImageLoadResult[];
  imagesOver500ms: ImageLoadResult[];
}

/**
 * Measure load time for a single image
 */
const measureImageLoad = async (src: string): Promise<ImageLoadResult> => {
  const fileName = src.split('/').pop() || src;
  const startTime = performance.now();
  
  return new Promise((resolve) => {
    const img = new Image();
    
    img.onload = async () => {
      const loadTime = performance.now() - startTime;
      
      // Try to get actual file size via fetch
      let size: number | null = null;
      try {
        const response = await fetch(src, { method: 'HEAD' });
        const contentLength = response.headers.get('content-length');
        size = contentLength ? parseInt(contentLength, 10) : null;
      } catch {
        // Size unavailable
      }
      
      resolve({
        src,
        fileName,
        loadTime: Math.round(loadTime),
        size,
        status: 'loaded',
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
      });
    };
    
    img.onerror = () => {
      resolve({
        src,
        fileName,
        loadTime: performance.now() - startTime,
        size: null,
        status: 'failed',
      });
    };
    
    img.src = src;
  });
};

/**
 * Get all images currently on the page
 */
export const getPageImages = (): string[] => {
  const images = document.querySelectorAll('img');
  const backgroundImages = document.querySelectorAll('[style*="background-image"]');
  
  const imageSources = new Set<string>();
  
  images.forEach((img) => {
    if (img.src) imageSources.add(img.src);
    if (img.srcset) {
      img.srcset.split(',').forEach((entry) => {
        const url = entry.trim().split(' ')[0];
        if (url) imageSources.add(url);
      });
    }
  });
  
  backgroundImages.forEach((el) => {
    const style = (el as HTMLElement).style.backgroundImage;
    const match = style.match(/url\(['"]?([^'"]+)['"]?\)/);
    if (match?.[1]) imageSources.add(match[1]);
  });
  
  return Array.from(imageSources);
};

/**
 * Run full image performance test on current page
 */
export const runImagePerformanceTest = async (): Promise<PerformanceReport> => {
  console.log('🔍 Starting image performance test...');
  
  const imageSources = getPageImages();
  console.log(`📸 Found ${imageSources.length} images to test`);
  
  const results: ImageLoadResult[] = [];
  
  for (const src of imageSources) {
    const result = await measureImageLoad(src);
    results.push(result);
    
    // Log slow images immediately
    if (result.loadTime > 500) {
      console.warn(`⚠️ Slow image (${result.loadTime}ms):`, result.fileName);
    }
  }
  
  const loadedResults = results.filter((r) => r.status === 'loaded');
  const failedResults = results.filter((r) => r.status === 'failed');
  
  const totalLoadTime = loadedResults.reduce((sum, r) => sum + r.loadTime, 0);
  const totalSize = loadedResults.reduce((sum, r) => sum + (r.size || 0), 0);
  
  const sortedByTime = [...loadedResults].sort((a, b) => b.loadTime - a.loadTime);
  
  const report: PerformanceReport = {
    totalImages: results.length,
    loadedImages: loadedResults.length,
    failedImages: failedResults.length,
    averageLoadTime: loadedResults.length > 0 ? Math.round(totalLoadTime / loadedResults.length) : 0,
    slowestImage: sortedByTime[0] || null,
    fastestImage: sortedByTime[sortedByTime.length - 1] || null,
    totalSize,
    imagesOver100KB: loadedResults.filter((r) => r.size && r.size > 100 * 1024),
    imagesOver500ms: loadedResults.filter((r) => r.loadTime > 500),
  };
  
  // Print summary
  console.log('\n📊 IMAGE PERFORMANCE REPORT');
  console.log('═══════════════════════════════════════');
  console.log(`Total Images: ${report.totalImages}`);
  console.log(`Loaded: ${report.loadedImages} | Failed: ${report.failedImages}`);
  console.log(`Average Load Time: ${report.averageLoadTime}ms`);
  console.log(`Total Size: ${(report.totalSize / 1024 / 1024).toFixed(2)}MB`);
  
  if (report.slowestImage) {
    console.log(`\n🐢 Slowest: ${report.slowestImage.fileName} (${report.slowestImage.loadTime}ms)`);
  }
  if (report.fastestImage) {
    console.log(`🚀 Fastest: ${report.fastestImage.fileName} (${report.fastestImage.loadTime}ms)`);
  }
  
  if (report.imagesOver100KB.length > 0) {
    console.log(`\n⚠️ Images over 100KB (${report.imagesOver100KB.length}):`);
    report.imagesOver100KB.forEach((r) => {
      console.log(`   - ${r.fileName}: ${((r.size || 0) / 1024).toFixed(1)}KB`);
    });
  }
  
  if (report.imagesOver500ms.length > 0) {
    console.log(`\n⚠️ Images over 500ms (${report.imagesOver500ms.length}):`);
    report.imagesOver500ms.forEach((r) => {
      console.log(`   - ${r.fileName}: ${r.loadTime}ms`);
    });
  }
  
  console.log('\n═══════════════════════════════════════');
  
  return report;
};

/**
 * Compare two performance reports (before/after optimization)
 */
export const compareReports = (before: PerformanceReport, after: PerformanceReport): void => {
  console.log('\n📈 BEFORE/AFTER COMPARISON');
  console.log('═══════════════════════════════════════');
  
  const loadTimeImprovement = before.averageLoadTime - after.averageLoadTime;
  const loadTimePercent = before.averageLoadTime > 0 
    ? ((loadTimeImprovement / before.averageLoadTime) * 100).toFixed(1) 
    : '0';
  
  const sizeReduction = before.totalSize - after.totalSize;
  const sizePercent = before.totalSize > 0 
    ? ((sizeReduction / before.totalSize) * 100).toFixed(1) 
    : '0';
  
  console.log(`Average Load Time: ${before.averageLoadTime}ms → ${after.averageLoadTime}ms (${loadTimePercent}% ${loadTimeImprovement > 0 ? 'faster' : 'slower'})`);
  console.log(`Total Size: ${(before.totalSize / 1024 / 1024).toFixed(2)}MB → ${(after.totalSize / 1024 / 1024).toFixed(2)}MB (${sizePercent}% ${sizeReduction > 0 ? 'smaller' : 'larger'})`);
  console.log(`Slow Images (>500ms): ${before.imagesOver500ms.length} → ${after.imagesOver500ms.length}`);
  console.log(`Large Images (>100KB): ${before.imagesOver100KB.length} → ${after.imagesOver100KB.length}`);
  
  console.log('═══════════════════════════════════════\n');
};

// Export to window for console access
if (typeof window !== 'undefined') {
  (window as any).imagePerformanceTest = {
    run: runImagePerformanceTest,
    compare: compareReports,
    getImages: getPageImages,
  };
}
