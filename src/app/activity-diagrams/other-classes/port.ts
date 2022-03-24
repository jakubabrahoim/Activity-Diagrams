import { Injectable } from '@angular/core';
import * as joint from 'jointjs';

@Injectable()
export class ElementPort {

    public createPort(x: number, y: number) : any {
        
        var port = {
            label: {
                position: {
                    name: 'left'
                },
                markup: [{
                    tagName: 'text',
                    selector: 'label'
                }]
            },
            attrs: { 
                portBody: { 
                    magnet: true,
                    width: 80,
                    height: 8,
                    x: 0,
                    y: 0,
                    r: 10,
                    fill:  '#03071E'
                }, 
            },
            markup: [{
                tagName: 'circle',
                selector: 'portBody'
            }]
        };

        return port;
    }
}