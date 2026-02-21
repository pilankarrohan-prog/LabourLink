import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-bookings.html',
  styleUrls: ['./user-bookings.css']
})
export class UserBookings implements OnInit {

  bookings: any[] = [];

  ratingValue: number = 5;
  reviewComment: string = '';
  activeReviewId: number | null = null;

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.fetchBookings();
  }

  fetchBookings(): void {
    this.auth.getUserBookings().subscribe({
      next: (res: any) => {
        this.bookings = res;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  openReviewForm(bookingId: number): void {
    this.activeReviewId = bookingId;
    this.ratingValue = 5;
    this.reviewComment = '';
  }

  submitReview(booking: any): void {
    if (!this.reviewComment) {
      alert('Please add a comment');
      return;
    }

    const payload = {
      labourerId: booking.labourer_id,
      rating: this.ratingValue,
      comment: this.reviewComment
    };

    this.auth.addReview(payload).subscribe({
      next: () => {
        alert('Review Submitted!');
        this.activeReviewId = null;
        this.fetchBookings();
      },
      error: () => {
        alert('Failed to submit review');
      }
    });
  }
}