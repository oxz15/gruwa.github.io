import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ShiftBlockComponent} from './shift-block/shift-block.component';
import {MaterialsModule} from './materials/materials.module';
import {PageNotFoundComponent} from './not-found/not-found.component';
import {HeaderShiftsComponent} from './header-shifts/header-shifts.component';
import {SpinnerComponent} from './spinner/spinner.component';
import {SmallSpinnerComponent} from './small-spinner/small-spinner.component';
import {ListFieldsComponent} from './list-fields/list-fields.component';
import {PipeModule} from '../pipes/pipe.module';
import {ReactiveFormsModule} from '@angular/forms';
import {FormInputComponent} from './app-foms/form-input/form-input.component';
import {FormDateComponent} from './app-foms/form-date/form-date.component';
import { FormSelectComponent } from './app-foms/form-select/form-select.component';
import { FormTimeComponent } from './app-foms/form-time/form-time.component';

@NgModule({
  imports: [
    CommonModule,
    MaterialsModule,
    PipeModule.forRoot(),
    ReactiveFormsModule
  ],
  declarations: [
    ShiftBlockComponent,
    PageNotFoundComponent,
    HeaderShiftsComponent,
    SpinnerComponent,
    SmallSpinnerComponent,
    ListFieldsComponent,
    FormInputComponent,
    FormDateComponent,
    FormSelectComponent,
    FormTimeComponent
  ],
  exports: [
    ShiftBlockComponent,
    PageNotFoundComponent,
    HeaderShiftsComponent,
    SpinnerComponent,
    SmallSpinnerComponent,
    ListFieldsComponent,
    FormInputComponent,
    FormDateComponent,
    FormSelectComponent,
    FormTimeComponent
  ]
})
export class AppComponentsModule {
}
