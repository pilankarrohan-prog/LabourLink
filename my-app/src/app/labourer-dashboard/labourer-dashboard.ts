import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterModule } from '@angular/router';

@Component({
  selector: 'app-labourer-dashboard',
  standalone: true,
  imports:[CommonModule, RouterOutlet, RouterModule],
  templateUrl: './labourer-dashboard.html',
  styleUrls:['./labourer-dashboard.css']
})
export class LabourerDashboard implements OnInit {
  isDarkMode = false;
  constructor(private router: Router) {}

  ngOnInit() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkMode = true;
      document.body.classList.add('dark');
    }
  }
  
  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  logout() { localStorage.clear(); this.router.navigate(['/']); }
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
