import { Component, ElementRef, Input, OnChanges, SimpleChanges, Renderer2 } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-gantt-chart',
  templateUrl: './gantt-chart.component.html',
  styleUrls: ['./gantt-chart.component.css']
})
export class GanttChartComponent implements OnChanges {
  @Input() data: any[]; // Array of job data

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && changes['data'].currentValue) {
      this.createGanttChart();
    }
  }

  ngOnInit(): void {
    this.createGanttChart();
  }

  private createGanttChart(): void {
    const element = this.elementRef.nativeElement;

    // Clear previous chart if it exists
    d3.select(element).select('svg').remove();

    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
      .domain([0, d3.max(this.data, d => d.endTime)]) // Set x-axis domain
      .range([0, width]);

    const y = d3.scaleBand()
      .domain(this.data.map(d => d.cpu)) // Set y-axis domain
      .range([0, height])
      .padding(0.1);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10); // Define color scale

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svg.append('g')
      .call(d3.axisLeft(y));

    // Add bars
    const bars = svg.selectAll('.bar')
      .data(this.data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.startTime))
      .attr('y', d => y(d.cpu) as number)
      .attr('width', d => x(d.endTime) - x(d.startTime))
      .attr('height', y.bandwidth())
      .attr('fill', d => colorScale(d.job)) // Assign colors based on job names/IDs;

    // Add text labels
    svg.selectAll('.label')
    .data(this.data)
    .enter().append('text')
    .attr('class', 'label')
    .attr('x', d => x(d.startTime) + (x(d.endTime) - x(d.startTime)) / 2) // Center the text within the bar
    .attr('y', d => y(d.cpu) as number + y.bandwidth() / 2) // Adjust position of text
    .attr('dy', '0.35em') // Center text vertically
    .text(d => d.job); 

    // Add tooltips using Angular Material Tooltip
    bars.on('mouseover', (event, d) => this.showTooltip(event, d))
      .on('mouseout', () => this.hideTooltip());
  }

  private showTooltip(event: MouseEvent, data: any): void {
    // Create and display tooltip dynamically
    const tooltip = this.renderer.createElement('div');
    this.renderer.addClass(tooltip, 'tooltip');
    this.renderer.setStyle(tooltip, 'position', 'absolute');
    this.renderer.setStyle(tooltip, 'background', 'rgba(255, 255, 255, 0.8)');
    this.renderer.setStyle(tooltip, 'padding', '5px');
    this.renderer.setStyle(tooltip, 'border', '1px solid #ddd');
    this.renderer.setStyle(tooltip, 'border-radius', '5px');
    this.renderer.setStyle(tooltip, 'pointer-events', 'none');

    // Set tooltip content
    tooltip.innerHTML = `Job: ${data.job}<br>Start Time: ${data.startTime}<br>End Time: ${data.endTime}`;

    // Calculate tooltip position dynamically based on mouse event
    const tooltipWidth = tooltip.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;
    const tooltipX = event.pageX - tooltipWidth / 2;
    const tooltipY = event.pageY - tooltipHeight - 10;

    // Set tooltip position
    this.renderer.setStyle(tooltip, 'left', `${tooltipX}px`);
    this.renderer.setStyle(tooltip, 'top', `${tooltipY}px`);

    // Append tooltip to the body
    this.renderer.appendChild(document.body, tooltip);
  }

  private hideTooltip(): void {
    // Remove tooltip when mouseout
    const tooltip = document.querySelector('.tooltip');
    if (tooltip) {
      tooltip.remove();
    }
  }
}
