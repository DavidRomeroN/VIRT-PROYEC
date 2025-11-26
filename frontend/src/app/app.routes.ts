import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AuditoriosListComponent } from './components/auditorios-list/auditorios-list.component';
import { ReservaFormComponent } from './components/reserva-form/reserva-form.component';
import { MisReservasComponent } from './components/mis-reservas/mis-reservas.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'auditorios', component: AuditoriosListComponent },
  { path: 'reservas', component: MisReservasComponent },
  { path: 'reservar/:id', component: ReservaFormComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent }
];





