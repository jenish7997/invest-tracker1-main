import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InvestmentService } from '../../services/investment.service';
import { MonthlyRate } from '../../models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-interest',
  templateUrl: './interest.component.html',
  styleUrls: ['./interest.component.css'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class InterestComponent implements OnInit {
  rateForm!: FormGroup;
  rates: MonthlyRate[] = [];
  loading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private fb: FormBuilder, public svc: InvestmentService) { }

  ngOnInit() {
    this.rateForm = this.fb.group({
      monthKey: ['', Validators.required], // ✅ required
      rate: [0, [Validators.required, Validators.min(0)]], // ✅ must be >= 0
    });

    this.svc.listRates().subscribe(r => {
      // optional: sort by month for cleaner table display
      this.rates = r.sort((a, b) => a.monthKey.localeCompare(b.monthKey));
    });
  }


  async saveRate() {
    if (this.rateForm.invalid) return;

    this.loading = true;
    this.clearMessages();

    const v = this.rateForm.value;

    try {
      await this.svc.setMonthlyRate({
        monthKey: v.monthKey!,
        rate: Number(v.rate),
      });

      this.successMessage = 'Interest rate saved successfully!';

      // reset only the rate, keep the same month for convenience
      this.rateForm.patchValue({ rate: 0 });

      // Refresh the rates list
      this.svc.listRates().subscribe(r => {
        this.rates = r.sort((a, b) => a.monthKey.localeCompare(b.monthKey));
      });

    } catch (error) {
      this.errorMessage = 'Error saving interest rate. Please try again.';
      console.error('Error saving rate:', error);
    } finally {
      this.loading = false;
    }
  }

  clearMessages() {
    this.successMessage = '';
    this.errorMessage = '';
  }
}
