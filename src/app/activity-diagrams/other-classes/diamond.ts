import { Injectable } from '@angular/core';
import * as joint from 'jointjs';

@Injectable()
export class DiamondElement {

    // rectangle atributes ? ->
    public createDiamondElement() : joint.shapes.standard.Polygon {
        var diamondElement = new joint.shapes.standard.Polygon({
            position: { x: 100, y: 100 },
            size: { width: 50, height: 50 },
            attrs: { text: { text:  'test action' }}
        });

        return diamondElement;
    }
}