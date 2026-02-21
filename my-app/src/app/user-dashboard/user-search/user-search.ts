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
  workerTypes = ['Plumber', 'Electrician', 'Carpenter', 'Maid', 'Gardner', 'Cook', 'Painter', 'Welder', 'Mason', 'Technician'];
  
  selectedType = '';
  userLocation = ''; // Used for sorting
  selectedDate = '';
  
  workers: any[] = [];
  isLoading = false;

  constructor(public auth: AuthService) {}

  search() {
    if (!this.selectedType || !this.userLocation || !this.selectedDate) return alert("Please fill all fields");
    
    this.isLoading = true;
    // Fast SQL-based search
    this.auth.searchWorkers(this.selectedType, this.userLocation).subscribe({
      next: (res: any) => {
        this.workers = res;
        this.isLoading = false;
        if(res.length === 0) alert("No workers found.");
      },
      error: () => { this.isLoading = false; alert("Error"); }
    });
  }

  book(id: number) {
    if(!confirm("Book this professional?")) return;
    this.auth.bookWorker({ labourerId: id, serviceType: this.selectedType, date: this.selectedDate, address: this.userLocation }).subscribe({
      next: () => alert("Booking Sent!"),
      error: () => alert("Failed")
    });
  }
}