import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // Import FormsModule

@NgModule({
  declarations: [],
  imports: [CommonModule, HttpClientModule, FormsModule],
  exports: [CommonModule, HttpClientModule, FormsModule],
})
export class SharedModule {}