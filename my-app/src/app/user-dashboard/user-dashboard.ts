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
  isDarkMode = false;

  constructor(public auth: AuthService) {}

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }

  logout() {
    this.auth.logout();
  }
}
/* Add this toggleTheme method inside BOTH user-dashboard.ts and labourer-dashboard.ts
isDarkMode = false;

toggleTheme() {
  this.isDarkMode = !this.isDarkMode;
  if (this.isDarkMode) {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
}
*/
