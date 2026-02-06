/**
 * Performance Metrics Tracking
 * Monitors Core Web Vitals and custom performance metrics
 */

interface PerformanceMetrics {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
  tti?: number; // Time to Interactive
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private observers: PerformanceObserver[] = [];

  constructor() {
    if (typeof window === 'undefined') return;
    this.initializeObservers();
  }

  private initializeObservers() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          this.metrics.lcp = lastEntry.startTime;
          this.reportMetric('LCP', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (e) {
        // Browser doesn't support LCP
      }

      // First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            const fid = entry.processingStart - entry.startTime;
            this.metrics.fid = fid;
            this.reportMetric('FID', fid);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (e) {
        // Browser doesn't support FID
      }

      // Cumulative Layout Shift (CLS)
      try {
        let clsScore = 0;
        const clsObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsScore += entry.value;
              this.metrics.cls = clsScore;
            }
          });
          this.reportMetric('CLS', clsScore);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (e) {
        // Browser doesn't support CLS
      }
    }

    // Navigation Timing metrics
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (perfData) {
          this.metrics.fcp = perfData.responseStart - perfData.requestStart;
          this.metrics.ttfb = perfData.responseStart - perfData.requestStart;
          this.metrics.tti = perfData.domInteractive - perfData.requestStart;

          this.reportMetric('FCP', this.metrics.fcp);
          this.reportMetric('TTFB', this.metrics.ttfb);
          this.reportMetric('TTI', this.metrics.tti);
        }
      }, 0);
    });
  }

  private reportMetric(name: string, value: number) {
    if (import.meta.env.DEV) {
      const rating = this.getMetricRating(name, value);
      console.log(`📊 ${name}: ${Math.round(value)}ms (${rating})`);
    }

    // In production, send to analytics
    // Example: analytics.track('performance_metric', { name, value, rating });
  }

  private getMetricRating(name: string, value: number): string {
    const thresholds: Record<string, { good: number; needsImprovement: number }> = {
      LCP: { good: 2500, needsImprovement: 4000 },
      FID: { good: 100, needsImprovement: 300 },
      CLS: { good: 0.1, needsImprovement: 0.25 },
      FCP: { good: 1800, needsImprovement: 3000 },
      TTFB: { good: 800, needsImprovement: 1800 },
      TTI: { good: 3800, needsImprovement: 7300 },
    };

    const threshold = thresholds[name];
    if (!threshold) return 'unknown';

    if (value <= threshold.good) return '✅ Good';
    if (value <= threshold.needsImprovement) return '⚠️  Needs Improvement';
    return '❌ Poor';
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public disconnect() {
    this.observers.forEach(observer => observer.disconnect());
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Measure custom performance marks
 */
export const measurePerformance = (name: string) => {
  if (typeof window === 'undefined') return;

  return {
    start: () => performance.mark(`${name}-start`),
    end: () => {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
      const measure = performance.getEntriesByName(name)[0];
      if (import.meta.env.DEV && measure) {
        console.log(`⏱️  ${name}: ${Math.round(measure.duration)}ms`);
      }
      return measure?.duration || 0;
    },
  };
};

/**
 * Monitor resource loading performance
 */
export const monitorResourceLoading = () => {
  if (typeof window === 'undefined') return;

  window.addEventListener('load', () => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    const imageResources = resources.filter(r => r.initiatorType === 'img');
    const scriptResources = resources.filter(r => r.initiatorType === 'script');
    const styleResources = resources.filter(r => r.initiatorType === 'css' || r.initiatorType === 'link');

    if (import.meta.env.DEV) {
      console.log('🖼️  Images loaded:', imageResources.length);
      console.log('📜 Scripts loaded:', scriptResources.length);
      console.log('🎨 Stylesheets loaded:', styleResources.length);

      const slowImages = imageResources.filter(r => r.duration > 1000);
      if (slowImages.length > 0) {
        console.warn('⚠️  Slow loading images:', slowImages.map(r => ({
          name: r.name,
          duration: Math.round(r.duration),
        })));
      }
    }
  });
};
