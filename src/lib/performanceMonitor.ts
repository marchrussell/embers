/**
 * Performance monitoring utilities
 * Helps track and improve site speed
 */

export const measurePageLoad = () => {
  if (typeof window === 'undefined' || !import.meta.env.DEV) return;

  // Use requestIdleCallback to avoid blocking interactivity
  requestIdleCallback(() => {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    const connectTime = perfData.responseEnd - perfData.requestStart;
    const renderTime = perfData.domComplete - perfData.domLoading;

    if (import.meta.env.DEV) {
      console.log('📊 Performance Metrics:');
      console.log(`  Page Load: ${pageLoadTime}ms`);
      console.log(`  Server Response: ${connectTime}ms`);
      console.log(`  DOM Render: ${renderTime}ms`);
    }

    // Track Web Vitals if available
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (import.meta.env.DEV) {
          console.log(`  LCP: ${lastEntry.startTime.toFixed(0)}ms`);
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (import.meta.env.DEV) {
            console.log(`  FID: ${entry.processingStart - entry.startTime}ms`);
          }
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      let clsScore = 0;
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsScore += entry.value;
          }
        });
        if (import.meta.env.DEV) {
          console.log(`  CLS: ${clsScore.toFixed(3)}`);
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
  }, { timeout: 3000 });
};

// Call this in main.tsx or App.tsx during development
export const enablePerformanceMonitoring = () => {
  if (import.meta.env.DEV) {
    measurePageLoad();
  }
};
