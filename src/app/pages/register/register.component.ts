import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import { FooterComponent } from '../../shared/footer/footer.component';
import { GoogleSigninComponent } from '../../shared/google-sign-in/google-sign-in.component';
import { UserService, RegisterPayload } from '../../services/user.service';
import {AlertBoxComponent} from "../../shared/alert-box/alert-box/alert-box.component";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,       // <--- Wichtig für ngModel!
    RouterLink,
    FooterComponent,
    GoogleSigninComponent,
    AlertBoxComponent,
    NgIf
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  benutzerName = '';
  password = '';
  passwordConfirm = '';
  confirmationMessage = '';
  showConfirmation = false;
  isSuccess = false;

  constructor(private userService: UserService, private router: Router) {}

  register() {
    const payload: RegisterPayload = {
      benutzerName: this.benutzerName,
      password: this.password,
      passwordConfirm: this.passwordConfirm
    };

    this.userService.registrieren(payload).subscribe({
        next: (result: string) => {
          if (result !== '') {
            this.confirmationMessage = 'Registrierung erfolgreich!';
            this.isSuccess = true;
            this.showConfirmation = true;

            setTimeout(() => {
              this.showConfirmation = false;
              this.router.navigate(['/login']);
            }, 2000);

            console.log(result + "Login Rückmeldung");
          } else {
            this.showErrorMessage('Registrierung fehlgeschlagen: Ungültige Antwort.');
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
    }, 3000);
  }
}
