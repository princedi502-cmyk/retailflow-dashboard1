// Performance monitoring utilities for code splitting and lazy loading
import React from 'react';

export const performanceMonitor = {
  // Track when chunks are loaded
  trackChunkLoad: (chunkName) => {
    if (window.performance && window.performance.mark) {
      const markName = `chunk-${chunkName}-loaded`;
      window.performance.mark(markName);
      console.log(`📦 Chunk loaded: ${chunkName}`);
    }
  },

  // Measure time between marks
  measureChunkLoadTime: (chunkName, startMark) => {
    if (window.performance && window.performance.measure) {
      const measureName = `chunk-${chunkName}-load-time`;
      try {
        window.performance.measure(measureName, startMark, `chunk-${chunkName}-loaded`);
        const measures = window.performance.getEntriesByName(measureName);
        if (measures.length > 0) {
          console.log(`⏱️ ${chunkName} loaded in ${measures[0].duration.toFixed(2)}ms`);
        }
      } catch (error) {
        console.warn(`Could not measure load time for ${chunkName}:`, error);
      }
    }
  },

  // Log resource timing information
  logResourceTiming: () => {
    if (window.performance && window.performance.getEntriesByType) {
      const resources = window.performance.getEntriesByType('resource');
      const jsResources = resources.filter(resource => 
        resource.name.includes('.js') && !resource.name.includes('node_modules')
      );
      
      console.group('🚀 JavaScript Resource Loading');
      jsResources.forEach(resource => {
        console.log(`${resource.name.split('/').pop()}: ${resource.duration.toFixed(2)}ms`);
      });
      console.groupEnd();
    }
  },

  // Monitor lazy loading performance
  monitorLazyLoad: async (importFunction, chunkName) => {
    const startMark = `chunk-${chunkName}-start`;
    if (window.performance && window.performance.mark) {
      window.performance.mark(startMark);
    }

    try {
      const module = await importFunction();
      performanceMonitor.trackChunkLoad(chunkName);
      performanceMonitor.measureChunkLoadTime(chunkName, startMark);
      return module;
    } catch (error) {
      console.error(`❌ Failed to load chunk ${chunkName}:`, error);
      throw error;
    }
  }
};

// Enhanced lazy loading wrapper with performance tracking
export const lazyWithTracking = (importFunction, chunkName) => {
  return React.lazy(() => 
    performanceMonitor.monitorLazyLoad(importFunction, chunkName)
  );
};

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  // Log resource timing after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      performanceMonitor.logResourceTiming();
    }, 1000);
  });
}
