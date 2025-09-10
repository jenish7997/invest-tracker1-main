
import { Component, OnInit } from '@angular/core';
import { InvestmentService } from '../../services/investment.service';

@Component({
  selector: 'app-report',
  templateUrl: './report.html',
  styleUrls: ['./report.css']
})
export class ReportComponent implements OnInit {
  investors: any[] = [];

  constructor(private investmentService: InvestmentService) { }

  ngOnInit() {
    this.investmentService.getInvestors().subscribe(data => {
      this.investors = data;
    });
  }
}
