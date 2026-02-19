import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DataProductCatalogComponent } from './data-product-catalog.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,DataProductCatalogComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('dataproducts');

}
/*
import { DataProductCatalogComponent } from './data-product-catalog';

@Component({
  imports: [DataProductCatalogComponent],
  template: `<app-data-product-catalog />`,
})
*/