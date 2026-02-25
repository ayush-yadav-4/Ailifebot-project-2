/**
 * Visualization Utilities
 * Functions to convert API visualization config to ECharts config
 */

/**
 * Convert API visualization config to ECharts configuration
 * @param {Object} visualization - Visualization config from API
 * @param {Object} data - Data object with rows and columns
 * @returns {Object} ECharts configuration object
 */
export function convertVisualizationToECharts(visualization, data) {
  if (!visualization || !data) {
    console.warn('Missing visualization or data');
    return null;
  }

  const { chartType, title, xAxis, yAxis, mode } = visualization;
  let { rows, columns } = data;

  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    console.warn('No data rows available for chart');
    return null;
  }

  // If columns not provided but rows are objects, extract from first row
  if (!columns && rows.length > 0 && !Array.isArray(rows[0]) && typeof rows[0] === 'object') {
    columns = Object.keys(rows[0]);
  }

  // Normalize yAxis to array format
  let normalizedYAxis = [];
  if (yAxis) {
    if (Array.isArray(yAxis)) {
      normalizedYAxis = yAxis;
    } else if (typeof yAxis === 'string') {
      normalizedYAxis = [yAxis];
    }
  }

  // Find column indices
  const xAxisIndex = columns && xAxis ? columns.findIndex(col => col === xAxis) : -1;
  const yAxisIndices = normalizedYAxis.map(y => columns ? columns.findIndex(col => col === y) : -1);

  if (xAxisIndex === -1 || !xAxis) {
    console.warn('X-axis column not found or is null:', xAxis);
    return null;
  }

  // Validate that at least one y-axis column exists (except for pie charts which are handled separately)
  const hasValidYAxis = yAxisIndices.some(idx => idx >= 0);
  if (!hasValidYAxis && chartType !== 'pie') {
    console.warn('No valid y-axis columns found:', normalizedYAxis);
    return null;
  }

  // Extract data - handle both array and object row formats
  const xAxisData = rows.map(row => {
    if (Array.isArray(row)) {
      const value = row[xAxisIndex];
      return value !== null && value !== undefined ? String(value) : '';
    } else {
      // Object format - use xAxis as key
      const value = row[xAxis];
      return value !== null && value !== undefined ? String(value) : '';
    }
  });

  // Build ECharts config based on chart type
  const baseConfig = {
    title: {
      text: title || 'Chart',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: chartType === 'pie' ? 'item' : 'axis',
      axisPointer: {
        type: chartType === 'line' ? 'line' : 'shadow'
      }
    },
    legend: {
      data: normalizedYAxis,
      top: 'bottom'
    }
  };

  if (chartType === 'bar') {
    return buildBarChartConfig(baseConfig, rows, columns, xAxisIndex, yAxisIndices, normalizedYAxis, mode, xAxisData);
  } else if (chartType === 'line') {
    return buildLineChartConfig(baseConfig, rows, columns, xAxisIndex, yAxisIndices, normalizedYAxis, xAxisData);
  } else if (chartType === 'pie') {
    return buildPieChartConfig(baseConfig, rows, columns, xAxisIndex, yAxisIndices, xAxis, normalizedYAxis);
  } else {
    console.warn('Unsupported chart type:', chartType);
    return null;
  }
}

/**
 * Build bar chart configuration
 */
function buildBarChartConfig(baseConfig, rows, columns, xAxisIndex, yAxisIndices, yAxis, mode, xAxisData) {
  const config = { ...baseConfig };
  
  config.xAxis = {
    type: 'category',
    data: xAxisData,
    axisLabel: {
      rotate: xAxisData.length > 10 ? 45 : 0,
      interval: 0
    },
    // Increase category gap to prevent overlap
    boundaryGap: true
  };

  config.yAxis = {
    type: 'value'
  };

  // Configure grid to allow horizontal expansion
  config.grid = {
    left: '10%',
    right: '10%',
    top: '15%',
    bottom: '15%',
    containLabel: false
  };

  // Validate that we have valid y-axis indices
  const validYAxisIndices = yAxisIndices.filter(idx => idx >= 0);
  if (validYAxisIndices.length === 0) {
    console.warn('No valid y-axis columns found for bar chart');
    return null;
  }

  // Set bar category gap to ensure spacing
  config.series = validYAxisIndices.map((yIndex, idx) => {
    const yColumnName = columns && yIndex >= 0 ? columns[yIndex] : (yAxis && yAxis[idx] ? yAxis[idx] : 'Value');
    const seriesData = rows.map(row => {
      let value;
      if (Array.isArray(row)) {
        value = row[yIndex];
      } else {
        // Object format - use column name as key
        value = row[yColumnName];
      }
      return value !== null && value !== undefined ? Number(value) || 0 : 0;
    });

    return {
      name: yColumnName,
      type: 'bar',
      data: seriesData,
      stack: mode === 'stacked' ? 'stack' : undefined,
      barCategoryGap: '20%', // Add gap between categories
      barWidth: '60%' // Control bar width
    };
  });

  return config;
}

/**
 * Build line chart configuration
 */
function buildLineChartConfig(baseConfig, rows, columns, xAxisIndex, yAxisIndices, yAxis, xAxisData) {
  const config = { ...baseConfig };
  
  config.xAxis = {
    type: 'category',
    data: xAxisData,
    axisLabel: {
      rotate: xAxisData.length > 10 ? 45 : 0,
      interval: 0
    },
    // Increase category gap to prevent overlap
    boundaryGap: true
  };

  config.yAxis = {
    type: 'value'
  };

  // Configure grid to allow horizontal expansion
  config.grid = {
    left: '10%',
    right: '10%',
    top: '15%',
    bottom: '15%',
    containLabel: false
  };

  // Validate that we have valid y-axis indices
  const validYAxisIndices = yAxisIndices.filter(idx => idx >= 0);
  if (validYAxisIndices.length === 0) {
    console.warn('No valid y-axis columns found for line chart');
    return null;
  }

  // Build series based on yAxis columns
  const series = validYAxisIndices.map((yIndex, idx) => {
    const yColumnName = columns && yIndex >= 0 ? columns[yIndex] : (yAxis && yAxis[idx] ? yAxis[idx] : 'Value');
    const seriesData = rows.map(row => {
      let value;
      if (Array.isArray(row)) {
        value = row[yIndex];
      } else {
        // Object format - use column name as key
        value = row[yColumnName];
      }
      return value !== null && value !== undefined ? Number(value) || 0 : 0;
    });

    return {
      name: yColumnName,
      type: 'line',
      data: seriesData,
      smooth: true
    };
  });

  config.series = series;
  return config;
}

/**
 * Build pie chart configuration
 */
function buildPieChartConfig(baseConfig, rows, columns, xAxisIndex, yAxisIndices, xAxis, yAxis) {
  const config = { ...baseConfig };
  
  // For pie chart, use first valid yAxis as values and xAxis as labels
  const validYAxisIndices = yAxisIndices.filter(idx => idx >= 0);
  const yIndex = validYAxisIndices.length > 0 ? validYAxisIndices[0] : -1;
  
  if (yIndex === -1) {
    console.warn('No valid y-axis column found for pie chart');
    return null;
  }

  const pieData = rows.map(row => {
    let label, value;
    if (Array.isArray(row)) {
      label = row[xAxisIndex];
      value = row[yIndex];
    } else {
      // Object format
      const xColumnName = columns && xAxisIndex >= 0 ? columns[xAxisIndex] : xAxis;
      const yColumnName = columns && yIndex >= 0 ? columns[yIndex] : (yAxis && yAxis[0] ? yAxis[0] : 'Value');
      label = row[xColumnName];
      value = row[yColumnName];
    }
    return {
      name: label !== null && label !== undefined ? String(label) : '',
      value: value !== null && value !== undefined ? Number(value) || 0 : 0
    };
  });

  config.series = [{
    name: columns && yIndex >= 0 ? columns[yIndex] : 'Value',
    type: 'pie',
    radius: '50%',
    data: pieData,
    emphasis: {
      itemStyle: {
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowColor: 'rgba(0, 0, 0, 0.5)'
      }
    }
  }];

  return config;
}
