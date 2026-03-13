import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-payments',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="payments-container">
      <h2 style="color: var(--text-main); margin-bottom: 20px;">Payment & Billing</h2>
      
      <div class="cards-grid">
        <div class="card payment-card">
          <h3>Total Spent</h3>
          <h1 style="color: var(--primary);">₹12,450</h1>
          <p>Across 8 completed bookings</p>
        </div>
        
        <div class="card add-method">
          <h3>Saved Payment Methods</h3>
          <div class="method">💳 **** **** **** 4242 (Visa)</div>
          <div class="method">📱 user@upi (UPI)</div>
          <button class="btn-primary mt-10">+ Add New Method</button>
        </div>
      </div>

      <h3 style="color: var(--text-main); margin-top: 30px; margin-bottom: 15px;">Recent Transactions</h3>
      <div class="card transaction-list">
        <div class="transaction">
          <div>
            <strong>Plumbing Service</strong>
            <p>Worker: John Doe</p>
          </div>
          <div class="amount text-danger">- ₹850</div>
        </div>
        <div class="transaction">
          <div>
            <strong>Electrical Repair</strong>
            <p>Worker: Mike Smith</p>
          </div>
          <div class="amount text-danger">- ₹1,200</div>
        </div>
      </div>
    </div>
  `,
  styles:[`
    .cards-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .payment-card h1 { font-size: 40px; margin: 10px 0; }
    .method { background: var(--bg-main); padding: 12px; border-radius: 8px; margin-bottom: 10px; border: 1px solid var(--border-color); color: var(--text-main); font-weight: 500;}
    .transaction { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid var(--border-color); color: var(--text-main); }
    .transaction:last-child { border-bottom: none; }
    .amount { font-weight: bold; font-size: 18px; }
    .text-danger { color: var(--danger); }
    .btn-primary { background: var(--primary); color: white; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; width: 100%; font-weight: 600; margin-top: 10px;}
  `]
})
export class UserPayments {}