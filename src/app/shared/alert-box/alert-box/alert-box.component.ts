import { Component, Input } from '@angular/core';
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-alert-box',
  standalone: true,
  templateUrl: './alert-box.component.html',
  imports: [
    NgClass
  ],
  styleUrl: './alert-box.component.css'
})
export class AlertBoxComponent {
  @Input() message: string = '';
  @Input() type: 'success' | 'error' = 'success';
}
