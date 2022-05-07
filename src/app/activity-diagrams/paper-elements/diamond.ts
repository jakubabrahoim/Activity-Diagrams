import { Injectable } from '@angular/core';
import * as joint from 'jointjs';

@Injectable()
export class DiamondElement {
    public createDiamondElement(name: string, color: string) : joint.shapes.standard.Polygon {
        var diamondElement = new joint.shapes.standard.Polygon({
            position: { x: 100, y: 200 },
            size: { width: 100, height: 100 },
            name: name,
            attrs: { text: { text:  '' }, body: { transform: 'rotate(45, 50, 50)', stroke: color}},
            
        });

        return diamondElement;
    }
}