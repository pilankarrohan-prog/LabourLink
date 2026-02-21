import { Routes } from '@angular/router';

// Auth Guard Import
import { adminGuard } from './guards/admin-guard';

// User Imports
import { UserDashboard } from './user-dashboard/user-dashboard';
import { UserHome } from './user-dashboard/user-home/user-home';
import { UserSearch } from './user-dashboard/user-search/user-search';
import { UserBookings } from './user-dashboard/user-bookings/user-bookings';
import { UserSettings } from './user-dashboard/user-settings/user-settings';

// Labourer Imports
import { LabourerDashboard } from './labourer-dashboard/labourer-dashboard';
import { LabourerHome } from './labourer-dashboard/labourer-home/labourer-home';
import { LabourerRequests } from './labourer-dashboard/labourer-requests/labourer-requests';
import { LabourerReviews } from './labourer-dashboard/labourer-reviews/labourer-reviews';
import { LabourerSettings } from './labourer-dashboard/labourer-settings/labourer-settings';

// Admin Import
import { AdminDashboard } from './admin-dashboard/admin-dashboard';

export const routes: Routes = [

  // 👑 Protected Admin Dashboard
  {
    path: 'admin-dashboard',
    component: AdminDashboard,
    canActivate: [adminGuard] // 🔒 This protects the route!
  },

  // 🚀 User Dashboard + Child Routes
  {
    path: 'user-dashboard',
    component: UserDashboard,
    children: [
      { path: '', component: UserHome },
      { path: 'search', component: UserSearch },
      { path: 'bookings', component: UserBookings },
      { path: 'settings', component: UserSettings }
    ]
  },

  // 🛠️ Labourer Dashboard + Child Routes
  {
    path: 'labourer-dashboard',
    component: LabourerDashboard,
    children: [
      { path: '', component: LabourerHome },
      { path: 'requests', component: LabourerRequests },
      { path: 'reviews', component: LabourerReviews },
      { path: 'settings', component: LabourerSettings }
    ]
  },

  // Default Redirect
  { path: '', redirectTo: 'user-dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'user-dashboard' }

];