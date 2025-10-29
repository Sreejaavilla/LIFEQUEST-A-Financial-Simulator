
import React, { useEffect, useRef } from 'react';
import type { Chart as ChartJS, ChartConfiguration } from 'chart.js';

interface PieChartProps {
  data: {
    labels: string[];
    values: number[];
    colors: string[];
  };
  title: string;
}

const PieChart: React.FC<PieChartProps> = ({ data, title }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const chartConfig: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: data.labels,
        datasets: [{
          label: title,
          data: data.values,
          backgroundColor: data.colors,
          borderColor: 'rgb(15, 23, 42)', // slate-900 for separation
          borderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
                color: 'rgb(209, 213, 219)', // gray-300
                boxWidth: 20,
                padding: 20,
            }
          },
          title: {
            display: true,
            text: title,
            color: 'rgb(255, 255, 255)', // white
            font: {
                size: 18
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed !== null) {
                  label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(context.parsed);
                }
                return label;
              }
            }
          }
        },
      }
    };

    if (chartRef.current) {
      chartRef.current.data = chartConfig.data;
      chartRef.current.update();
    } else {
      // @ts-ignore ChartJS constructor type issue
      chartRef.current = new window.Chart(ctx, chartConfig);
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [data, title]);

  return (
    <div className="relative h-80 w-full">
        <canvas ref={canvasRef}></canvas>
    </div>
  );
};

export default PieChart;
