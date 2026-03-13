import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-labourer-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './labourer-settings.html',
  styleUrls:['./labourer-settings.css']
})
export class LabourerSettings implements OnInit {
  labourer = {
    name: '',
    address: '',
    contact: '',
    skill: 'Plumber',
    experience: 0,
    age: 18,
    gender: 'Male'
  };

  skillsList =['Plumber', 'Electrician', 'Carpenter', 'Painter', 'Welder', 'Mechanic', 'Maid', 'Cook', 'Gardner', 'Mason', 'Technician'];

  constructor(private auth: AuthService) {}

  ngOnInit() {
    // THIS is what fetches the data from the database when the page loads
    this.auth.getLabourerProfile().subscribe({
      next: (res: any) => {
        if(res) {
          this.labourer = { ...this.labourer, ...res };
        }
      },
      error: (err) => console.error("Failed to load profile", err)
    });
  }

  saveProfile() {
    if (this.labourer.age < 18) {
      alert("Age must be 18 or older to work.");
      return;
    }

    this.auth.saveLabourerProfile(this.labourer).subscribe({
      next: () => alert("Profile Details Updated Successfully!"),
      error: () => alert("Failed to save profile.")
    });
  }
}