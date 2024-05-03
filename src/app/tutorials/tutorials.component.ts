import { Component } from '@angular/core';

@Component({
  selector: 'app-tutorials',
  standalone: true,
  imports: [],
  templateUrl: './tutorials.component.html',
  styleUrl: './tutorials.component.css'
})
export class TutorialsComponent {
isSidebarOpen = false;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
