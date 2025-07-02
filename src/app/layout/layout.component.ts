import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { DbservicesService } from '../dbservices.service';
interface MenuItem {
  title: string;
  icon: string;
  route?: string;
  submenu?: MenuItem[];
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterLink, RouterOutlet, CommonModule, RouterModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  UserName: any;
  currentRoute: string = '';
  headerTitle: string = '';
  isUserDropdownOpen: boolean = false;
  isMenuOpen: boolean = false;
  openSubMenuIndex: number | null = null;
  menuList: any[] = [];
  constructor(private dbService: DbservicesService, private router: Router, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.setHeaderTitle();
    this.router.events.subscribe(() => this.setHeaderTitle());
    this.UserName = (sessionStorage.getItem('UserName'));
    //console.log('username from sessionStorage before API call:', this.UserName);
    const userDetails: any = localStorage.getItem('userDetails');
    if (userDetails) {
      this.router.navigate(['/login']);
      this.logout();
    }
    this.fetchDataFromApi();
  }

  fetchDataFromApi() {
    const roleId: number = Number(sessionStorage.getItem('roleId'));
    // const AccessToken:any = (sessionStorage.getItem('accesstoken'));
    // const payload: any = {
    //   roleId
    // };

    // Log the roleId from sessionStorage before calling the service
    //console.log('RoleID from sessionStorage before API call:', roleId);

    // Use the dynamically fetched roleId from sessionStorage
    // payload.roleId = roleId ? parseInt(roleId, 10) : 0;

    this.dbService.GetRoleBasedMenu(roleId).subscribe(
      (response: any) => {
        //console.log('API Response:', response);
        this.menuList = response.menuItem;

         this.menuList.push({icon: "event_available",id: null,parent_Id: 0,pkScreenId: 1,route: null,screenName: "Master",title: "Master",type: "collapsable",
          submenu:[
            {icon:"view_list",id :  null, parent_Id :  2, pkScreenId :  10, route :  "employee-Master", screenName :  "Master", title :  "Employee-Master", type :  "basic"},
        //    {icon:"view_list",id :  null, parent_Id :  2, pkScreenId :  10, route :  "client-Master", screenName :  "Master", title :  "Client-Master", type :  "basic"}
          ]})
        // this.populateMenuItems(response.menuItem); // Populate the form with the received data
      },
      (error) => {
        console.error('API Error:', error);
      }
    );
  }

  setHeaderTitle(): void {
    const route = this.router.url;
    const url = route.replace('/', '')
    //console.log("this.router.getCurrentNavigation", url)

    switch (url) {
      case 'addtimesheet':
        this.headerTitle = 'Add Timesheet';
        break;
      case 'view':
        this.headerTitle = 'View Timesheet';
        break;
      case 'approval':
        this.headerTitle = 'Timesheet Approval';
        break;
      case 'applyleave':
        this.headerTitle = 'Leave Management';
        break;
      case 'leaveapproval':
        this.headerTitle = 'Leave Approval';
        break;
      case 'addreimburse':
        this.headerTitle = 'Add Reimburse';
        break;
      case 'viewreimburse':
          this.headerTitle = 'View Reimburse';
          break;
          case 'reimburseapproval':
        this.headerTitle = 'Reimburse Approval';
        break;
      case 'dashboard':
        this.headerTitle = 'Dashboard';
        break;
      // case 'client-Master':
      //   this.headerTitle = ' Client Master';
      //   break;
      case 'employee-Master':
        this.headerTitle = 'Employee Master';
        break;

      default:
        this.headerTitle = '';
        break;
    }

  }


  logout() {
    // localStorage.removeItem('userDetails');
    // localStorage.removeItem('userId');
    sessionStorage.removeItem('userId')
    sessionStorage.removeItem('userDetails')
    sessionStorage.clear();
    this.isUserDropdownOpen = false;
    this.router.navigate(['/login']);
  }

  // menuItems: MenuItem[] = [
  //   {
  //     title: 'Timesheet',
  //     icon: '📝',
  //     submenu: [
  //       { title: 'Add Timesheet', icon: '➕', route: '/addtimesheet' },
  //       { title: 'View Timesheet', icon: '📊', route: '/view' }
  //     ]

  //   },
  //   {
  //     title: 'Approvals',
  //     icon: '✔️',
  //     submenu: [
  //       { title: 'View Approval', icon: '👀', route: '/approval' }
  //     ]
  //   }
  // ];


  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    this.openSubMenuIndex = null;
  }

  toggleUserDropdown(event: Event): void {
    event.stopPropagation(); // Prevents closing when clicking inside the dropdown
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
  }

  toggleSubMenu(index: number): void {
    this.openSubMenuIndex = this.openSubMenuIndex === index ? null : index;
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-dropdown')) {
      this.isUserDropdownOpen = false;
    }
  }
}

