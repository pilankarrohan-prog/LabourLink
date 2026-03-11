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
            <span [style.color]="isAvailable ? '#10b981' : '#ef4444'">
              {{ isAvailable ? 'Available for Work' : 'Unavailable' }}
            </span>
          </h3>
          <p>Keep this toggled ON to appear in search results for hirers.</p>
        </div>

        <label class="switch">
          <input type="checkbox" [(ngModel)]="isAvailable" (change)="toggleStatus()">
          <span class="slider round"></span>
        </label>
      </div>
    </div>
  `,
  styles:[`
    .fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    
    h2 { color: #1e293b; font-size: 28px; margin-bottom: 24px; font-weight: 800; }
    
    .status-card { background: white; padding: 32px; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center; border: 1px solid #e2e8f0; }
    .status-card h3 { font-size: 22px; color: #0f172a; margin: 0 0 8px 0; }
    .status-card p { color: #64748b; margin: 0; font-size: 15px; }
    
    /* Modern iOS Style Switch */
    .switch { position: relative; display: inline-block; width: 60px; height: 34px; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .4s; border-radius: 34px; }
    .slider:before { position: absolute; content: ""; height: 26px; width: 26px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
    
    input:checked + .slider { background-color: #10b981; box-shadow: 0 0 15px rgba(16, 185, 129, 0.4); }
    input:checked + .slider:before { transform: translateX(26px); }
  `]
})
export class LabourerHome {
  isAvailable = true;
  constructor(private auth: AuthService) {}
  toggleStatus() {
    this.auth.toggleAvailability(this.isAvailable).subscribe({ error: (err) => console.error(err) });
  }
}