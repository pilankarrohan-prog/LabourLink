import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboard implements OnInit {
  isDarkMode = false;
  activeTab = 'dashboard';
  searchTerm = '';

  stats: any = { total_users: 0, total_labourers: 0, active_bookings: 0, total_revenue: 0 };
  users: any[] =[];
  bookings: any[] = [];
  
  notifications =[
    { time: 'Just now', text: 'Admin system diagnostics completed.' },
    { time: '1hr ago', text: 'Secure login established.' }
  ];

  constructor(public auth: AuthService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.auth.getAdminStats().subscribe({
      next: (res: any) => this.stats = res,
      error: (err) => console.error("Stats Error:", err)
    });

    this.auth.getAllUsers().subscribe({
      next: (res: any) => this.users = res,
      error: (err) => console.error("Users Error:", err)
    });

    this.auth.getAdminBookings().subscribe({
      next: (res: any) => this.bookings = res,
      error: (err) => console.error("Bookings Error:", err)
    });
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }

  get filteredUsers() {
    if (!this.users) return[];
    return this.users.filter(u => 
      u.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
      u.role?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  toggleStatus(user: any) {
    const newStatus = !user.is_active;
    this.auth.toggleUserStatus(user.id, newStatus).subscribe(() => this.loadData());
  }

  deleteUser(id: number) {
    if(confirm('🚨 Are you sure you want to permanently delete this user? This will also delete their bookings.')) {
      this.auth.deleteUser(id).subscribe(() => {
        alert("User Deleted!");
        this.loadData();
      });
    }
  }

  updateBooking(id: number, status: string) {
    this.auth.updateAdminBooking(id, status).subscribe(() => {
      alert("Booking Status Updated!");
      this.loadData();
    });
  }

  exportCSV() {
    if(this.filteredUsers.length === 0) return alert("No data to export");
    const csvData = this.filteredUsers.map(u => `${u.id},${u.name},${u.email},${u.role},${u.is_active ? 'Active':'Banned'}`).join('\n');
    const blob = new Blob([`ID,Name,Email,Role,Status\n${csvData}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Admin_Report.csv';
    a.click();
  }

  logout() {
    this.auth.logout();
  }
}