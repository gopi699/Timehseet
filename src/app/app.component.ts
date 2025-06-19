import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],  // ✅ Import RouterOutlet
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'timesheetform';

  constructor(private router: Router) {}

  ngOnInit() {
    // Prevent back navigation after login
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && event.url !== '/login') {
        history.pushState(null, '', location.href);
      }
    });

    window.onpopstate = () => {
      if (this.router.url !== '/login') {
        history.pushState(null, '', location.href);
      }
    };
  }
}
