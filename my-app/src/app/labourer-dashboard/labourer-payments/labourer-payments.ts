import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-labourer-payments',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="wallet-container">
      <h2 style="color: var(--text-main); margin-bottom: 20px;">My Wallet & Earnings</h2>
      
      <div class="wallet-overview card">
        <div>
          <p style="color: var(--text-muted); font-size: 16px;">Available for Withdrawal</p>
          <h1 style="color: var(--success); font-size: 48px; margin: 5px 0;">₹4,250</h1>
        </div>
        <button class="btn-withdraw">Withdraw to Bank</button>
      </div>

      <div class="stats-grid">
        <div class="card mini-stat">
          <h4>Total Earned</h4>
          <p>₹24,500</p>
        </div>
        <div class="card mini-stat">
          <h4>Jobs Completed</h4>
          <p>32</p>
        </div>
        <div class="card mini-stat">
          <h4>Pending Clearance</h4>
          <p>₹800</p>
        </div>
      </div>
    </div>
  `,
  styles:[`
    .wallet-overview { display: flex; justify-content: space-between; align-items: center; background: var(--bg-card); border-left: 6px solid var(--success); padding: 30px;}
    .btn-withdraw { background: var(--success); color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 16px; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3);}
    .btn-withdraw:hover { transform: translateY(-2px); }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 20px; }
    .mini-stat h4 { color: var(--text-muted); font-size: 14px; margin-bottom: 5px; }
    .mini-stat p { color: var(--text-main); font-size: 24px; font-weight: 700; margin: 0; }
  `]
})
export class LabourerPayments {}