// Responsive Directive - Automated responsive design
import { Directive, Input, ElementRef, Renderer2, OnInit, OnDestroy, Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface ResponsiveConfig {
  xs?: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  xxl?: string;
}

@Directive({
  selector: '[appResponsive]'
})
export class ResponsiveDirective implements OnInit, OnDestroy {
  @Input() appResponsive?: ResponsiveConfig;
  @Input() responsiveClasses?: ResponsiveConfig;
  @Input() responsiveStyles?: { [key: string]: ResponsiveConfig };
  
  private destroy$ = new Subject<void>();

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit(): void {
    this.breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
      Breakpoints.Medium,
      Breakpoints.Large,
      Breakpoints.XLarge
    ]).pipe(takeUntil(this.destroy$)).subscribe(result => {
      this.updateResponsiveState(result.breakpoints);
    });
  }

  private updateResponsiveState(breakpoints: { [key: string]: boolean }): void {
    // Update classes based on breakpoint
    if (breakpoints[Breakpoints.XSmall] && this.responsiveClasses?.xs) {
      this.addClasses(this.responsiveClasses.xs);
    }
    if (breakpoints[Breakpoints.Small] && this.responsiveClasses?.sm) {
      this.addClasses(this.responsiveClasses.sm);
    }
    if (breakpoints[Breakpoints.Medium] && this.responsiveClasses?.md) {
      this.addClasses(this.responsiveClasses.md);
    }
    if (breakpoints[Breakpoints.Large] && this.responsiveClasses?.lg) {
      this.addClasses(this.responsiveClasses.lg);
    }
    if (breakpoints[Breakpoints.XLarge] && this.responsiveClasses?.xl) {
      this.addClasses(this.responsiveClasses.xl);
    }

    // Update styles based on breakpoint
    this.updateStyles(breakpoints);
  }

  private addClasses(classes: string): void {
    classes.split(' ').forEach(cls => {
      this.renderer.addClass(this.el.nativeElement, cls);
    });
  }

  private updateStyles(breakpoints: { [key: string]: boolean }): void {
    if (!this.responsiveStyles) return;

    Object.keys(this.responsiveStyles).forEach(styleProp => {
      const breakpointConfig = this.responsiveStyles[styleProp];
      
      if (breakpoints[Breakpoints.XSmall] && breakpointConfig.xs) {
        this.renderer.setStyle(this.el.nativeElement, styleProp, breakpointConfig.xs);
      }
      if (breakpoints[Breakpoints.Small] && breakpointConfig.sm) {
        this.renderer.setStyle(this.el.nativeElement, styleProp, breakpointConfig.sm);
      }
      if (breakpoints[Breakpoints.Medium] && breakpointConfig.md) {
        this.renderer.setStyle(this.el.nativeElement, styleProp, breakpointConfig.md);
      }
      if (breakpoints[Breakpoints.Large] && breakpointConfig.lg) {
        this.renderer.setStyle(this.el.nativeElement, styleProp, breakpointConfig.lg);
      }
      if (breakpoints[Breakpoints.XLarge] && breakpointConfig.xxl) {
        this.renderer.setStyle(this.el.nativeElement, styleProp, breakpointConfig.xxl);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}