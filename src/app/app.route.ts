
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { TransactionsComponent } from './components/transactions/transactions.component';
import { InterestComponent } from './components/interest/interest.component';
import { BalancesComponent } from './components/balances/balances.component';
import { AddInvestorComponent } from './components/add-investor/add-investor.component';
import { WithdrawComponent } from './components/withdraw/withdraw.component';
import { AddmoneyComponent } from './components/addmoney/addmoney.component';
import { AdminComponent } from './components/admin/admin.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';

export const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '', redirectTo: '/transactions', pathMatch: 'full' },
  { path: 'transactions', component: TransactionsComponent, canActivate: [authGuard] },
  { path: 'interest-rates', component: InterestComponent, canActivate: [authGuard] },
  { path: 'report', component: BalancesComponent, canActivate: [authGuard] },
  { path: 'add-investor', component: AddInvestorComponent, canActivate: [authGuard] },
  { path: 'withdraw', component: WithdrawComponent, canActivate: [authGuard] },
  { path: 'add-money', component: AddmoneyComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '/login' }
];
