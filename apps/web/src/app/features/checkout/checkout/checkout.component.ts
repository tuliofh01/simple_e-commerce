import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { CartService, CartItem } from '../../../core/services/cart.service';

/**
 * Checkout Component
 * Handles the multi-step checkout process (Shipping -> Payment -> Confirm).
 * Uses Angular Reactive Forms for validation.
 */
@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatStepperModule
  ],
  template: `
    <div class="checkout-container">
      <h2>Checkout</h2>

      <mat-stepper linear #stepper>
        <!-- Step 1: Shipping -->
        <mat-step [stepControl]="shippingForm">
          <form [formGroup]="shippingForm">
            <ng-template matStepLabel>Shipping</ng-template>
            <div class="form-row">
              <mat-form-field>
                <mat-label>First Name</mat-label>
                <input matInput formControlName="firstName">
              </mat-form-field>
              <mat-form-field>
                <mat-label>Last Name</mat-label>
                <input matInput formControlName="lastName">
              </mat-form-field>
            </div>
            <mat-form-field>
              <mat-label>Address</mat-label>
              <input matInput formControlName="address">
            </mat-form-field>
            <mat-form-field>
              <mat-label>City</mat-label>
              <input matInput formControlName="city">
            </mat-form-field>
            <div class="form-row">
              <mat-form-field>
                <mat-label>State</mat-label>
                <input matInput formControlName="state">
              </mat-form-field>
              <mat-form-field>
                <mat-label>ZIP Code</mat-label>
                <input matInput formControlName="zipCode">
              </mat-form-field>
            </div>
            <mat-form-field>
              <mat-label>Phone</mat-label>
              <input matInput formControlName="phone">
            </mat-form-field>
            <button mat-raised-button color="primary" matStepperNext>Continue to Payment</button>
          </form>
        </mat-step>

        <!-- Step 2: Payment -->
        <mat-step [stepControl]="paymentForm">
          <form [formGroup]="paymentForm">
            <ng-template matStepLabel>Payment</ng-template>
            <mat-form-field>
              <mat-label>Card Number</mat-label>
              <input matInput formControlName="cardNumber" placeholder="4242 4242 4242 4242">
            </mat-form-field>
            <div class="form-row">
              <mat-form-field>
                <mat-label>Expiry</mat-label>
                <input matInput formControlName="expiry" placeholder="MM/YY">
              </mat-form-field>
              <mat-form-field>
                <mat-label>CVC</mat-label>
                <input matInput formControlName="cvc">
              </mat-form-field>
            </div>
            <div class="step-actions">
              <button mat-button matStepperPrevious>Back</button>
              <button mat-raised-button color="primary" matStepperNext>Review Order</button>
            </div>
          </form>
        </mat-step>

        <!-- Step 3: Confirm -->
        <mat-step>
          <ng-template matStepLabel>Confirm</ng-template>
          <h3>Order Summary</h3>
          <div class="order-review">
            <div *ngFor="let item of cartItems" class="review-item">
              <span>{{item.name}} x {{item.quantity}}</span>
              <span>\${{item.price * item.quantity}}</span>
            </div>
          </div>
          <div class="total">Total: \${{total}}</div>
          <div class="step-actions">
            <button mat-button matStepperPrevious>Back</button>
            <button mat-raised-button color="primary" (click)="placeOrder()">Place Order</button>
          </div>
        </mat-step>
      </mat-stepper>
    </div>
  `,
  styles: [`
    .checkout-container { padding: 24px; max-width: 800px; margin: 0 auto; }
    form { display: flex; flex-direction: column; gap: 16px; }
    .form-row { display: flex; gap: 16px; }
    .form-row mat-form-field { flex: 1; }
    mat-form-field { width: 100%; }
    .step-actions { display: flex; gap: 16px; margin-top: 16px; }
    .order-review { padding: 16px 0; border-top: 1px solid #eee; border-bottom: 1px solid #eee; }
    .review-item { display: flex; justify-content: space-between; padding: 8px 0; }
    .total { font-size: 20px; font-weight: bold; text-align: right; padding: 16px 0; }
  `]
})
export class CheckoutComponent implements OnInit {
  shippingForm: FormGroup;
  paymentForm: FormGroup;
  cartItems: CartItem[] = [];
  total = 0;

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private router: Router
  ) {
    this.shippingForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', Validators.required],
      phone: ['', Validators.required]
    });

    this.paymentForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.pattern('^[0-9]{16}$')]],
      expiry: ['', Validators.required],
      cvc: ['', [Validators.required, Validators.pattern('^[0-9]{3,4}$')]]
    });
  }

  ngOnInit(): void {
    // Subscribe to cart updates
    this.cartService.cart$.subscribe(cart => {
      this.cartItems = cart.items;
      this.total = cart.totalPrice;
    });
  }

  placeOrder(): void {
    const order = {
      items: this.cartItems.map(item => ({ productId: item.id, quantity: item.quantity })),
      shipping: this.shippingForm.value,
      total: this.total,
      paymentMethod: 'card' // Mock
    };

    // TODO: Call OrderService.createOrder
    console.log('Placing order:', order);

    // Mock success
    this.cartService.clearCart();
    this.router.navigate(['/checkout/confirmation'], { queryParams: { orderId: 'ORD-' + Date.now() } });
  }
}
