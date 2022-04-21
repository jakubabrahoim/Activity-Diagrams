import { Injectable } from '@angular/core';
import * as joint from 'jointjs';
@Injectable()
export class ActionElement {

    public createActionElement() : joint.shapes.standard.Rectangle {
        var actionElement = new joint.shapes.standard.Rectangle({
            position: { x: 200, y: 100 },
            size: { width: 200, height: 100 },
            name: 'action',
            attrs: { text: { text:  'test action' }, body: {rx: 10, ry: 10} } 
        });
        
        return actionElement;
    }
}