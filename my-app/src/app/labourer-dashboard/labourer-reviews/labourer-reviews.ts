import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-labourer-reviews',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Client Reviews</h2>

    <div *ngIf="reviews.length === 0"
         style="background:white; padding:20px; border-radius:8px;">
      No reviews yet.
    </div>

    <div class="review-card" *ngFor="let rev of reviews">
      <div class="stars">
        {{ '⭐'.repeat(rev.rating || 0) }}
      </div>

      <p class="comment">
        "{{ rev.comment }}"
      </p>

      <div class="meta">
        - {{ rev.user_name }},
        {{ rev.created_at | date:'mediumDate' }}
      </div>
    </div>
  `,
  styles: []
})
export class LabourerReviews implements OnInit {

  reviews: any[] = [];

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.auth.getReviews().subscribe({
      next: (res: any) => {
        this.reviews = res;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
}