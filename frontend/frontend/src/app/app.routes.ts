import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AuditoriosListComponent } from './components/auditorios-list/auditorios-list.component';
import { AuditorioDetailComponent } from './components/auditorio-detail/auditorio-detail.component';
import { ReservaFormComponent } from './components/reserva-form/reserva-form.component';
import { MisReservasComponent } from './components/mis-reservas/mis-reservas.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'auditorios', component: AuditoriosListComponent },
  { path: 'auditorios/:id', component: AuditorioDetailComponent },
  { path: 'reservas', component: MisReservasComponent },
  { path: 'reservar/:id', component: ReservaFormComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'admin', component: AdminPanelComponent }
];





