import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import {
  Chart,
  ChartData,
  ChartOptions,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {
  MatDatepicker,
  MatDatepickerModule
} from '@angular/material/datepicker';
import {
  MatNativeDateModule,
  DateAdapter,
  MAT_DATE_FORMATS
} from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';


// ✅ Custom format MM/yyyy
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
export class DashboardComponent {
  datalabels = ChartDataLabels;
monthYearDisplay: string = '';
  monthYearControl = new FormControl(new Date());
  selectedYear: number | null = null;

  constructor(private datePipe: DatePipe) {}

  onYearSelected(normalizedYear: Date) {
    this.selectedYear = normalizedYear.getFullYear();
  }

  onMonthSelected(normalizedMonth: Date, datepicker: MatDatepicker<Date>) {
    const selectedDate = new Date(this.selectedYear!, normalizedMonth.getMonth(), 1);
    this.monthYearControl.setValue(selectedDate);
    datepicker.close();
    this.filterDashboardData(selectedDate);
  }

  get formattedMonthYear(): string {
    return this.datePipe.transform(this.monthYearControl.value, 'MM/yyyy') || '';
  }

  filterDashboardData(selectedDate: Date) {
    const month = selectedDate.getMonth();
    const year = selectedDate.getFullYear();

    console.log('Filtering data for:', month + 1, year);

    this.barChartData.datasets[0].data = [70, 65, 75, 80, 60];
    this.pieChartData.datasets[0].data = [12, 10, 8];
    this.billablePieData.datasets[0].data = [25, 20, 15, 30, 10];
  }

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { position: 'top' }
    }
  };

  barChartData: ChartData<'bar', number[], string> = {
    labels: ['P', 'A', 'B', 'C', 'D'],
    datasets: [{
      label: 'Utilization (%)',
      data: [82, 70, 90, 75, 60],
      backgroundColor: '#60A5FA'
    }]
  };

  pieChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: {
      legend: { position: 'right' }
    }
  };

  pieChartData: ChartData<'doughnut', number[], string> = {
    labels: ['Sick Leave', 'Paid Leave', 'Others'],
    datasets: [{
      label: 'Leave Distribution',
      data: [10, 15, 5],
      backgroundColor: ['#34D399', '#FBBF24', '#F87171']
    }]
  };

  billablePieData: ChartData<'pie', number[], string> = {
    labels: ['Visit Friends', 'Sightseeing', 'Business', 'Outdoor', 'Other'],
    datasets: [{
      data: [48, 17, 15, 11, 9],
      backgroundColor: ['#FFD700', '#FFB700', '#FFDA66', '#F2C94C', '#FFEAA7'],
      borderColor: '#ffffff',
      borderWidth: 1
    }]
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
          const percentage = ((value / total) * 100).toFixed(0);
          return `${percentage}%`;
        }
      }
    }
  };
}
