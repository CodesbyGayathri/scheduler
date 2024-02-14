import { Component } from '@angular/core';
import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import {AboutdialogComponent} from './aboutdialog/aboutdialog.component'

interface Job {
  arrivalTime: number;
  burstTime: number;
  startTime?: number | any;
  endTime?: number | any;
  turnaroundTime?: number | any;
}



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'demo';
  numberOfJobs: number = 0;
  numberOfCPUs: number = 1; // Default to 1 CPU
  jobs: Job[] = [];
  algo: string = ""
  Process: any
  averageTurnaroundTime: number = 0;

  constructor(public dialog: MatDialog) {}

  openDialog() {
    this.dialog.open(AboutdialogComponent);
  }

  calculateSchedule(algorithm: string) {
    if (algorithm === 'FCFS') {
      this.calculateFCFSSchedule();
      this.algo = 'FCFS'
    } else if (algorithm === 'SJF') {
      this.algo = 'SJF'
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
    }
  
    // Calculate average turnaround time
    const totalTurnaroundTime = jobsCopy.reduce((acc, job) => acc + job.turnaroundTime, 0);
    this.averageTurnaroundTime = totalTurnaroundTime / jobsCopy.length;
  }
  
  private calculateSJFSchedule() {
    // Create a copy of the jobs array to avoid modifying the original array
    const jobsCopy = [...this.jobs];
  
    // Initialize start time and end time for each job
    const cpuQueues: Job[][] = [];
    for (let i = 0; i < this.numberOfCPUs; i++) {
      cpuQueues.push([]);
    }
  
    // Iterate through each job
    while (jobsCopy.length > 0) {
      // Find the CPU with the earliest available time
      let earliestEndTime = Number.MAX_SAFE_INTEGER;
      let earliestCPUIndex = 0;
      for (let i = 0; i < cpuQueues.length; i++) {
        const lastJobEndTime = cpuQueues[i].length > 0 ? cpuQueues[i][cpuQueues[i].length - 1].endTime : 0;
        if (lastJobEndTime < earliestEndTime) {
          earliestEndTime = lastJobEndTime;
          earliestCPUIndex = i;
        }
      }
  
      // Filter jobs that have arrived and have not been assigned to a CPU
      const availableJobs = jobsCopy.filter(job => job.arrivalTime <= earliestEndTime);
  
      // Sort available jobs based on burst time (shortest remaining burst time first)
      availableJobs.sort((a, b) => a.burstTime - b.burstTime);
  
      // Assign the shortest job to the CPU
      const shortestJob = availableJobs.shift();
      if (shortestJob) {
        shortestJob.startTime = Math.max(earliestEndTime, shortestJob.arrivalTime);
        shortestJob.endTime = shortestJob.startTime + shortestJob.burstTime;
        shortestJob.turnaroundTime = shortestJob.endTime - shortestJob.arrivalTime;
        cpuQueues[earliestCPUIndex].push(shortestJob);
        // Remove the assigned job from the jobs array
        const index = jobsCopy.findIndex(job => job === shortestJob);
        if (index !== -1) {
          jobsCopy.splice(index, 1);
        }
      }
    }
  
    // Calculate average turnaround time
    const totalTurnaroundTime = this.jobs.reduce((acc, job) => acc + job.turnaroundTime, 0);
    this.averageTurnaroundTime = totalTurnaroundTime / this.jobs.length;
  }
  

  addJob() {
    this.jobs.push({ arrivalTime: 0, burstTime: 0 });
  }

  removeJob(index: number) {
    this.jobs.splice(index, 1);
  }
}