import { Injectable } from '@angular/core';
import * as joint from 'jointjs';

@Injectable()
export class StartElement {

    public createStartElement() : joint.shapes.uml.StartState {
        var startElement = new joint.shapes.uml.StartState({
            position: { x: 100, y: 100 },
            size: { width: 30, height: 30 },
            attrs: {
                'circle': {
                    fill: '#4b4a67',
                    stroke: 'none'
                }
            }
        });

        return startElement;
    }
}