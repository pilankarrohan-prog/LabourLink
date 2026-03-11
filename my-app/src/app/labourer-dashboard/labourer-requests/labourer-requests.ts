import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Request } from '../../models/request.model';

@Component({
  selector: 'app-labourer-requests',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="header">
      <h2>Incoming Job Requests</h2>
      <p>Manage your client bookings here.</p>
    </div>

    <div *ngIf="errorMessage" class="error-banner">
      {{ errorMessage }}
    </div>

    <div *ngIf="!errorMessage && requests.length === 0" class="empty-state">
      <div class="empty-icon">No requests</div>
      <h3>No pending requests</h3>
      <p>Make sure you are marked as "Available" on your Home tab to receive jobs!</p>
    </div>

    <div class="request-grid">
      <div
        class="request-card"
        *ngFor="let req of requests"
        [ngClass]="req.status"
      >
        <div class="card-header">
          <span class="badge" [ngClass]="req.status">
            {{ req.status }}
          </span>
          <span class="date">
            {{ req.booking_date | date:'mediumDate' }}
          </span>
        </div>

        <h3>{{ req.service_type }} Request</h3>

        <div class="details">
          <p><span>Location:</span> {{ req.address }}</p>
          <p><span>User:</span> {{ req.user_name }}</p>
          <p><span>Time:</span> {{ req.booking_date | date:'shortTime' }}</p>
        </div>

        <div *ngIf="req.status === 'pending'" class="actions">
          <button
            class="btn-accept"
            (click)="respond(req.id, 'confirmed')"
          >
            Accept
          </button>

          <button
            class="btn-deny"
            (click)="respond(req.id, 'rejected')"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .header h2 {
      font-size: 28px;
      color: #1e293b;
      margin: 0;
      font-weight: 800;
    }

    .header p {
      color: #64748b;
      margin-top: 5px;
      margin-bottom: 24px;
    }

    .error-banner {
      background: #fef2f2;
      color: #991b1b;
      padding: 16px;
      border-radius: 12px;
      border: 1px solid #f87171;
      margin-bottom: 20px;
      font-weight: 600;
      font-size: 15px;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      background: white;
      border-radius: 16px;
      border: 2px dashed #cbd5e1;
    }

    .empty-icon {
      font-size: 24px;
      margin-bottom: 15px;
      font-weight: 700;
    }

    .empty-state h3 {
      color: #334155;
      margin: 0 0 8px 0;
      font-size: 20px;
    }

    .empty-state p {
      color: #64748b;
      margin: 0;
    }

    .request-grid {
      display: grid;
      gap: 20px;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    }

    .request-card {
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
      border: 1px solid #e2e8f0;
      transition: transform 0.2s;
      border-top: 5px solid #f59e0b;
    }

    .request-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
    }

    .request-card.confirmed { border-top-color: #10b981; }
    .request-card.rejected { border-top-color: #ef4444; }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .badge {
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
    }

    .badge.pending { background: #fef3c7; color: #d97706; }
    .badge.confirmed { background: #d1fae5; color: #059669; }
    .badge.rejected { background: #fee2e2; color: #dc2626; }

    .date {
      font-size: 13px;
      color: #64748b;
      font-weight: 600;
    }

    .request-card h3 {
      margin: 0 0 16px 0;
      color: #0f172a;
      font-size: 20px;
    }

    .details {
      background: #f8fafc;
      padding: 16px;
      border-radius: 12px;
      margin-bottom: 20px;
    }

    .details p {
      margin: 8px 0;
      color: #475569;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
    }

    .actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .btn-accept {
      background: #10b981;
      color: white;
      border: none;
      padding: 12px;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      transition: 0.2s;
    }

    .btn-accept:hover {
      background: #059669;
    }

    .btn-deny {
      background: #f1f5f9;
      color: #ef4444;
      border: 1px solid #e2e8f0;
      padding: 12px;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      transition: 0.2s;
    }

    .btn-deny:hover {
      background: #fee2e2;
      border-color: #fca5a5;
    }
  `]
})
export class LabourerRequests implements OnInit {
  requests: Request[] = [];
  errorMessage = '';

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.auth.getIncomingRequests().subscribe(
      (res: any) => {
        this.requests = res as Request[];
        this.errorMessage = '';
      },
      (err: any) => {
        this.errorMessage = err.error?.message || 'Error loading requests.';
        this.requests = [];
      }
    );
  }

  respond(id: number, status: 'confirmed' | 'rejected'): void {
    this.auth.respondToBooking(id, status).subscribe(
      () => this.load(),
      () => alert('Error updating request.')
    );
  }
}
