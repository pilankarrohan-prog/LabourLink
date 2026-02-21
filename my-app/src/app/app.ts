import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  isLoggedIn = false;
  viewMode: 'login' | 'register' = 'login';
  
  // Strict Typed Forms
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  registerForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    role: new FormControl('user', [Validators.required]),
    address: new FormControl('', Validators.required),
    contact: new FormControl('', Validators.required)
  });

  constructor(public auth: AuthService) {}

  ngOnInit() {
    this.auth.isLoggedIn$.subscribe(state => this.isLoggedIn = state);
  }

  onLogin() {
    if (this.loginForm.invalid) return;
    this.auth.login(this.loginForm.value).subscribe({
      error: (err) => alert(err.error.message || "Invalid Credentials")
    });
  }

  onRegister() {
    if (this.registerForm.invalid) return;
    this.auth.register(this.registerForm.value).subscribe({
      next: () => { alert("Account created! Please Sign In."); this.viewMode = 'login'; },
      error: (err) => alert(err.error.message || "Registration failed")
    });
  }
}