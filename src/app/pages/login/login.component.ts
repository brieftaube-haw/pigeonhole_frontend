import { Component } from '@angular/core';
import {Router, RouterLink} from "@angular/router";
import {FooterComponent} from "../../shared/footer/footer.component";
import { GoogleSigninComponent } from "../../shared/google-sign-in/google-sign-in.component";
import {LoginPayload, UserService} from "../../services/user.service";
import {FormsModule} from "@angular/forms";


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink,
    FooterComponent,
    GoogleSigninComponent,
    FormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  benutzerName = '';
  password = '';
  feedback = '';

  constructor(
    private userService: UserService,
    private router: Router
  ) {}


  login() {
    const payload: LoginPayload = {
      benutzerName: this.benutzerName,
      password: this.password,
    };

    // this.userService.login(payload).subscribe({
    //   next: () => this.feedback = 'Login erfolgreich!' ,
    //   error: err => this.feedback = 'Fehler: ' + err.error
    // });
    this.userService.login(payload).subscribe({
      next: (result: string) => {
        if (result !== '') {
          localStorage.setItem('currentUser', this.benutzerName);
          this.feedback = 'Login erfolgreich!';
          console.log(result + "Login Rückmeldung");
          console.log(this.benutzerName+ "Willkommen");
          this.router.navigate(['/chat']); // ← Navigate after success
        } else {
          this.feedback = 'Login fehlgeschlagen: Ungültige Antwort.';
        }
      },
      error: err => {
        this.feedback = 'Fehler: ' + err.error;
      }
    });
  }


}
