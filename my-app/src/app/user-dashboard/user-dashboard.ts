
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports:[CommonModule, RouterModule],
  templateUrl: './user-dashboard.html',
  styleUrls:['./user-dashboard.css']
})
export class UserDashboard {
  constructor(public auth: AuthService) {}

  logout() {
    this.auth.logout(); // This properly clears local storage AND logs you out!
  }
}