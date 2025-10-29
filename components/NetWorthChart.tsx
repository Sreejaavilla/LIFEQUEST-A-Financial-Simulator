
import React, { useEffect, useRef } from 'react';
import type { Chart as ChartJS, ChartConfiguration } from 'chart.js';
import Card from './common/Card';

interface NetWorthChartProps {
  history: { age: number; netWorth: number }[];
}

const NetWorthChart: React.FC<NetWorthChartProps> = ({ history }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const labels = history.map(h => h.age);
    const data = history.map(h => h.netWorth);

    const chartConfig: ChartConfiguration = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Net Worth',
          data: data,
          borderColor: 'rgb(34, 211, 238)', // cyan-400
          backgroundColor: 'rgba(34, 211, 238, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgb(13, 2, 33)',
          pointBorderColor: 'rgb(34, 211, 238)',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(context.parsed.y);
                }
                return label;
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Age',
              color: 'rgb(156, 163, 175)', // gray-400
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
                color: 'rgb(209, 213, 219)' // gray-300
            }
          },
          y: {
            title: {
              display: true,
              text: 'Net Worth (INR)',
              color: 'rgb(156, 163, 175)', // gray-400
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: 'rgb(209, 213, 219)', // gray-300
              callback: function(value) {
                if (typeof value === 'number') {
                    if (value >= 10000000) return (value / 10000000).toFixed(1) + 'Cr';
                    if (value >= 100000) return (value / 100000).toFixed(1) + 'L';
                    if (value >= 1000) return (value / 1000).toFixed(1) + 'k';
                }
                return value;
              }
            }
          }
        }
      }
    };

    if (chartRef.current) {
      chartRef.current.data = chartConfig.data;
      chartRef.current.update();
    } else {
      // @ts-ignore ChartJS constructor type issue
      chartRef.current = new window.Chart(ctx, chartConfig);
    }

    // Cleanup function
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [history]);

  return (
    <Card>
        <h2 className="text-xl font-bold text-white mb-4">Net Worth Journey</h2>
        <div className="relative h-80">
            <canvas ref={canvasRef}></canvas>
        </div>
    </Card>
  );
};

export default NetWorthChart;
