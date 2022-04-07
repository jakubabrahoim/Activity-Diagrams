import { Injectable } from '@angular/core';
import * as joint from 'jointjs';

@Injectable()
export class DiamondElement {

    // rectangle atributes ? ->
    public createDiamondElement(name: string) : joint.shapes.standard.Polygon {
        var diamondElement = new joint.shapes.standard.Polygon({
            position: { x: 100, y: 200 },
            size: { width: 100, height: 100 },
            name: name,
            attrs: { text: { text:  'test diamond' }, body: { transform: 'rotate(45, 50, 50)' }},
            
        });

        return diamondElement;
    }
}