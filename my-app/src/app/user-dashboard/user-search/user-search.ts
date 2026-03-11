import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-search.html',
  styleUrls: ['./user-search.css']
})
export class UserSearch {
  workerTypes =['Plumber', 'Electrician', 'Carpenter', 'Maid', 'Gardner', 'Cook', 'Painter', 'Welder', 'Mason', 'Technician'];
  
  selectedType = '';
  userLocation = ''; 
  selectedDate = '';
  
  workers: any[] =[];
  isLoading = false;

  constructor(public auth: AuthService) {}

  search() {
    // 🛠️ FIX 1: Allow users to search WITHOUT needing to pick a date first!
    if (!this.selectedType || !this.userLocation) {
      return alert("Please select a Service and enter a Location to search.");
    }
    
    this.isLoading = true;
    this.auth.searchWorkers(this.selectedType, this.userLocation).subscribe({
      next: (res: any) => {
        this.workers = res;
        this.isLoading = false;
        if(res.length === 0) alert("No workers found in this location.");
      },
      error: () => { 
        this.isLoading = false; 
        alert("Search Error"); 
      }
    });
  }

  book(worker: any) {
    // 🛠️ FIX 2: Bulletproof ID extraction so the database never gets "null"
    const workerId = worker.user_id || worker.id;

    if (!workerId) {
      return alert("❌ Error: Worker ID is missing. Cannot process booking.");
    }

    if (!this.selectedDate) {
      return alert("⚠️ Please pick a 'Date and Time' in the search bar before clicking Book Now.");
    }

    if(!confirm(`Are you sure you want to book ${worker.name}?`)) return;
    
    this.auth.bookWorker({ 
      labourerId: workerId, 
      serviceType: this.selectedType, 
      date: this.selectedDate, 
      address: this.userLocation 
    }).subscribe({
      next: () => {
        alert("✅ Booking Request Sent! Log into the worker's account to accept it.");
      },
      error: (err) => {
        alert("❌ Booking Failed: " + (err.error?.message || "Server Error"));
        console.error(err);
      }
    });
  }
}