import {Component, OnInit, OnDestroy} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

import {Subscription} from 'rxjs';

import {Product} from '../product';
import {ProductService} from '../product.service';
import {GenericValidator} from '../../shared/generic-validator';
import {NumberValidators} from '../../shared/number.validator';
import {select, Store} from '@ngrx/store';
import * as fromProduct from '../state/product.reducer';
import * as fromAction from '../state/product.action';
import {takeWhile} from 'rxjs/operators';
import {State} from '../interfaces/product.interface';

@Component({
  selector: 'pm-product-edit',
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.css']
})
export class ProductEditComponent implements OnInit, OnDestroy {
  pageTitle = 'Product Edit';
  errorMessage = '';
  productForm: FormGroup;
  componentActive = true;

  product: Product | null;
  sub: Subscription;

  // Use with the generic validation message class
  displayMessage: { [key: string]: string } = {};
  private validationMessages: { [key: string]: { [key: string]: string } };
  private genericValidator: GenericValidator;

  constructor(private fb: FormBuilder,
              private productService: ProductService,
              private store: Store<State>) {

    // Defines all of the validation messages for the form.
    // These could instead be retrieved from a file or database.
    this.validationMessages = {
      productName: {
        required: 'Product name is required.',
        minlength: 'Product name must be at least three characters.',
        maxlength: 'Product name cannot exceed 50 characters.'
      },
      productCode: {
        required: 'Product code is required.'
      },
      starRating: {
        range: 'Rate the product between 1 (lowest) and 5 (highest).'
      }
    };

    // Define an instance of the validator for use with this form,
    // passing in this form's set of validation messages.
    this.genericValidator = new GenericValidator(this.validationMessages);
  }

  ngOnInit(): void {
    // Define the form group
    this.productForm = this.fb.group({
      productName: ['', [Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50)]],
      productCode: ['', Validators.required],
      starRating: ['', NumberValidators.range(1, 5)],
      description: ''
    });

    // Watch for changes to the currently selected product
    this.store
      .pipe(
        select(
          fromProduct.getCurrentProduct
        ),
        takeWhile(() => this.componentActive),
      )
      .subscribe(
        selectedProduct => this.displayProduct(selectedProduct)
      );

    // Watch for value changes
    this.productForm.valueChanges
      .pipe(
        takeWhile(() => this.componentActive),
      )
      .subscribe(
        value => this.displayMessage = this.genericValidator.processMessages(this.productForm)
      );
  }

  ngOnDestroy(): void {
    this.componentActive = false;
  }

  // Also validate on blur
  // Helpful if the user tabs through required fields
  blur(): void {
    this.displayMessage = this.genericValidator.processMessages(this.productForm);
  }

  displayProduct(product: Product | null): void {
    // Set the local product property
    this.product = product;

    if (this.product) {
      // Reset the form back to pristine
      this.productForm.reset();

      // Display the appropriate page title
      if (this.product.id === 0) {
        this.pageTitle = 'Add Product';
      } else {
        this.pageTitle = `Edit Product: ${this.product.productName}`;
      }

      // Update the data on the form
      this.productForm.patchValue({
        productName: this.product.productName,
        productCode: this.product.productCode,
        starRating: this.product.starRating,
        description: this.product.description
      });
    }
  }

  cancelEdit(): void {
    // Redisplay the currently selected product
    // replacing any edits made
    this.displayProduct(this.product);
  }

  deleteProduct(): void {
    if (this.product && this.product.id) {
      if (confirm(`Really delete the product: ${this.product.productName}?`)) {
        // this.productService.deleteProduct(this.product.id)
        //   .pipe(
        //     takeWhile(() => this.componentActive)
        //   )
        //   .subscribe(
        //     () => this.store.dispatch(new fromAction.ClearCurrentProduct()),
        //     (err: any) => this.errorMessage = err.error
        //   );

        this.store.dispatch(new fromAction.DeleteProduct(this.product));
      }
    } else {
      // No need to delete, it was never saved
      this.store.dispatch(new fromAction.ClearCurrentProduct());
    }
  }

  saveProduct(): void {
    if (this.productForm.valid) {
      if (this.productForm.dirty) {
        // Copy over all of the original product properties
        // Then copy over the values from the form
        // This ensures values not on the form, such as the Id, are retained
        const p = {...this.product, ...this.productForm.value};
        console.log(p);
        if (p.id === 0) {
          // this.productService.createProduct(p)
          //   .pipe(
          //     takeWhile(() => this.componentActive)
          //   )
          //   .subscribe(
          //   product => this.store.dispatch(new fromAction.SetCurrentProduct(product)),
          //   (err: any) => this.errorMessage = err.error
          // );

          this.store.dispatch(new fromAction.SaveProduct(p));
        } else {
          this.store.dispatch(new fromAction.UpdateProduct(p));
        }
      }
    } else {
      this.errorMessage = 'Please correct the validation errors.';
    }
  }

}
