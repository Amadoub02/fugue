import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{
  isLogin: boolean = false;
  isLoginFormVisible: boolean = true;
  formTitle: string = 'Welcome Back';
  toggleButtonText: string = 'Need an account? Sign up';
  backgroundClass: string = 'background-left';

  constructor(private router:Router) {}
  ngOnInit(){}

  onSubmit(form: any) {
    this.isLogin = true;
    this.router.navigate(['/editor']);
  }

  toggleForm(): void {
    this.isLoginFormVisible = !this.isLoginFormVisible;
    this.backgroundClass = this.isLoginFormVisible ? 'background-left' : 'background-right';
    if(this.isLoginFormVisible) {
      this.formTitle = 'Welcome Back'
      this.toggleButtonText = 'Need an account? Sign up';
    } else {
      this.formTitle = 'Create an Account';
      this.toggleButtonText = 'Already have an account? Sign in'
;    }
  }
}
