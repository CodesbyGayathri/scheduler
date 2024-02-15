import { Component } from '@angular/core';
import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { AboutdialogComponent } from './aboutdialog/aboutdialog.component';

interface Job {
  arrivalTime: number;
  burstTime: number;
  startTime?: number;
  endTime?: number | any;
  turnaroundTime?: number | any;
  cpu?: number;
  
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'demo';
  numberOfJobs: number = 0;
  numberOfCPUs: number = 1; // Default to 1 CPU
  jobs: Job[] = [];
  algo: string = "";
  Process: any;
  visible: boolean = false;
  ganttChartDataa: any[] = [];
  averageTurnaroundTime: number = 0;
  ganttChartData: any[] = []; // Declare the ganttChartData array

  constructor(public dialog: MatDialog) {}



  openDialog() {
    this.dialog.open(AboutdialogComponent);
  }

  calculateSchedule(algorithm: string) {
    if (algorithm === 'FCFS') {
      this.calculateFCFSSchedule();
      this.algo = 'FCFS';
    } else if (algorithm === 'SJF') {
      this.algo = 'SJF';
      this.calculateSJFSchedule();
    }
  }

  private calculateFCFSSchedule() {
    // Create a copy of the jobs array to avoid modifying the original array
    const jobsCopy = [...this.jobs];
    
    // Sort the copied jobs based on arrival time
    jobsCopy.sort((a, b) => a.arrivalTime - b.arrivalTime);
  
    // Initialize start time and end time for each job
    const cpuQueues: Job[][] = [];
    for (let i = 0; i < this.numberOfCPUs; i++) {
      cpuQueues.push([]);
    }
  
    // Initialize current time
    let currentTime = 0;
  
    // Initialize ganttChartData
    const ganttChartData: any[] = [];

    // Iterate through each job
    for (const job of jobsCopy) {
      // Find the CPU with the earliest available time
      let earliestEndTime = Number.MAX_SAFE_INTEGER;
      let earliestCPUIndex = 0;
  
      // Iterate through each CPU to find the earliest end time
      for (let i = 0; i < cpuQueues.length; i++) {
        const lastJobEndTime = cpuQueues[i].length > 0 ? cpuQueues[i][cpuQueues[i].length - 1].endTime : 0;
        if (lastJobEndTime < earliestEndTime) {
          earliestEndTime = lastJobEndTime;
          earliestCPUIndex = i;
        }
      }
  
      // If no jobs are running on any CPU, start the job immediately
      if (earliestEndTime === Number.MAX_SAFE_INTEGER) {
        currentTime = job.arrivalTime;
      } else {
        // Otherwise, start the job after the earliest available time
        currentTime = Math.max(earliestEndTime, job.arrivalTime);
      }
  
      // Assign start time
      job.startTime = currentTime;
  
      // Update end time
      job.endTime = job.startTime + job.burstTime;
  
      // Calculate turnaround time
      job.turnaroundTime = job.endTime - job.arrivalTime;

      // Add the job to the CPU queue
      cpuQueues[earliestCPUIndex].push(job);

      // Add the job information to ganttChartData
      ganttChartData.push({
        job: `J${this.jobs.indexOf(job) + 1}`,
        startTime: job.startTime,
        endTime: job.endTime,
        cpu: `CPU ${earliestCPUIndex + 1}`,
      });
    }
  
    // Calculate average turnaround time
    const totalTurnaroundTime = jobsCopy.reduce((acc, job) => acc + job.turnaroundTime, 0);
    this.averageTurnaroundTime = totalTurnaroundTime / jobsCopy.length;
    this.ganttChartData = ganttChartData; // Assign the generated ganttChartData
    this.visible = ganttChartData.length > 0;
}


  
private calculateSJFSchedule() {
  // Create a copy of the jobs array to avoid modifying the original array
  const jobsCopy = [...this.jobs];
  
  // Initialize start time and end time for each job
  const ganttChartData: any[] = [];
  const cpuQueues: Job[][] = Array.from({ length: this.numberOfCPUs }, () => []);
  let currentTime = 0;
  
  // Iterate through each job
  for (const job of jobsCopy) {
    // Find the CPU with the earliest available time
    let earliestEndTime = Number.MAX_SAFE_INTEGER;
    let earliestCPUIndex = 0;
    
    // Iterate through each CPU to find the earliest end time
    for (let i = 0; i < cpuQueues.length; i++) {
      const lastJobEndTime = cpuQueues[i].length > 0 ? cpuQueues[i][cpuQueues[i].length - 1].endTime : 0;
      const adjustedStartTime = Math.max(lastJobEndTime, job.arrivalTime); // Adjust for non-zero arrival time
      if (adjustedStartTime < earliestEndTime) {
        earliestEndTime = adjustedStartTime;
        earliestCPUIndex = i;
      }
    }
    
    // Assign start time
    job.startTime = earliestEndTime;
    
    // Update end time
    job.endTime = job.startTime + job.burstTime;
    
    // Calculate turnaround time
    job.turnaroundTime = job.endTime - job.arrivalTime;
    
    // Add the job to the CPU queue
    cpuQueues[earliestCPUIndex].push(job);
    
    // Add the job information to ganttChartData
    ganttChartData.push({
      job: `J${this.jobs.indexOf(job) + 1}`,
      startTime: job.startTime,
      endTime: job.endTime,
      cpu: `CPU ${earliestCPUIndex + 1}`,
    });
  }
  
  // Calculate average turnaround time
  const totalTurnaroundTime = jobsCopy.reduce((acc, job) => acc + job.turnaroundTime, 0);
  this.averageTurnaroundTime = totalTurnaroundTime / jobsCopy.length;
  this.ganttChartData = ganttChartData; // Assign the generated ganttChartData
  this.visible = ganttChartData.length > 0;
}



  addJob() {
    this.jobs.push({ arrivalTime: 0, burstTime: 0 });
  }

  removeJob(index: number) {
    this.jobs.splice(index, 1);
  }
}
