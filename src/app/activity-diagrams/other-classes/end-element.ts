import { Injectable } from '@angular/core';
import * as joint from 'jointjs';

@Injectable()
export class EndElement {

    public createEndElement() : joint.shapes.uml.EndState {
        var endElement = new joint.shapes.uml.EndState({
            position: { x: 150, y: 100 },
            size: { width: 30, height: 30 },
            attrs: {
                'circle.outer': {
                    stroke: '#4b4a67',
                    "stroke-width": 2
                },
                'circle.inner': {
                    fill: '#4b4a67',
                    stroke: 'none'
                }
            }
        });

        return endElement;
    }
}