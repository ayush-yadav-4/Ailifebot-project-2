/**
 * Chart Utilities
 * Functions for rendering charts (ECharts, Plotly)
 */

/**
 * Render ECharts chart
 */
export function renderEChartsChart(chartConfig, containerId) {
  if (typeof window.echarts === 'undefined') {
    console.warn('ECharts not loaded');
    return null;
  }

  try {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('Chart container not found:', containerId);
      return null;
    }

    const chart = window.echarts.init(container);
    
    // Remove type field for ECharts
    const echartsConfig = { ...chartConfig };
    delete echartsConfig.type;
    
    chart.setOption(echartsConfig, true);
    
    // Make responsive
    window.addEventListener('resize', () => chart.resize());
    
    return chart;
  } catch (error) {
    console.error('Error rendering ECharts chart:', error);
    return null;
  }
}

/**
 * Render Plotly chart
 */
export function renderPlotlyChart(chartConfig, containerId) {
  if (typeof window.Plotly === 'undefined') {
    console.warn('Plotly not loaded');
    return null;
  }

  try {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('Chart container not found:', containerId);
      return null;
    }

    window.Plotly.newPlot(
      container,
      chartConfig.data || [],
      chartConfig.layout || {},
      { responsive: true }
    );
    
    return container;
  } catch (error) {
    console.error('Error rendering Plotly chart:', error);
    return null;
  }
}

/**
 * Convert Chart.js config to ECharts config
 */
export function convertChartJsToECharts(chartJsConfig) {
  try {
    const chartType = chartJsConfig.type;
    const data = chartJsConfig.data;
    const options = chartJsConfig.options;
    
    const labels = data.labels || [];
    const datasets = data.datasets || [];
    const title = options?.plugins?.title?.text || 'Chart';
    
    const echartsConfig = {
      title: {
        text: title,
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: chartType === 'pie' ? 'item' : 'axis'
      },
      legend: {
        data: datasets.map(d => d.label),
        top: 'bottom'
      }
    };
    
    if (chartType === 'bar') {
      echartsConfig.xAxis = { type: 'category', data: labels };
      echartsConfig.yAxis = { type: 'value' };
      echartsConfig.series = datasets.map(dataset => ({
        name: dataset.label,
        type: 'bar',
        data: dataset.data,
        itemStyle: {
          color: dataset.backgroundColor?.[0] || '#5470c6'
        }
      }));
    } else if (chartType === 'line') {
      echartsConfig.xAxis = { type: 'category', data: labels };
      echartsConfig.yAxis = { type: 'value' };
      echartsConfig.series = datasets.map(dataset => ({
        name: dataset.label,
        type: 'line',
        data: dataset.data,
        smooth: true
      }));
    } else if (chartType === 'pie' || chartType === 'doughnut') {
      const pieData = labels.map((label, index) => ({
        name: label,
        value: datasets[0]?.data[index] || 0
      }));
      
      echartsConfig.series = [{
        name: datasets[0]?.label || 'Data',
        type: 'pie',
        radius: chartType === 'doughnut' ? ['40%', '70%'] : '50%',
        data: pieData
      }];
    }
    
    return echartsConfig;
  } catch (error) {
    console.error('Error converting Chart.js to ECharts:', error);
    return chartJsConfig;
  }
}

/**
 * Render charts in a container element
 */
export function renderChartsInElement(container) {
  if (!container) return;
  
  // Find code blocks with chart language indicators
  const codeBlocks = container.querySelectorAll('pre code');
  codeBlocks.forEach((codeBlock, index) => {
    const className = codeBlock.className || '';
    if (className.includes('language-chart') || 
        className.includes('language-plotly') || 
        className.includes('language-echart')) {
      renderChartFromCodeBlock(codeBlock, index);
    }
  });
  
  // Scan for chart data patterns in text
  scanAndRenderChartsFromText(container);
}

function renderChartFromCodeBlock(codeBlock, index) {
  let jsonText = codeBlock.textContent.trim();
  try {
    const cfg = JSON.parse(jsonText);
    const className = codeBlock.className || '';
    
    const chartWrapper = document.createElement('div');
    const chartId = `chart-${Date.now()}-${index}`;
    chartWrapper.id = chartId;
    chartWrapper.style.cssText = `
      max-width: 100%;
      height: 400px;
      margin: 15px 0;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 10px;
      position: relative;
    `;
    
    const pre = codeBlock.parentElement;
    pre.parentElement.replaceChild(chartWrapper, pre);
    
    if (className.includes('language-plotly')) {
      renderPlotlyChart(cfg, chartId);
    } else {
      const echartsDiv = document.createElement('div');
      echartsDiv.style.cssText = 'width: 100%; height: 100%;';
      chartWrapper.appendChild(echartsDiv);
      
      let echartsConfig = cfg;
      if (cfg.type && ['bar', 'line', 'pie', 'doughnut'].includes(cfg.type)) {
        echartsConfig = convertChartJsToECharts(cfg);
      }
      
      renderEChartsChart(echartsConfig, chartId);
    }
  } catch (e) {
    console.error('Failed to render chart from code block:', e);
  }
}

function scanAndRenderChartsFromText(container) {
  // Implementation for scanning text for chart patterns
  // Similar to original implementation
}

