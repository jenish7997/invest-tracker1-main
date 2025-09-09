import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
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
    private authService: AuthService,
    private router: Router
  ) {
    this.investorForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      initialDeposit: [null, Validators.required],
      investmentDate: ['', Validators.required],
      phone: [''],
    });
  }

  ngOnInit(): void {}

  async onSubmit() {
    if (this.investorForm.valid) {
      this.loading = true;
      this.successMessage = '';
      this.errorMessage = '';
      const { email, name, initialDeposit, investmentDate, phone } = this.investorForm.value;
      try {
        await this.authService.register(email, name);
        // Add logic to handle the rest of the form data (initialDeposit, etc.)
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
