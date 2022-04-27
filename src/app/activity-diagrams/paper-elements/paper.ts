import { Injectable } from '@angular/core';
import * as joint from 'jointjs';

@Injectable()
export class Paper {
    
  /** Creates new JointJS paper */
  public createNewPaper(paperElement: any, graph: any, width: number, height: number, nameSpace: any): joint.dia.Paper{
      
    // https://resources.jointjs.com/docs/jointjs/v3.5/joint.html#dia.Paper.prototype.options 
    var newPaper = new joint.dia.Paper({
      el: paperElement,
      model: graph,
      width: width,
      height: height,
      gridSize: 10,
      drawGrid: { name: 'mesh', args: { color: 'black' } },
      background: { color: 'white'},
      cellViewNamespace: nameSpace,
      interactive: true, // Element interaction on paper
      linkPinning: false, // Forbids link pinning on paper
      multiLinks: false,
      defaultLink: new joint.shapes.standard.Link({router: {name: 'orthogonal'}}),
      defaultConnector: { name: 'jumpover' },
      defaultConnectionPoint: { name: 'boundary' },
      defaultAnchor: { name: 'perpendicular', args: { padding: 10 } },
      defaultLinkAnchor: { name: 'perpendicular', args: { padding: 10 } },
      defaultRouter: { name: 'orthogonal' },
      validateConnection: function(cellViewS, magnetS, cellViewT, magnetT, end, linkView) {
        // Prevent from linking with it self
        if(cellViewS === cellViewT) {
          return false; 
        }
        //if(cellViewT.model.attributes['type'] === 'standard.Rectangle') return false;
        //return (magnetS !== magnetT);
        return true;
      }
    });

    return newPaper;
  }
}
