import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import { FooterComponent } from '../../shared/footer/footer.component';
import { GoogleSigninComponent } from '../../shared/google-sign-in/google-sign-in.component';
import { UserService, RegisterPayload } from '../../services/user.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,       // <--- Wichtig für ngModel!
    RouterLink,
    FooterComponent,
    GoogleSigninComponent
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  benutzerName = '';
  password = '';
  passwordConfirm = '';
  feedback = '';

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

          this.feedback = 'Registrierung erfolgreich!';
          this.router.navigate(['/login']);
          console.log(result + "Login Rückmeldung");
        } else {
          this.feedback = 'Login fehlgeschlagen: Ungültige Antwort.';
        }
      },
      error: err => this.feedback = 'Fehler: ' + err.error
    });
  }
}
