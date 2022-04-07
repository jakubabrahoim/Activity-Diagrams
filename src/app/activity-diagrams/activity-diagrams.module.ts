import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiagramPaperComponent } from './diagram-paper/diagram-paper.component';
import { MenuComponent } from './menu/menu.component';

import {MatSlideToggleModule} from '@angular/material/slide-toggle';

@NgModule ({
    declarations: [DiagramPaperComponent, MenuComponent],
    imports: [CommonModule, MatSlideToggleModule]
})

export class ActivityDiagramsModule { }