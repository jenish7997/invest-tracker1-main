import { Component } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InvestmentService } from '../../services/investment.service';
import { Investor, Transaction } from '../../models';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-add-investor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-investor.component.html',
  styleUrls: ['./add-investor.component.css'],
})
export class AddInvestorComponent {
  investorForm: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder, private svc: InvestmentService) {
    this.investorForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      initialDeposit: [0, [Validators.required, Validators.min(0)]],
      investmentDate: [new Date().toISOString().split('T')[0], Validators.required],
    });
  }

  async onSubmit() {
    if (this.investorForm.invalid) {
      this.investorForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    try {
      const { name, initialDeposit, investmentDate } = this.investorForm.value;

      // 1. Add the investor
      const investorId = await this.svc.addInvestor(name);

      // 2. If there's an initial deposit, add it as the first transaction
      if (initialDeposit > 0) {
        const transaction: Omit<Transaction, 'id'> = {
          investorId,
          investorName: name,
          amount: initialDeposit,
          date: Timestamp.fromDate(new Date(investmentDate)),
          type: 'invest',
        };
        await this.svc.addTransaction(transaction);
      }

      this.successMessage = `Investor "${name}" created successfully with ID: ${investorId}`;
      this.investorForm.reset({
        name: '',
        email: '',
        phone: '',
        initialDeposit: 0,
        investmentDate: new Date().toISOString().split('T')[0],
      });
    } catch (err) {
      console.error(err);
      this.errorMessage =
        'An error occurred while creating the investor. Please try again.';
    } finally {
      this.loading = false;
    }
  }
}