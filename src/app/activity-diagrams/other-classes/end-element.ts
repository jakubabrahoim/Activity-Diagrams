import { Injectable } from '@angular/core';
import * as joint from 'jointjs';

@Injectable()
export class EndElement {

    public createEndElement() : joint.shapes.uml.EndState {
        var endElement = new joint.shapes.uml.EndState({
            position: { x: 150, y: 100 },
            size: { width: 40, height: 40 },
            attrs: {
                'circle.outer': {
                    stroke: 'black',
                    "stroke-width": 2
                },
                'circle.inner': {
                    fill: 'black',
                    stroke: 'none'
                }
            }
        });

        return endElement;
    }
}