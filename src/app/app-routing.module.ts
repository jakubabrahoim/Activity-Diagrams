import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActivityDiagramsModule } from './activity-diagrams/activity-diagrams.module';

const routes: Routes = [
  {path: 'activity', component: ActivityDiagramsModule}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
