import { MatTableDataSource } from "@angular/material/table";
import { DataSource } from "../paper-elements/data-source";

export function prerequisites(serializedGraph: any, graph: joint.dia.Graph, inputs: MatTableDataSource<DataSource>, outputs: MatTableDataSource<DataSource>, linkLabels: any): string {
    console.log('Running prerequisites...');
    console.log('Serialized graph: ', serializedGraph);
    console.log('Graph: ', graph);
    console.log('Link labels: ', linkLabels);

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
        // (3) - Check if action element has caption
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

            // (3)
            if(serializedGraph.cells[i].attrs.label['text'] == '' || serializedGraph.cells[i].attrs.label['text'] == undefined) {
                return 'Error: Action elements must have a caption.';
            }
        }
        // Check for if elements
        // (1) - If needs to have 3 links -> 1 going in and 2 going out
        // (2) - Check if all outgoing links from if have caption
        // (3) - Check if IF element has caption
        else if (serializedGraph.cells[i]['name'] == 'if') {
            let outgoingLinks = graph.getConnectedLinks(serializedGraph.cells[i], { outbound: true });
            let ingoingLinks = graph.getConnectedLinks(serializedGraph.cells[i], { inbound: true });
            console.log('Outgoing links: ', outgoingLinks);
            console.log('Ingoing links: ', ingoingLinks);
            
            // (1)
            if(links.length != 3) {
                return 'Error: If element must have 3 connections (1 going in and 2 going out).';
            } else {
                if(outgoingLinks.length != 2 && ingoingLinks.length != 1) {
                    return 'Error: If element must have 2 outgoing connections and 1 connection going inwards.';
                }
            }

            // (2)
            for(let j = 0; j < outgoingLinks.length; j++) {
                let linkCaption = linkLabels.find((label: { id: string | number; }) => label.id == outgoingLinks[j].id);

                if(linkCaption == undefined || linkCaption.label == '') {
                    return 'Error: All outgoing links from if element must have a caption.';
                }
            }

            // (3)
            if(serializedGraph.cells[i].attrs.label['text'] == '' || serializedGraph.cells[i].attrs.label['text'] == undefined) {
                return 'Error: If elements must have a caption.';
            }

        }
    }

    return '';
}

export function generateCode(): void {
    
}