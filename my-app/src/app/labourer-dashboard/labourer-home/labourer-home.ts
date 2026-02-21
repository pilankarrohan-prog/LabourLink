import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-labourer-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fade-in">
      <h2>Work Status</h2>

      <div class="status-card">
        <div>
          <h3>
            You are currently:
            {{ isAvailable ? 'Available' : 'Unavailable' }}
          </h3>
          <p>Toggle this to appear in search results for hirers.</p>
        </div>

        <label class="switch">
          <input type="checkbox"
                 [(ngModel)]="isAvailable"
                 (change)="toggleStatus()">
          <span class="slider round"></span>
        </label>

      </div>
    </div>
  `,
  styles: []
})
export class LabourerHome {

  isAvailable = true;

  constructor(private auth: AuthService) {}

  toggleStatus() {
    this.auth.toggleAvailability(this.isAvailable)
      .subscribe({
        error: (err) => console.error(err)
      });
  }
}