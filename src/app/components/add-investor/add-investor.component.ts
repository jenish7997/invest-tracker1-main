
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Functions, httpsCallable, HttpsCallableResult } from '@angular/fire/functions'; // Correct imports

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
    private router: Router,
    private functions: Functions // Inject the Functions service
  ) {
    this.investorForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      initialDeposit: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {}

  async onSubmit() {
    if (this.investorForm.valid) {
      this.loading = true;
      this.successMessage = '';
      this.errorMessage = '';
      
      const { name, email, initialDeposit, password } = this.investorForm.value;
      
      // Get a reference to the callable function
      const createInvestorUser = httpsCallable(this.functions, 'createInvestorUser');

      try {
        // Call the function with the form data
        const result: HttpsCallableResult = await createInvestorUser({ name, email, initialDeposit, password });
        const data: any = result.data;
        
        this.successMessage = data.message || 'Investor profile created successfully!';
        this.investorForm.reset();

      } catch (error: any) {
        // The httpsCallable automatically unwraps the error message
        this.errorMessage = error.message || 'An unexpected error occurred.';
        console.error('Registration failed:', error);
      } finally {
        this.loading = false;
      }
    }
  }
}
