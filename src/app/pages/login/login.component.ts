import { Component } from '@angular/core';
import {Router, RouterLink} from "@angular/router";
import {FooterComponent} from "../../shared/footer/footer.component";
import { GoogleSigninComponent } from "../../shared/google-sign-in/google-sign-in.component";
import {LoginPayload, UserService} from "../../services/user.service";
import {FormsModule} from "@angular/forms";
import {NgClass, NgIf} from "@angular/common";
import {AlertBoxComponent} from "../../shared/alert-box/alert-box/alert-box.component";


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink,
    FooterComponent,
    GoogleSigninComponent,
    FormsModule,
    NgClass,
    NgIf,
    AlertBoxComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  benutzerName = '';
  password = '';
  confirmationMessage = '';
  showConfirmation = false;
  isSuccess = false;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  login() {
    const payload: LoginPayload = {
      benutzerName: this.benutzerName,
      password: this.password,
    };

    this.userService.login(payload).subscribe({
      next: (result: string) => {
        if (result !== '') {
          localStorage.setItem('currentUser', this.benutzerName);
          this.confirmationMessage = 'Login erfolgreich!';
          this.isSuccess = true;
          this.showConfirmation = true;

          setTimeout(() => {
            this.showConfirmation = false;
            this.router.navigate(['/chat']);
          }, 1500);
          console.log( "Willkommen " + this.benutzerName);
        }
      },
      error: err => {
        this.showErrorMessage('Fehler: ' + err.error);
      }
    });
  }


  private showErrorMessage(message: string) {
    this.confirmationMessage = message;
    this.isSuccess = false;
    this.showConfirmation = true;

    setTimeout(() => {
      this.showConfirmation = false;
    }, 2000);
  }


}
