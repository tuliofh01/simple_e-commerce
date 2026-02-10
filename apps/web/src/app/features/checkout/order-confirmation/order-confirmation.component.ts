import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirmation-container">
      <mat-card>
        <mat-card-content>
          <div class="success-icon">
            <mat-icon>check_circle</mat-icon>
          </div>
          <h1>Order Confirmed!</h1>
          <p class="order-number">Order #{{orderId}}</p>
          <p>Thank you for your purchase. You will receive a confirmation email shortly.</p>
          <div class="next-steps">
            <h3>What's Next?</h3>
            <ul>
              <li>Confirmation email sent to your inbox</li>
              <li>Order processing within 1-2 business days</li>
              <li>Shipping notification with tracking number</li>
            </ul>
          </div>
          <div class="actions">
            <button mat-raised-button color="primary" routerLink="/account/orders">View Orders</button>
            <button mat-stroked-button routerLink="/shop">Continue Shopping</button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .confirmation-container { display: flex; justify-content: center; align-items: center; min-height: 80vh; padding: 24px; }
    mat-card { width: 100%; max-width: 500px; text-align: center; padding: 32px; }
    .success-icon mat-icon { font-size: 72px; width: 72px; height: 72px; color: #4caf50; }
    h1 { margin: 16px 0 8px; }
    .order-number { font-size: 18px; color: #666; margin-bottom: 24px; }
    .next-steps { text-align: left; background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 24px 0; }
    .next-steps h3 { margin-top: 0; }
    .next-steps ul { margin: 0; padding-left: 20px; }
    .next-steps li { margin: 8px 0; color: #666; }
    .actions { display: flex; gap: 16px; justify-content: center; margin-top: 24px; }
  `]
})
export class OrderConfirmationComponent implements OnInit {
  orderId = '';

  constructor(private route: ActivatedRoute, private orderService: OrderService) {}

  ngOnInit(): void {
    this.orderId = this.route.snapshot.queryParamMap.get('orderId') || '';
  }
}
