// dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import {
  Chart,
  ChartData,
  ChartOptions
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {
  MatDatepickerModule
} from '@angular/material/datepicker';
import {
  MatNativeDateModule,
  MAT_DATE_FORMATS
} from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DbservicesService } from '../dbservices.service';
import { hostIP } from '../const_url';

export const MONTH_YEAR_FORMATS = {
  parse: { dateInput: 'MM/yyyy' },
  display: {
    dateInput: 'MM/yyyy',
    monthYearLabel: 'MMM yyyy',
    dateA11yLabel: 'MMMM yyyy',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

Chart.register(ChartDataLabels);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgChartsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './dashboard.component.html',
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: MONTH_YEAR_FORMATS },
    DatePipe
  ]
})
export class DashboardComponent implements OnInit {
  datalabels = ChartDataLabels;
  monthYearControl = new FormControl(new Date());
  selectedYear: number | null = null;
  host = hostIP;
  allocatedHours = 0;
  totalLoggedHours = 0;
  billableHours = 0;
  nonBillableHours = 0;
  utilizationRate = 0;

  birthdayList: any[] = [];
  noticeBoard: any[] = [];
  currentBirthdayIndex = 0;
  currentNoticeIndex = 0;
  scrollInterval: any;
  noticeInterval: any;
  
  currentIndex = 0;
getTransform: any;
transition: any;

  getCurrentPhotoUrl(): string {
    const photo = this.birthdayList[this.currentIndex]?.professional_photo;
    if (photo) {
      // Remove leading slashes to avoid double slashes
      return this.host + photo.replace(/^\/+/, '');
    } else {
      return 'assets/images/default-avatar.png';
    }
  }

  interval: any;
  // Notice popup variables
  showNoticePopup = false;
  selectedNotice: any = null;

  constructor(private datePipe: DatePipe, private dbService: DbservicesService) {}

  ngOnInit(): void {
    const today = new Date();
    this.selectedYear = today.getFullYear();
    this.fetchDashboardData(today);
    this.fetchBirthdayList(today);
    this.fetchNotices();
      this.host = hostIP;
     this.interval = setInterval(() => {
      if (this.birthdayList.length === 0) return;

      // Move to next index
      this.currentIndex = (this.currentIndex + 1) % this.birthdayList.length;
    }, 2000);
  }

  ngOnDestroy(): void {
     if (this.interval) {
      clearInterval(this.interval);
    }
  }

  clearScrollIntervals(): void {
    if (this.scrollInterval) clearInterval(this.scrollInterval);
    if (this.noticeInterval) clearInterval(this.noticeInterval);
  }

  startAutoScroll(): void {
    this.clearScrollIntervals();
    if (this.birthdayList.length > 0) {
      this.scrollInterval = setInterval(() => {
        this.currentBirthdayIndex = (this.currentBirthdayIndex + 1) % this.birthdayList.length;
      }, 3000);
    }
    if (this.noticeBoard.length > 0) {
      this.noticeInterval = setInterval(() => {
        this.currentNoticeIndex = (this.currentNoticeIndex + 1) % this.noticeBoard.length;
      }, 4000);
    }
  }

  onYearSelected(normalizedYear: Date): void {
    this.selectedYear = normalizedYear.getFullYear();
  }

  onMonthSelected(normalizedMonth: Date, datepicker: any): void {
    const selectedDate = new Date(this.selectedYear!, normalizedMonth.getMonth(), 1);
    this.monthYearControl.setValue(selectedDate);
    datepicker.close();
    this.fetchDashboardData(selectedDate);
    this.fetchBirthdayList(selectedDate);
  }

downloadAttachmentFromAPI(notice: any): void {
  const payload = { header: notice.header };

  this.dbService.Getdownloadnoticefile(payload).subscribe({
    next: (res: Blob) => {
      console.log('API Blob response:', res);
      const blob = new Blob([res], { type: res.type });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = notice.attachment || 'attachment';
      a.click();
      window.URL.revokeObjectURL(url);
    },
    error: (err) => {
      console.error('Download API error:', err);
      alert('Failed to download attachment.');
    }
  });
}



  openNoticePopup(notice: any): void {
    this.selectedNotice = notice;
    this.showNoticePopup = true;
  }

  closePopup(): void {
    this.showNoticePopup = false;
    this.selectedNotice = null;
  }

  downloadAttachment(url: string): void {
    if (!url) return;
    
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = url.split('/').pop() || 'attachment';
    
    // Trigger the download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  fetchDashboardData(date: Date): void {
    const formattedDate = this.datePipe.transform(date, 'yyyy-MM') || '';
    const userId = sessionStorage.getItem('userId') || '';
    const payload = { yearMonth: formattedDate, user_Pk_Id: userId };

    this.dbService.Getdashboardlist(payload).subscribe({
      next: (res: any) => {
        const data = res?.[0];
        if (data) {
          this.allocatedHours = data.totalAllocatedProject || 0;
          this.totalLoggedHours = data.totalHoursLogged || 0;
          this.billableHours = data.billableHours || 0;
          this.nonBillableHours = data.nonBillableHours || 0;
          this.utilizationRate = data.utilizationRate || 0;

          this.billablePieData = {
            labels: ['Billable', 'Non-Billable'],
            datasets: [{
              data: [this.billableHours, this.nonBillableHours],
              backgroundColor: ['#10B981', '#F59E0B'],
              borderColor: '#ffffff',
              borderWidth: 1
            }]
          };
        }
      },
      error: (err) => console.error('Dashboard main API error', err)
    });

    this.dbService.Getdashboardprojectlist(payload).subscribe({
      next: (res: any[]) => {
        this.barChartData = {
          labels: res.map(p => p.project_Name),
          datasets: [{
            label: 'Worked Hours',
            data: res.map(p => p.totalWorkedHours),
            backgroundColor: '#60A5FA'
          }]
        };
      },
      error: (err) => console.error('Project utilization error', err)
    });

    this.dbService.Getdashboardleavelist(payload).subscribe({
      next: (res: any[]) => {
        this.pieChartData = {
          labels: res.map(l => l.leave_Description),
          datasets: [{
            label: 'Leave Distribution',
            data: res.map(l => +l.leave_Count),
            backgroundColor: ['#34D399', '#FBBF24', '#F87171', '#6366F1', '#E879F9']
          }]
        };
      },
      error: (err) => console.error('Leave chart error', err)
    });
  }

 fetchBirthdayList(date: Date): void {
  const month = date.getMonth() + 1;
  this.dbService.getdateofbirth({ month }).subscribe({
    next: (res) => {
      this.birthdayList = (res || []).map((person: { date_of_Birth: string | number | Date; }) => ({
        ...person,
        // Convert date_of_Birth to Date object
        date_of_Birth: new Date(person.date_of_Birth)
      }));
      this.currentBirthdayIndex = 0;
      this.startAutoScroll();
    },
    error: (err) => console.error('Birthday fetch error:', err)
  });
}


  fetchNotices(): void {
    this.dbService.getdashboard({}).subscribe({
      next: (res) => {
        this.noticeBoard = res || [];
        this.currentNoticeIndex = 0;
        this.startAutoScroll();
      },
      error: (err) => console.error('Notice board fetch error:', err)
    });
  }

  // Chart configurations remain the same...
  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: { legend: { position: 'top' } }
  };

  barChartData: ChartData<'bar', number[], string> = {
    labels: [],
    datasets: []
  };

  pieChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 20,
          font: { size: 14 }
        }
      }
    }
  };

  pieChartData: ChartData<'doughnut', number[], string> = {
    labels: [],
    datasets: []
  };

  billablePieData: ChartData<'pie', number[], string> = {
    labels: [],
    datasets: []
  };

  billablePieOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      datalabels: {
        color: '#000',
        font: { size: 14, weight: 'bold' },
        formatter: (value: number, context: any) => {
          const total = context.chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
          return `${((value / total) * 100).toFixed(0)}%`;
        }
      }
    }
  };
}