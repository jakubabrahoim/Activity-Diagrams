import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiagramPaperComponent } from './diagram-paper/diagram-paper.component';
import { MenuComponent } from './menu/menu.component';



@NgModule ({
    declarations: [DiagramPaperComponent, MenuComponent],
    imports: [CommonModule]
})

export class ActivityDiagramsModule { }