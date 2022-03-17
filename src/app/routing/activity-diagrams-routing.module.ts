import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MenuComponent } from "../activity-diagrams/menu/menu.component";

const routes: Routes = [
    {
        path: "", children: [
            { path: "", component: MenuComponent }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class ActivityDiagramsRoutingModule { }