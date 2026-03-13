import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Dashboard Overview</h2>
    <div class="stats">
      <div class="stat-card">
        <h3>{{totalBookings}}</h3>
        <p>Total Bookings</p>
      </div>
      <div class="stat-card">
        <h3 style="color: #f59e0b;">{{pendingBookings}}</h3>
        <p>Pending Requests</p>
      </div>
      <div class="stat-card">
        <h3 style="color: #10b981;">{{completedBookings}}</h3>
        <p>Completed Jobs</p>
      </div>
    </div>
  `,
  styles:[`
    .stats { display: flex; gap: 20px; margin-top: 20px; }
    .stat-card { flex: 1; background: var(--bg-card); border: 1px solid var(--border-color); padding: 30px; border-radius: 12px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.05); transition: 0.3s;}
    .stat-card:hover { transform: translateY(-5px); }
    .stat-card h3 { font-size: 36px; color: var(--primary); margin: 0 0 10px 0; font-weight: 800; }
    .stat-card p { color: var(--text-muted); font-size: 16px; margin: 0; font-weight: 500; }
  `]
})
export class UserHome implements OnInit {
  totalBookings = 0; pendingBookings = 0; completedBookings = 0;
  constructor(private auth: AuthService) {}

  ngOnInit() {
    this.auth.getUserBookings().subscribe((res: any) => {
      this.totalBookings = res.length;
      this.pendingBookings = res.filter((b:any) => b.status === 'pending').length;
      this.completedBookings = res.filter((b:any) => b.status === 'confirmed').length;
    });
  }
}