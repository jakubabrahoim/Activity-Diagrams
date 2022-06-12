import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActivityDiagramsModule } from './activity-diagrams/activity-diagrams.module';
import { DiagramPaperComponent } from './activity-diagrams/diagram-paper/diagram-paper.component';

const routes: Routes = [
  {path: '', component: DiagramPaperComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
