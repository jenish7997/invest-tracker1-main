
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Required for *ngFor
import { InvestmentService } from '../../services/investment.service';
import { AuthService } from '../../services/auth.service'; // Added for potential future use
import { Investor } from '../../models'; // Import the Investor model

@Component({
  selector: 'app-report',
  standalone: true, // Set to true
  imports: [CommonModule], // Add CommonModule
  templateUrl: './report.component.html', // Corrected path
  styleUrls: ['./report.component.css'] // Corrected path
})
export class ReportComponent implements OnInit {
  investors: Investor[] = []; // Use the Investor model for strong typing

  constructor(
    private investmentService: InvestmentService,
    public authService: AuthService
  ) { }

  ngOnInit() {
    // Use listInvestors as it is the correct method in the service
    this.investmentService.listInvestors().subscribe(data => {
      console.log('Fetched investors:', data); // Debugging log
      this.investors = data;
    });
  }

  trackByInvestor(index: number, investor: Investor): any {
    return investor.id;
  }

  viewInvestorDetails(investorId: string): void {
    // This can be used to navigate to a detailed view in the future
    console.log('View details for investor:', investorId);
  }
}
