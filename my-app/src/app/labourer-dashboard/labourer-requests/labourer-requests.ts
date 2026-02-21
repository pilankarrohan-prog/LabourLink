import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-labourer-requests',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Incoming Job Requests</h2>

    <div *ngIf="requests.length === 0"
         style="background:white; padding:20px; border-radius:8px;">
      No pending requests.
    </div>

    <div class="request-card" *ngFor="let req of requests">

      <div>
        <span class="badge">
          {{ req.status | titlecase }}
        </span>

        <h4 style="margin:10px 0;">
          {{ req.service_type }} Job
        </h4>

        <p>
          📍 {{ req.address }} |
          👤 {{ req.user_name }} |
          📅 {{ req.booking_date | date:'short' }}
        </p>
      </div>

      <div *ngIf="req.status === 'pending'">
        <button class="btn-accept"
                (click)="respond(req.id, 'confirmed')">
          Accept
        </button>

        <button class="btn-deny"
                (click)="respond(req.id, 'rejected')">
          Deny
        </button>
      </div>

    </div>
  `,
  styles: []
})
export class LabourerRequests implements OnInit {

  requests: any[] = [];

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.auth.getIncomingRequests().subscribe({
      next: (res: any) => {
        this.requests = res;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  respond(id: number, status: string): void {
    this.auth.respondToBooking(id, status)
      .subscribe(() => {
        alert(`Job ${status}`);
        this.load();
      });
  }
}