import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiagramPaperComponent } from './diagram-paper/diagram-paper.component';
import { MenuComponent } from './menu/menu.component';

import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatButtonModule} from '@angular/material/button';

@NgModule ({
    declarations: [DiagramPaperComponent, MenuComponent],
    imports: [CommonModule, MatSlideToggleModule, MatButtonModule]
})

export class ActivityDiagramsModule { }