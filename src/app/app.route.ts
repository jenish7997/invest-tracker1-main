import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AdminComponent } from './components/admin/admin.component';
import { AuthGuard } from './guards/auth.guard';
import { BalancesComponent } from './components/balances/balances.component';
import { TransactionsComponent } from './components/transactions/transactions.component';
import { AddmoneyComponent } from './components/addmoney/addmoney.component';
import { WithdrawComponent } from './components/withdraw/withdraw.component';
import { InterestComponent } from './components/interest/interest.component';
import { AddInvestorComponent } from './components/add-investor/add-investor.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminComponent, canActivate: [AuthGuard] },
  { path: 'balances', component: BalancesComponent },
  { path: 'transactions', component: TransactionsComponent },
  { path: 'add-money', component: AddmoneyComponent },
  { path: 'withdraw', component: WithdrawComponent },
  { path: 'interest', component: InterestComponent },
  { path: 'add-investor', component: AddInvestorComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
