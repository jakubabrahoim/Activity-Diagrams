import { Injectable } from '@angular/core';
import * as joint from 'jointjs';

@Injectable()
export class StartElement {

    public createStartElement() : joint.shapes.uml.StartState {
        var startElement = new joint.shapes.uml.StartState({
            position: { x: 100, y: 100 },
            size: { width: 40, height: 40 },
            attrs: {
                'circle': {
                    fill: 'black',
                    stroke: 'none'
                }
            }
        });

        return startElement;
    }
}