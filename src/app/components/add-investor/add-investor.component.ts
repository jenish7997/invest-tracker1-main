
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { HttpsCallableResult } from 'firebase/functions';

// --- NG-ZORRO Imports ---
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzAlertModule } from 'ng-zorro-antd/alert';

@Component({
  selector: 'app-add-investor',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    // --- NG-ZORRO Modules ---
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzGridModule,
    NzCardModule,
    NzTypographyModule,
    NzIconModule,
    NzSpinModule,
    NzAlertModule
  ],
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
    private functions: Functions
  ) {
    this.investorForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      initialDeposit: [null, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {}

  async onSubmit() {
    if (this.investorForm.valid) {
      this.loading = true;
      this.successMessage = '';
      this.errorMessage = '';
      
      const { name, email, initialDeposit, password } = this.investorForm.value;
      const createInvestorUser = httpsCallable(this.functions, 'createInvestorUser');

      try {
        const result: HttpsCallableResult = await createInvestorUser({ name, email, initialDeposit, password });
        const data: any = result.data;
        this.successMessage = data.message || 'Investor profile created successfully!';
        this.investorForm.reset();
      } catch (error: any) {
        this.errorMessage = error.message || 'Registration failed. Please try again.';
        console.error('Registration failed:', error);
      } finally {
        this.loading = false;
      }
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.values(this.investorForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
}
