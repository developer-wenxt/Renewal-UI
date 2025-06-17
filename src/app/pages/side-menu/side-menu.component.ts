import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { SidebarService } from '../../services/sidebar.service';
@Component({
  selector: 'app-side-menu',
  standalone: false,
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.scss'
})
export class SideMenuComponent {
  items: any[] = [];
  sidebarOpen = false;
  selectedLabel: any
  constructor(private router: Router, private sidebarService: SidebarService) {


  }

  ngOnInit(): void {
    this.menuItem();

  }
  onDashboardClick() {
    this.router.navigate(['/dashboard'])
  }
  onProductClick() {
    this.router.navigate(['/products'])
  }



  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  menuItem() {

    this.sidebarService.items$.subscribe(items => {
      this.items = items;
    });
    this.sidebarService.selectedLabel$.subscribe(label => {
      this.selectedLabel = label;
    });
  }
}
