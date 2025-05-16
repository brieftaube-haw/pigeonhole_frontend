import { Component } from '@angular/core';
import {RouterLink} from "@angular/router";
import {FooterComponent} from "../../shared/footer/footer.component";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink,
    FooterComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

}
