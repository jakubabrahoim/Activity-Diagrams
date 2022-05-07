import { Injectable } from '@angular/core';
import * as joint from 'jointjs';

@Injectable()
export class EndElement {
    public createEndElement() : joint.shapes.standard.Ellipse {
        var endElement = new joint.shapes.standard.Ellipse({
            position: { x: 150, y: 100 },
            size: { width: 70, height: 70 },
            name: 'end',
            attrs: {
                body: {
                    fill: 'black',
                    magnet: 'passive'
                },
                label: {
                    text: 'End',
                    fill: 'white'
                }
            }
        });

        return endElement;
    }
}