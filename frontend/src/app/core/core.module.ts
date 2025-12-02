// app/core/core.module.ts
import { NgModule } from '@angular/core';
import { StateService } from '@services';

@NgModule({
  providers: [
    StateService,
    // otros servicios globales
  ],
})
export class Core {}
