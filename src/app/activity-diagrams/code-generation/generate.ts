import { MatTableDataSource } from "@angular/material/table";
import { any } from "lodash";
import { DataSource } from "../paper-elements/data-source";

export function prerequisites(serializedGraph: any, graph: joint.dia.Graph, inputs: MatTableDataSource<DataSource>, outputs: MatTableDataSource<DataSource>): string {
    console.log('Running prerequisites...');
    console.log('Serialized graph: ', serializedGraph);
    //console.log('Graph: ', graph);

    // Check for start element
    let startElement = serializedGraph.cells.filter((element: { name: string; }) => element.name == 'start');
    if (startElement.length == 0) {
        return 'Error: No start element found.';
    } else if (startElement.length > 1) {
        return 'Error: More than one start element found.';
    }

    // Check for end element
    let endElement = serializedGraph.cells.filter((element: { name: string; }) => element.name == 'end');
    if (endElement.length == 0) {
        return 'Error: No end element found.';
    } else if (endElement.length > 1) {
        return 'Error: More than one end element found.';
    }

    // Check for all elements
    for(let i = 0; i < serializedGraph.cells.length; i++) {
        if(serializedGraph.cells[i].type == 'standard.Link') continue;

        let links = graph.getConnectedLinks(serializedGraph.cells[i]);

        // Check if element has at least 1 link
        if(links.length == 0) {
            //let caption = serializedGraph.cells[i].attrs.label['text'];
            //return 'Error: Element ' + serializedGraph.cells[i].name + ' with caption "' + caption + '" has no links';
            return 'Error: All elements must have at least one link.';
        }
        
        if(serializedGraph.cells[i]['name'] == 'action') {
            console.log('Action links:');
            console.log(links);
            
            // (1) - If action has more than 2 links -> error
            // (2) - If action has 2 links -> check if one is in and one is out
            // (3) - If action has 1 link -> no need to check
            // Current action cant have 0 links in this scope

            if(links.length > 2) { // (1)
                return 'Error: Actions can have at most 2 links.';
            } else if (links.length == 2) { // (2)
                let inLink = false;
                let outLink = false;
                for(let j = 0; j < links.length; j++) {
                    if(links[j].attributes['source'].id == serializedGraph.cells[i].id) {
                        inLink = true;
                    } else if (links[j].attributes['target'].id == serializedGraph.cells[i].id) {
                        outLink = true;
                    }
                }
                if(inLink == false || outLink == false) {
                    return 'Error: Action can have only 1 connection going in and only 1 connection going out.';
                }
            }
        }
    }

    return '';
}

export function generateCode(): void {
    
}