import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = 'http://localhost:3000';
  private loggedIn = new BehaviorSubject<boolean>(!!localStorage.getItem('token'));
  isLoggedIn$ = this.loggedIn.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  private getHeader() {
    return {
      headers: new HttpHeaders({
        Authorization: localStorage.getItem('token') || ''
      })
    };
  }

  login(data: any) {
    return this.http.post(`${this.apiUrl}/login`, data).pipe(
      tap((res: any) => {

        if (!res.token) {
          throw new Error('Token not received');
        }

        // ✅ Save token AND role (Role is needed for Admin Guard)
        localStorage.setItem('token', res.token);
        localStorage.setItem('role', res.role); 
        this.loggedIn.next(true);

        // ✅ FIXED NAVIGATION
        if (res.role === 'admin') {
          this.router.navigate(['/admin-dashboard']);
        } 
        else if (res.role === 'labourer') {
          this.router.navigate(['/labourer-dashboard']);
        } 
        else {
          this.router.navigate(['/user-dashboard']);
        }

      })
    );
  }

  logout() {
    // ✅ Clear everything and go back to root login screen
    localStorage.removeItem('token');
    localStorage.removeItem('role'); 
    this.loggedIn.next(false);
    this.router.navigate(['/']); 
  }

  register(data: any) {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  // ==========================================
  // 👑 ADMIN APIs (Updated for Pro Version)
  // ==========================================
  getAllUsers() {
    return this.http.get(`${this.apiUrl}/admin/users`, this.getHeader());
  }

  toggleUserStatus(userId: number, isActive: boolean) {
    return this.http.post(
      `${this.apiUrl}/admin/toggle-status`,
      { userId, isActive },
      this.getHeader()
    );
  }

  getAdminStats() {
    return this.http.get(`${this.apiUrl}/admin/stats`, this.getHeader());
  }

  deleteUser(userId: number) {
    return this.http.post(
      `${this.apiUrl}/admin/delete-user`, 
      { userId }, 
      this.getHeader()
    );
  }

  getAdminBookings() {
    return this.http.get(`${this.apiUrl}/admin/bookings`, this.getHeader());
  }

  updateAdminBooking(bookingId: number, status: string) {
    return this.http.post(
      `${this.apiUrl}/admin/update-booking`, 
      { bookingId, status }, 
      this.getHeader()
    );
  }

  // ==========================================
  // 🛠️ LABOURER APIs
  // ==========================================
  saveLabourerProfile(data: any) {
    return this.http.post(`${this.apiUrl}/save-labourer-profile`, data, this.getHeader());
  }

  getIncomingRequests() {
    return this.http.get(`${this.apiUrl}/labourer-requests`, this.getHeader());
  }

  respondToBooking(bookingId: number, status: string) {
    return this.http.post(
      `${this.apiUrl}/respond-booking`,
      { bookingId, status },
      this.getHeader()
    );
  }

  toggleAvailability(status: boolean) {
    return this.http.post(
      `${this.apiUrl}/toggle-availability`,
      { status },
      this.getHeader()
    );
  }

  getReviews() {
    return this.http.get(`${this.apiUrl}/labourer-reviews`, this.getHeader());
  }

  // ==========================================
  // 🚀 USER APIs
  // ==========================================
  searchWorkers(category: string, location: string) {
    return this.http.post(
      `${this.apiUrl}/search-workers`,
      { category, location },
      this.getHeader()
    );
  }

  bookWorker(data: any) {
    return this.http.post(`${this.apiUrl}/book-worker`, data, this.getHeader());
  }

  getUserBookings() {
    return this.http.get(`${this.apiUrl}/user-bookings`, this.getHeader());
  }

  addReview(data: any) {
    return this.http.post(`${this.apiUrl}/add-review`, data, this.getHeader());
  }
}