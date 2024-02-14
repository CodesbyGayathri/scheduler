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
  startTime?: number;
  endTime?: number;
  turnaroundTime?: number;
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'scheduler';
  numberOfJobs: number = 0;
  numberOfCPUs: number = 1; // Default to 1 CPU
  jobs: Job[] = [];
  algo: string = ""
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
    // Sort jobs by arrival time (FCFS)
    const sortedJobs = this.jobs.slice(0);
    sortedJobs.sort((a, b) => a.arrivalTime - b.arrivalTime);
  
    // Initialize CPUs
    const CPUs: Job[][] = [];
    for (let i = 0; i < this.numberOfCPUs; i++) {
      CPUs.push([]);
    }
  
    // Distribute jobs to CPUs in a round-robin manner
    let currentCPU = 0;
    sortedJobs.forEach(job => {
      CPUs[currentCPU].push(job);
      currentCPU = (currentCPU + 1) % this.numberOfCPUs;
    });
  
    // Calculate schedule for each CPU independently
    let totalTurnaroundTime = 0;
    let totalCompletedJobs = 0;
    for (const CPU of CPUs) {
      let currentTime = 0;
      CPU.forEach(job => {
        job.startTime = Math.max(currentTime, job.arrivalTime);
        job.endTime = job.startTime + job.burstTime;
        job.turnaroundTime = job.endTime - job.arrivalTime;
        currentTime = job.endTime;
        totalTurnaroundTime += job.turnaroundTime;
        totalCompletedJobs++; // Increment the completed jobs counter
      });
    }
  
    // Calculate average turnaround time only if there are completed jobs
    if (totalCompletedJobs > 0) {
      this.averageTurnaroundTime = totalTurnaroundTime / totalCompletedJobs;
    } else {
      this.averageTurnaroundTime = 0; // Set to 0 if there are no completed jobs
    }
  }
  
  

  private calculateSJFSchedule() {
    // Sort jobs by burst time (SJF)
    const sortedJobs = this.jobs.slice(0);
    sortedJobs.sort((a, b) => a.burstTime - b.burstTime);
  
    // Initialize CPUs
    const CPUs: Job[][] = [];
    for (let i = 0; i < this.numberOfCPUs; i++) {
      CPUs.push([]);
    }
  
    // Distribute jobs to CPUs in a round-robin manner
    let currentCPU = 0;
    sortedJobs.forEach(job => {
      CPUs[currentCPU].push(job);
      currentCPU = (currentCPU + 1) % this.numberOfCPUs;
    });
  
    // Calculate schedule for each CPU independently
    let totalTurnaroundTime = 0;
    let totalCompletedJobs = 0;
    for (const CPU of CPUs) {
      let currentTime = 0;
      CPU.forEach(job => {
        job.startTime = Math.max(currentTime, job.arrivalTime);
        job.endTime = job.startTime + job.burstTime;
        job.turnaroundTime = job.endTime - job.arrivalTime;
        currentTime = job.endTime;
        totalTurnaroundTime += job.turnaroundTime;
        totalCompletedJobs++; // Increment the completed jobs counter
      });
    }
  
    // Calculate average turnaround time only if there are completed jobs
    if (totalCompletedJobs > 0) {
      this.averageTurnaroundTime = totalTurnaroundTime / totalCompletedJobs;
    } else {
      this.averageTurnaroundTime = 0; // Set to 0 if there are no completed jobs
    }
  }
  

  addJob() {
    this.jobs.push({ arrivalTime: 0, burstTime: 0 });
  }

  removeJob(index: number) {
    this.jobs.splice(index, 1);
  }
}