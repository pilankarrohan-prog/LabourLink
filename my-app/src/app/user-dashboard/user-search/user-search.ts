import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-search',
  standalone: true,
  imports:[CommonModule, FormsModule, RouterLink],
  templateUrl: './user-search.html',
  styleUrls:['./user-search.css']
})
export class UserSearch {
  workerTypes =['Plumber', 'Electrician', 'Carpenter', 'Maid', 'Painter', 'Mechanic'];
  selectedType = ''; userLocation = ''; selectedDate = '';
  workers: any[] =[]; isLoading = false;
  
  // Payment Modal State
  showPaymentModal = false;
  selectedWorkerForBooking: any = null;
  paymentMethod = 'cash';

  constructor(public auth: AuthService) {}

  search() {
    if (!this.selectedType || !this.userLocation) return alert('Select service and city.');
    this.isLoading = true;
    this.auth.searchWorkers(this.selectedType, this.userLocation, this.selectedDate).subscribe({
      next: (res: any) => { this.workers = res; this.isLoading = false; },
      error: () => { this.isLoading = false; alert('Search failed.'); }
    });
  }

  initiateBooking(worker: any) {
    if (!this.selectedDate) return alert("Please pick a date and time in the search bar first.");
    this.selectedWorkerForBooking = worker;
    this.showPaymentModal = true;
  }

  confirmBooking() {
    const workerId = this.selectedWorkerForBooking.user_id || this.selectedWorkerForBooking.id;
    
    this.auth.bookWorker({
      labourerId: workerId,
      serviceType: this.selectedType,
      date: this.selectedDate,
      address: this.userLocation,
      paymentMethod: this.paymentMethod // Passed to backend if needed
    }).subscribe({
      next: () => {
        alert('🎉 Booking request sent successfully!');
        this.showPaymentModal = false;
        this.selectedWorkerForBooking = null;
      },
      error: (err) => alert('Booking failed: ' + err.error?.message)
    });
  }
}
