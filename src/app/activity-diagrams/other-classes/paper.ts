import { Injectable } from '@angular/core';
import * as joint from 'jointjs';

@Injectable()
export class Paper {
    
  // funckia, ktora vytvara novy 'papier' s parametrami
  public createNewPaper(paperElement: any, graph: any, width: number, height: number, nameSpace: any): joint.dia.Paper{
      
    // vysvetlenie parametrov https://resources.jointjs.com/docs/jointjs/v3.5/joint.html#dia.Paper.prototype.options 
    var newPaper = new joint.dia.Paper({
      el: paperElement,
      model: graph,
      width: width,
      height: height,
      gridSize: 10,
      drawGrid: { name: 'mesh', args: { color: 'black' } },
      cellViewNamespace: nameSpace,
      interactive: true, // povoluje interakciu medzi elementami
      linkPinning: false, // zakaze pouzivatelovi pinnut link na papier
      multiLinks: false,
      defaultLink: new joint.shapes.standard.Link(),
      defaultConnector: { name: 'rounded' },
      defaultConnectionPoint: { name: 'boundary' },
      defaultAnchor: { name: 'perpendicular', args: { padding: 10 } },
      defaultLinkAnchor: { name: 'perpendicular', args: { padding: 10 } },
      defaultRouter: { name: 'normal' }
    });

    return newPaper;
  }
}
