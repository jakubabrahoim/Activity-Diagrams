import { Injectable } from '@angular/core';
import * as joint from 'jointjs';

@Injectable()
export class StartElement {

    public createStartElement() : joint.shapes.standard.Ellipse {
        var startElement = new joint.shapes.standard.Ellipse({
            position: { x: 100, y: 100 },
            size: { width: 70, height: 70 },
            name: 'start',
            attrs: {
                body: {
                    fill: 'black',
                    magnet: 'passive'
                },
                label: {
                    text: 'Start',
                    fill: 'white'
                }
            }
        });

        return startElement;
    }
}