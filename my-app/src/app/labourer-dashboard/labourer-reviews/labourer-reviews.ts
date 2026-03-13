import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-labourer-reviews',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2 style="color: var(--text-main); margin-bottom: 20px;">Client Reviews</h2>

    <!-- Summary Section -->
    <div class="review-summary card" *ngIf="reviews.length > 0">
      <div class="average-box">
        <h1>{{ averageRating | number:'1.1-1' }}</h1>
        <div class="stars">⭐⭐⭐⭐⭐</div>
        <p>Based on {{ totalReviews }} reviews</p>
      </div>
      
      <div class="progress-bars">
        <div class="bar-row" *ngFor="let star of [5,4,3,2,1]">
          <span>{{star}} Stars</span>
          <div class="bar-bg"><div class="bar-fill" [style.width.%]="getPercentage(star)"></div></div>
          <span>{{ ratingCounts[star] || 0 }}</span>
        </div>
      </div>
    </div>

    <div *ngIf="reviews.length === 0" class="card">No reviews yet. Complete jobs to earn reviews!</div>

    <!-- Individual Reviews -->
    <div class="review-card card" *ngFor="let rev of reviews">
      <div class="stars">{{ '⭐'.repeat(rev.rating || 0) }}</div>
      <p class="comment">"{{ rev.comment }}"</p>
      <div class="meta">- {{ rev.user_name }}, {{ rev.created_at | date:'mediumDate' }}</div>
    </div>
  `,
  styles:[`
    .review-summary { display: flex; gap: 40px; align-items: center; margin-bottom: 30px; }
    .average-box { text-align: center; }
    .average-box h1 { font-size: 64px; margin: 0; color: var(--text-main); }
    .progress-bars { flex: 1; display: flex; flex-direction: column; gap: 8px; }
    .bar-row { display: flex; align-items: center; gap: 10px; color: var(--text-muted); font-weight: 500; font-size: 14px; }
    .bar-bg { flex: 1; height: 10px; background: var(--border-color); border-radius: 5px; overflow: hidden; }
    .bar-fill { height: 100%; background: #f59e0b; border-radius: 5px; transition: width 0.5s ease-out; }
    
    .review-card { border-left: 4px solid #f59e0b; }
    .comment { font-size: 16px; color: var(--text-main); margin: 10px 0; font-style: italic; }
    .meta { color: var(--text-muted); font-size: 13px; font-weight: 500; }
  `]
})
export class LabourerReviews implements OnInit {
  reviews: any[] =[];
  averageRating = 0;
  totalReviews = 0;
  ratingCounts: { [key: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.auth.getReviews().subscribe({
      next: (res: any) => {
        this.reviews = res;
        this.calculateSummary();
      }
    });
  }

  calculateSummary() {
    this.totalReviews = this.reviews.length;
    if (this.totalReviews === 0) return;

    let sum = 0;
    this.reviews.forEach(r => {
      sum += r.rating;
      this.ratingCounts[r.rating] = (this.ratingCounts[r.rating] || 0) + 1;
    });
    this.averageRating = sum / this.totalReviews;
  }

  getPercentage(star: number): number {
    if (this.totalReviews === 0) return 0;
    return ((this.ratingCounts[star] || 0) / this.totalReviews) * 100;
  }
}