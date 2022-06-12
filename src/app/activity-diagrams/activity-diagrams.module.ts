import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';
import { DiagramPaperComponent } from './diagram-paper/diagram-paper.component';

import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatRow, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';

@NgModule ({
    declarations: [DiagramPaperComponent],
    imports: [CommonModule, FormsModule, MatSlideToggleModule, MatButtonModule, MatTableModule, MatFormFieldModule, MatInputModule, 
        MatSliderModule, MatIconModule, MatTooltipModule, MatMenuModule, OverlayModule],
})

export class ActivityDiagramsModule { }