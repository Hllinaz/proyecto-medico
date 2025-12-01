// components/loading/loading.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '@services';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="loading$ | async" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Cargando...</p>
      </div>
    </div>
  `,
  styles: [
    `
      .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
      }

      .loading-spinner {
        background: white;
        padding: 30px;
        border-radius: 8px;
        text-align: center;
      }

      .spinner {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3498db;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
        margin: 0 auto 15px;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class LoadingComponent {
  private loadingService = inject(LoadingService);

  // Esto funciona porque el constructor implícito de Angular
  // ya ha inyectado el servicio antes de que esta propiedad se evalúe
  loading$ = this.loadingService.loading$;
}
