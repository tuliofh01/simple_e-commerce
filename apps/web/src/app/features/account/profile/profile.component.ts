import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  template: `
    <div class="profile-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Profile</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
            <mat-form-field>
              <mat-label>Name</mat-label>
              <input matInput formControlName="name">
            </mat-form-field>
            <mat-form-field>
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email">
            </mat-form-field>
            <mat-form-field>
              <mat-label>Phone</mat-label>
              <input matInput formControlName="phone">
            </mat-form-field>
            <button mat-raised-button color="primary" type="submit" [disabled]="saving">
              {{saving ? 'Saving...' : 'Save Changes'}}
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-header>
          <mat-card-title>Change Password</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
            <mat-form-field>
              <mat-label>Current Password</mat-label>
              <input matInput formControlName="currentPassword" type="password">
            </mat-form-field>
            <mat-form-field>
              <mat-label>New Password</mat-label>
              <input matInput formControlName="newPassword" type="password">
            </mat-form-field>
            <mat-form-field>
              <mat-label>Confirm New Password</mat-label>
              <input matInput formControlName="confirmPassword" type="password">
            </mat-form-field>
            <button mat-raised-button color="primary" type="submit" [disabled]="passwordForm.invalid">
              Update Password
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .profile-container { display: flex; gap: 24px; padding: 24px; max-width: 800px; margin: 0 auto; flex-wrap: wrap; }
    mat-card { flex: 1; min-width: 300px; padding: 16px; }
    form { display: flex; flex-direction: column; gap: 16px; margin-top: 16px; }
    mat-form-field { width: 100%; }
  `]
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  saving = false;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['']
    });
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.authService.getProfile().subscribe(profile => {
      this.profileForm.patchValue(profile);
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    this.saving = true;
    this.authService.updateProfile(this.profileForm.value).subscribe({
      next: () => { this.saving = false; /* TODO: Show success */ },
      error: () => this.saving = false
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;
    const { newPassword } = this.passwordForm.value;
    this.authService.changePassword(newPassword).subscribe({
      next: () => { this.passwordForm.reset(); /* TODO: Show success */ },
      error: () => { /* TODO: Handle error */ }
    });
  }
}
