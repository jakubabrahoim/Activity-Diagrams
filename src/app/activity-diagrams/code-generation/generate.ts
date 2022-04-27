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
            return 'Error: All elements must have at least one link.';
        }
        
        // Check for action elements
        // (1) - If action has more than 2 links -> error
        // (2) - If action has 2 links -> check if one is in and one is out
        // (3) - If action has 1 link -> no need to check
        if(serializedGraph.cells[i]['name'] == 'action') {
            // (1)
            if(links.length > 2) { 
                return 'Error: Actions can have at most 2 links.';
            } 
            // (2)
            else if (links.length == 2) { 
                let inLink = false;
                let outLink = false;
                for(let j = 0; j < links.length; j++) {
                    if(links[j].attributes['source'].id == serializedGraph.cells[i].id) {
                        outLink = true;
                    } else if (links[j].attributes['target'].id == serializedGraph.cells[i].id) {
                        inLink = true;
                    }
                }
                if(inLink == false || outLink == false) {
                    return 'Error: Action can have only 1 connection going in and only 1 connection going out.';
                }
            }
        }
        // Check for if elements
        // (1) - If needs to have 3 links -> 1 going in and 2 going out
        else if (serializedGraph.cells[i]['name'] == 'if') {
            // (1)
            console.log(links);
            if(links.length != 3) {
                return 'Error: If element must have 3 connections (1 going in and 2 going out).';
            } else {
                let inLink = false;
                let outLink = 0;
                for(let j = 0; j < links.length; j++) {
                    if(links[j].attributes['source'].id == serializedGraph.cells[i].id) {
                        //inLink = true;
                        outLink++;
                    } else if (links[j].attributes['target'].id == serializedGraph.cells[i].id) {
                        //outLink++;
                        inLink = true;
                    }
                }

            }
        }
    }

    return '';
}

export function generateCode(): void {
    
}