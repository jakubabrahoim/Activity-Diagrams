import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiagramPaperComponent } from './diagram-paper/diagram-paper.component';

import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatRow, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
@NgModule ({
    declarations: [DiagramPaperComponent],
    imports: [CommonModule, FormsModule, MatSlideToggleModule, MatButtonModule, MatTableModule, MatFormFieldModule, MatInputModule],
})

export class ActivityDiagramsModule { }