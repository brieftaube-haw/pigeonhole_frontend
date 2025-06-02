import { Component } from '@angular/core';
import {RouterLink} from "@angular/router";
import {FooterComponent} from "../../shared/footer/footer.component";
import { GoogleSigninComponent } from '../../shared/google-sign-in/google-sign-in.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FooterComponent,
    GoogleSigninComponent
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

}
