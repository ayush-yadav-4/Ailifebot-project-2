import React, { useEffect, useRef, useState, useCallback } from 'react';
import { convertVisualizationToECharts } from '../../utils/visualizationUtils';

/**
 * Chart Component
 * Renders charts based on visualization config from API
 */
function Chart({ visualization, data }) {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [isChartValid, setIsChartValid] = useState(false);

  // Validate chart config before rendering
  useEffect(() => {
    if (!visualization || !data) {
      console.warn('Chart validation failed: missing visualization or data', {
        hasVisualization: !!visualization,
        hasData: !!data
      });
      setIsChartValid(false);
      return;
    }

    // Pre-validate: Try to convert visualization config
    try {
      const echartsConfig = convertVisualizationToECharts(visualization, data);
      if (echartsConfig && echartsConfig.series && echartsConfig.series.length > 0) {
        setIsChartValid(true);
      } else {
        setIsChartValid(false);
        console.warn('Chart validation failed: invalid config', { 
          visualization, 
          data,
          echartsConfig,
          hasSeries: !!(echartsConfig && echartsConfig.series),
          seriesLength: echartsConfig?.series?.length || 0
        });
      }
    } catch (error) {
      setIsChartValid(false);
      console.error('Chart validation error:', error);
    }
  }, [visualization, data]);

  // Calculate minimum chart width based on number of x-axis labels
  const calculateChartWidth = useCallback(() => {
    if (!visualization || !data || !data.rows) {
      return '100%';
    }

    const { xAxis } = visualization;
    const { rows, columns } = data;
    
    // Find x-axis column index
    const xAxisIndex = columns ? columns.findIndex(col => col === xAxis) : -1;
    if (xAxisIndex === -1) return '100%';

    const labelCount = rows.length;
    
    // Minimum width per category to prevent overlap (e.g., 80px per label)
    const minWidthPerCategory = 80;
    const minChartWidth = labelCount * minWidthPerCategory;
    
    // Return minimum width if it exceeds container width, otherwise 100%
    return minChartWidth > 600 ? `${minChartWidth}px` : '100%';
  }, [visualization, data]);

  useEffect(() => {
    if (!visualization || !data || !isChartValid) return;

    let checkEChartsInterval;
    let resizeHandler;
    let timeoutId;

    const renderChart = () => {
      if (!chartRef.current) return;

      try {
        // Convert visualization config to ECharts config
        const echartsConfig = convertVisualizationToECharts(visualization, data);
        
        if (!echartsConfig) {
          console.warn('Failed to convert visualization to ECharts config');
          setIsChartValid(false);
          return;
        }

        // Validate echarts config has series
        if (!echartsConfig.series || echartsConfig.series.length === 0) {
          console.warn('ECharts config missing series data');
          setIsChartValid(false);
          return;
        }

        // Adjust grid for scrollable charts to start from extreme left
        const chartWidth = calculateChartWidth();
        const needsScroll = chartWidth !== '100%';
        if (needsScroll && echartsConfig.grid) {
          echartsConfig.grid.left = '40px'; // Minimal left margin for scrollable charts (just enough for y-axis labels)
        }

        // Dispose existing chart instance if any
        if (chartInstanceRef.current) {
          chartInstanceRef.current.dispose();
        }

        // Initialize new chart
        chartInstanceRef.current = window.echarts.init(chartRef.current);
        chartInstanceRef.current.setOption(echartsConfig, true);

        // Handle window resize
        resizeHandler = () => {
          if (chartInstanceRef.current) {
            chartInstanceRef.current.resize();
          }
        };

        window.addEventListener('resize', resizeHandler);
      } catch (error) {
        console.error('Error rendering chart:', error);
        setIsChartValid(false);
      }
    };

    // Wait for ECharts to load with timeout
    let attempts = 0;
    const maxAttempts = 100; // 10 seconds max wait time
    
    // Check if ECharts is already loaded
    if (typeof window.echarts !== 'undefined') {
      console.log('ECharts already loaded, rendering chart immediately');
      renderChart();
      return;
    }

    // Try to load ECharts if script tag exists but library isn't loaded yet
    const echartsScript = document.querySelector('script[src*="echarts"]');
    if (!echartsScript) {
      console.log('ECharts script not found in DOM, attempting to load...');
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js';
      script.async = true;
      script.onload = () => {
        console.log('ECharts loaded dynamically');
        if (typeof window.echarts !== 'undefined') {
          renderChart();
        }
      };
      script.onerror = () => {
        console.error('Failed to load ECharts from CDN');
        setIsChartValid(false);
      };
      document.head.appendChild(script);
    }

    console.log('Waiting for ECharts to load...');
    
    checkEChartsInterval = setInterval(() => {
      attempts++;
      if (typeof window.echarts !== 'undefined') {
        console.log('ECharts loaded after', attempts * 100, 'ms');
        clearInterval(checkEChartsInterval);
        if (timeoutId) clearTimeout(timeoutId);
        renderChart();
      } else if (attempts >= maxAttempts) {
        clearInterval(checkEChartsInterval);
        console.error('ECharts library failed to load after', maxAttempts * 100, 'ms');
        console.error('window.echarts is:', typeof window.echarts);
        console.error('ECharts script in DOM:', !!document.querySelector('script[src*="echarts"]'));
        setIsChartValid(false);
      }
    }, 100);

    // Set timeout as backup
    timeoutId = setTimeout(() => {
      if (checkEChartsInterval) {
        clearInterval(checkEChartsInterval);
      }
      if (typeof window.echarts === 'undefined') {
        console.error('ECharts library timeout');
        setIsChartValid(false);
      }
    }, 5000);

    // Cleanup on unmount
    return () => {
      if (checkEChartsInterval) {
        clearInterval(checkEChartsInterval);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (resizeHandler) {
        window.removeEventListener('resize', resizeHandler);
      }
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
        chartInstanceRef.current = null;
      }
    };
  }, [visualization, data, isChartValid, calculateChartWidth]);

  // Don't render if validation failed - show nothing
  if (!visualization || !data || !isChartValid) {
    return null;
  }

  const chartWidth = calculateChartWidth();
  const needsScroll = chartWidth !== '100%';

  return (
    <div className="chart-container" style={{
      width: '100%',
      height: '400px',
      margin: '15px 0',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: needsScroll ? '10px 10px 10px 0' : '10px',
      backgroundColor: '#fff',
      overflowX: needsScroll ? 'auto' : 'visible',
      overflowY: 'hidden'
    }}>
      <div 
        ref={chartRef}
        style={{
          width: chartWidth,
          height: '100%',
          minWidth: needsScroll ? 'auto' : '100%'
        }}
      />
    </div>
  );
}

export default Chart;

