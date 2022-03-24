import { Injectable } from '@angular/core';
import * as joint from 'jointjs';
import { ElementPort } from './port';

@Injectable()
export class ActionElement {

    public createActionElement() : joint.shapes.standard.Rectangle {
        var actionElement = new joint.shapes.standard.Rectangle({
            position: { x: 200, y: 100 },
            size: { width: 200, height: 100 },
            attrs: { text: { text:  'test action' }, body: {rx: 10, ry: 10} } 
        });

        var elementPort = new ElementPort();

        // -8, -8 - left port
        var port = elementPort.createPort(-8, -8);
        actionElement.addPort(port);
        //
        port = elementPort.createPort(8, -8);

        return actionElement;
    }
}