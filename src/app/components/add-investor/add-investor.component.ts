
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InvestmentService } from '../../services/investment.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-investor',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-investor.component.html',
  styleUrls: ['./add-investor.component.css']
})
export class AddInvestorComponent implements OnInit {
  investorForm: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private investmentService: InvestmentService,
    private router: Router
  ) {
    this.investorForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      initialDeposit: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {}

  async onSubmit() {
    if (this.investorForm.valid) {
      this.loading = true;
      this.successMessage = '';
      this.errorMessage = '';
      const { name, email, initialDeposit } = this.investorForm.value;
      try {
        await this.investmentService.addInvestor(name, email, initialDeposit);
        this.successMessage = 'Investor profile created successfully!';
        this.investorForm.reset();
        // Navigate or perform other actions as needed
      } catch (error) {
        this.errorMessage = 'Registration failed. Please try again.';
        console.error('Registration failed:', error);
      } finally {
        this.loading = false;
      }
    }
  }
}
