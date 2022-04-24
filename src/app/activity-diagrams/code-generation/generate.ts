import { MatTableDataSource } from "@angular/material/table";
import { any } from "lodash";
import { DataSource } from "../paper-elements/data-source";

export function prerequisites(serializedGraph: any, graph: joint.dia.Graph, inputs: MatTableDataSource<DataSource>, outputs: MatTableDataSource<DataSource>): string {
    console.log('Running prerequisites...');
    //console.log('Serialized graph: ', serializedGraph);
    //console.log('Graph: ', graph);

    // Check for start element
    let startElement = serializedGraph.cells.filter((element: { name: string; }) => element.name == 'start');
    if (startElement.length == 0) {
        return 'Error: No start element found';
    } else if (startElement.length > 1) {
        return 'Error: More than one start element found';
    }

    // Check for end element
    let endElement = serializedGraph.cells.filter((element: { name: string; }) => element.name == 'end');
    if (endElement.length == 0) {
        return 'Error: No end element found';
    } else if (endElement.length > 1) {
        return 'Error: More than one end element found';
    }

    // Check if all elements have at least 1 link
    for(let i = 0; i < serializedGraph.cells.length; i++) {
        if(serializedGraph.cells[i].type == 'standard.Link') continue;

        let links = graph.getConnectedLinks(serializedGraph.cells[i]);

        if(links.length == 0) {
            //let caption = serializedGraph.cells[i].attrs.label['text'];
            //return 'Error: Element ' + serializedGraph.cells[i].name + ' with caption "' + caption + '" has no links';
            return 'Error: All elements must have at least one link';
        }
    }

    return '';
}

export function generateCode(): void {
    
}