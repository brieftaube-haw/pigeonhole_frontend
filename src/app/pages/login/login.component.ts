import { Component } from '@angular/core';
import {RouterLink} from "@angular/router";
import {FooterComponent} from "../../shared/footer/footer.component";
import { GoogleSigninComponent } from "../../shared/google-sign-in/google-sign-in.component";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink,
    FooterComponent,
    GoogleSigninComponent
],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

}