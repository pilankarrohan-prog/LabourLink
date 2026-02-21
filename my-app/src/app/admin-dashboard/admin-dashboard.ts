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
  users: any[] = [];
  bookings: any[] = [];
  
  // Fake Real-time notifications
  notifications = [
    { time: 'Just now', text: 'New user registered' },
    { time: '5m ago', text: 'Booking #402 confirmed' },
    { time: '1hr ago', text: 'Labourer Lisa updated profile' }
  ];

  constructor(public auth: AuthService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.auth.getAdminStats().subscribe((res: any) => this.stats = res);
    this.auth.getAllUsers().subscribe((res: any) => this.users = res);
    this.auth.getAdminBookings().subscribe((res: any) => this.bookings = res);
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
  }

  get filteredUsers() {
    return this.users.filter(u => 
      u.name.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
      u.role.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  toggleStatus(user: any) {
    const newStatus = !user.is_active;
    this.auth.toggleUserStatus(user.id, newStatus).subscribe(() => this.loadData());
  }

  deleteUser(id: number) {
    if(confirm('Are you sure you want to permanently delete this user?')) {
      this.auth.deleteUser(id).subscribe(() => this.loadData());
    }
  }

  updateBooking(id: number, status: string) {
    this.auth.updateAdminBooking(id, status).subscribe(() => this.loadData());
  }

  exportCSV() {
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