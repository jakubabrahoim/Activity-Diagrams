import { MatTableDataSource } from "@angular/material/table";
import { any } from "lodash";
import { DataSource } from "../paper-elements/data-source";

export function prerequisites(graph: any, inputs: MatTableDataSource<DataSource>, outputs: MatTableDataSource<DataSource>): string {
    console.log('Running prerequisites...');
    console.log(graph);

    // Check for start element
    let startElement = graph.cells.filter((element: { name: string; }) => element.name == 'start');
    if (startElement.length == 0) {
        return 'Error: No start element found';
    } else if (startElement.length > 1) {
        return 'Error: More than one start element found';
    }

    return '';
}

export function generateCode(): void {
    
}