import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InvestmentService } from '../../services/investment.service';
import { MonthlyRate } from '../../models';
import { CommonModule } from '@angular/common';
import { Functions, httpsCallable, HttpsCallableResult } from '@angular/fire/functions';

@Component({
  selector: 'app-interest',
  templateUrl: './interest.component.html',
  styleUrls: ['./interest.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class InterestComponent implements OnInit {
  rateForm!: FormGroup;
  rates: MonthlyRate[] = [];
  loading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private functions: Functions,
    public svc: InvestmentService
  ) { }

  ngOnInit() {
    this.rateForm = this.fb.group({
      monthKey: ['', Validators.required],
      rate: [0, [Validators.required, Validators.min(0), Validators.max(1)]], // Rate as a decimal (e.g., 0.05 for 5%)
    });

    this.svc.listRates().subscribe(r => {
      this.rates = r.sort((a, b) => a.monthKey.localeCompare(b.monthKey));
    });
  }

  async applyInterest() {
    if (this.rateForm.invalid) return;

    this.loading = true;
    this.clearMessages();

    const { monthKey, rate } = this.rateForm.value;

    const applyInterestFn = httpsCallable(this.functions, 'applyMonthlyInterest');

    try {
      const result: HttpsCallableResult = await applyInterestFn({ monthKey, rate });
      this.successMessage = (result.data as any).message || 'Interest applied successfully!';

      this.rateForm.reset();

      // Refresh the rates list
      this.svc.listRates().subscribe(r => {
        this.rates = r.sort((a, b) => a.monthKey.localeCompare(b.monthKey));
      });

    } catch (error: any) {
      this.errorMessage = error.message || 'Error applying interest. Please try again.';
      console.error('Error applying interest:', error);
    } finally {
      this.loading = false;
    }
  }

  clearMessages() {
    this.successMessage = '';
    this.errorMessage = '';
  }
}
