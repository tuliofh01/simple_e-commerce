import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatSlideToggleModule, MatButtonModule],
  template: `
    <div class="settings-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Notification Settings</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="setting-item">
            <div class="setting-info">
              <h3>Email Notifications</h3>
              <p>Receive order updates and promotions via email</p>
            </div>
            <mat-slide-toggle [checked]="emailNotifications" (change)="emailNotifications = $event.checked">
            </mat-slide-toggle>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <h3>Order Status Updates</h3>
              <p>Get notified when your order status changes</p>
            </div>
            <mat-slide-toggle [checked]="orderUpdates" (change)="orderUpdates = $event.checked">
            </mat-slide-toggle>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <h3>Marketing Emails</h3>
              <p>Receive news about products and special offers</p>
            </div>
            <mat-slide-toggle [checked]="marketingEmails" (change)="marketingEmails = $event.checked">
            </mat-slide-toggle>
          </div>
          <button mat-raised-button color="primary" (click)="saveSettings()">Save Settings</button>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-header>
          <mat-card-title>Privacy</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="setting-item">
            <div class="setting-info">
              <h3>Two-Factor Authentication</h3>
              <p>Add an extra layer of security to your account</p>
            </div>
            <button mat-stroked-button>Enable 2FA</button>
          </div>
          <button mat-stroked-button color="warn">Delete Account</button>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .settings-container { display: flex; gap: 24px; padding: 24px; max-width: 800px; margin: 0 auto; flex-wrap: wrap; }
    mat-card { flex: 1; min-width: 300px; }
    .setting-item { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 1px solid #eee; }
    .setting-item:last-of-type { border-bottom: none; }
    .setting-info h3 { margin: 0 0 4px; }
    .setting-info p { margin: 0; color: #666; font-size: 14px; }
    button { margin-top: 16px; }
  `]
})
export class SettingsComponent {
  emailNotifications = true;
  orderUpdates = true;
  marketingEmails = false;

  saveSettings(): void {
    // TODO: Save to API
  }
}
