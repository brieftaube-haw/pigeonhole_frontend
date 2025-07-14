import { Component, Input } from '@angular/core';
import {NgClass, NgIf} from "@angular/common";

@Component({
  selector: 'app-alert-box',
  standalone: true,
  templateUrl: './alert-box.component.html',
  imports: [
    NgClass,
    NgIf
  ],
  styleUrl: './alert-box.component.css'
})
export class AlertBoxComponent {
  @Input() message: string = '';
  @Input() type: 'success' | 'error' = 'success';

  get visible(): boolean {
    return !!this.message;
  }
}
