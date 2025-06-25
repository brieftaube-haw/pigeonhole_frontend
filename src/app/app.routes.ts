import { Routes } from '@angular/router';
import {LoginComponent} from "./pages/login/login.component";
import { RegisterComponent } from './pages/register/register.component';
import {ChatComponent} from "./pages/chat/chat.component";

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'chat', component: ChatComponent }
];
