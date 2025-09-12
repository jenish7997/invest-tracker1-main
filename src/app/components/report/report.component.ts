
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvestmentService } from '../../services/investment.service';
import { AuthService } from '../../services/auth.service';
import { Investor } from '../../models';

interface ReportData {
  investorName: string;
  transactions: any[];
  principal: number;
  totalInterest: number;
  grownCapital: number;
}

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {
  reports: ReportData[] = [];
  isAdmin: boolean = false;

  constructor(
    private investmentService: InvestmentService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.isAdmin = user.isAdmin;
        if (this.isAdmin) {
          this.loadAllInvestorsReports();
        } else {
          this.loadUserReport(user.uid, user.displayName);
        }
      }
    });
  }

  loadAllInvestorsReports() {
    this.investmentService.listInvestors().subscribe(investors => {
      investors.forEach(investor => {
        this.generateReport(investor.id, investor.name);
      });
    });
  }

  loadUserReport(userId: string, userName: string) {
    this.generateReport(userId, userName);
  }

  generateReport(investorId: string, investorName: string) {
    this.investmentService.computeBalances(investorId, investorName).then(transactions => {
      let principal = 0;
      let totalInterest = 0;

      transactions.forEach(t => {
        if (t.type === 'invest' || t.type === 'deposit') {
          principal += t.amount;
        } else if (t.type === 'interest') {
          totalInterest += t.amount;
        }
      });

      const grownCapital = transactions.length > 0 ? transactions[transactions.length - 1].balance : 0;

      this.reports.push({
        investorName: investorName,
        transactions: transactions,
        principal: principal,
        totalInterest: totalInterest,
        grownCapital: grownCapital
      });
    });
  }
}
