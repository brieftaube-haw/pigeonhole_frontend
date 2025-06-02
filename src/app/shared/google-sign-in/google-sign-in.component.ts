import { Component, AfterViewInit } from '@angular/core';

declare const gapi: any;

@Component({
  selector: 'shared-google-signin',
  standalone: true,   
  templateUrl: './google-sign-in.component.html',
  styleUrls: ['./google-sign-in.component.css']
})
export class GoogleSigninComponent implements AfterViewInit {

  ngAfterViewInit(): void {
    this.startApp();
  }

  startApp() {
    gapi.load('auth2', () => {
      const auth2 = gapi.auth2.init({
        client_id: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
        cookiepolicy: 'single_host_origin',
      });
      this.attachSignin(document.getElementById('customBtn'));
    });
  }

  attachSignin(element: HTMLElement | null) {
    if (!element) return;

    gapi.auth2.getAuthInstance().attachClickHandler(element, {},
      (googleUser: any) => {
        document.getElementById('name')!.innerText =
          "Signed in: " + googleUser.getBasicProfile().getName();
      },
      (error: any) => {
        alert(JSON.stringify(error, undefined, 2));
      }
    );
  }
}
