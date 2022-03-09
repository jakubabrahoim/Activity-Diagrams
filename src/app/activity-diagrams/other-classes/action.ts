import { Injectable } from '@angular/core';
import * as joint from 'jointjs';

@Injectable()
export class ActionElement {

    public createActionElement() : joint.shapes.standard.Rectangle {
        var actionElement = new joint.shapes.standard.Rectangle({
            position: { x: 100, y: 100 },
            size: { width: 50, height: 50 },
            attrs: { text: { text:  'test action' }}
        });

        return actionElement;
    }
}