import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Account Settings</h2>
    <div class="settings-card">
      <div class="input-group">
        <label>Full Name</label>
        <input type="text" [(ngModel)]="user.name">
      </div>
      <div class="input-group">
        <label>Email Address</label>
        <input type="email" [(ngModel)]="user.email" disabled style="opacity: 0.6;">
      </div>
      <div class="input-group">
        <label>City / Address</label>
        <input type="text" [(ngModel)]="user.address">
      </div>
      <div class="input-group">
        <label>Contact Number</label>
        <input type="text" [(ngModel)]="user.contact">
      </div>
      <div class="input-group">
        <label>New Password (Optional)</label>
        <input type="password" [(ngModel)]="user.password" placeholder="Leave blank to keep current">
      </div>
      <button class="btn-save" (click)="saveProfile()">Save Changes</button>
    </div>
  `,
  styles:[`
    h2 { color: var(--text-main); margin-bottom: 20px; font-size: 24px; font-weight: 700;}
    .settings-card { background: var(--bg-card); padding: 30px; border-radius: 16px; border: 1px solid var(--border-color); max-width: 600px;}
    .input-group { margin-bottom: 20px; }
    label { display: block; margin-bottom: 8px; color: var(--text-muted); font-size: 14px; font-weight: 600; }
    input { width: 100%; padding: 12px; border-radius: 10px; border: 1px solid var(--border-color); background: var(--bg-main); color: var(--text-main); font-size: 15px; outline: none; transition: 0.3s;}
    input:focus { border-color: var(--primary); }
    .btn-save { background: var(--primary); color: white; border: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; font-size: 16px; cursor: pointer; width: 100%; transition: 0.2s;}
    .btn-save:hover { filter: brightness(1.1); }
  `]
})
export class UserSettings implements OnInit {
  user: any = { name: '', email: '', address: '', contact: '', password: '' };

  constructor(private auth: AuthService) {}

  ngOnInit() {
    this.auth.getUserProfile().subscribe((res: any) => {
      this.user = { ...res, password: '' }; // Keep password empty
    });
  }

  saveProfile() {
    this.auth.saveUserProfile(this.user).subscribe(() => {
      alert("Profile Details Updated Successfully!");
      this.user.password = ''; // Clear password field after save
    });
  }
}