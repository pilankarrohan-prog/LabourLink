import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-labourer-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Edit Profile & Skills</h2>

    <div class="card">

      <div class="input-group">
        <label>Full Name</label>
        <input type="text" [(ngModel)]="labourer.name">
      </div>

      <div class="input-group">
        <label>Primary Skill</label>
        <select [(ngModel)]="labourer.skill">
          <option *ngFor="let s of skillsList" [value]="s">
            {{ s }}
          </option>
        </select>
      </div>

      <div class="input-group">
        <label>Address / City</label>
        <input type="text" [(ngModel)]="labourer.address">
      </div>

      <div class="input-group">
        <label>Contact</label>
        <input type="text" [(ngModel)]="labourer.contact">
      </div>

      <div style="display:flex; gap:15px;">
        <div class="input-group" style="flex:1;">
          <label>Age</label>
          <input type="number" [(ngModel)]="labourer.age">
        </div>

        <div class="input-group" style="flex:1;">
          <label>Experience (Years)</label>
          <input type="number" [(ngModel)]="labourer.experience">
        </div>
      </div>

      <button class="btn-save" (click)="saveProfile()">
        Save Profile Details
      </button>

    </div>
  `,
  styles: []
})
export class LabourerSettings {

  labourer = {
    name: '',
    address: '',
    contact: '',
    skill: 'Plumber',
    experience: 0,
    age: 18,
    gender: 'Male'
  };

  skillsList = [
    'Plumber',
    'Electrician',
    'Carpenter',
    'Painter',
    'Welder',
    'Mechanic'
  ];

  constructor(private auth: AuthService) {}

  saveProfile() {
    if (this.labourer.age < 18) {
      alert("Age must be 18+");
      return;
    }

    this.auth.saveLabourerProfile(this.labourer)
      .subscribe(() => alert("Profile Saved Successfully!"));
  }
}