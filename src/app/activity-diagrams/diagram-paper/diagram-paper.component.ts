import { Component, OnInit } from '@angular/core';
import * as joint from 'jointjs';
import { Paper } from '../other-classes/paper';

import { ActionElement } from '../other-classes/action';
import { DiamondElement } from '../other-classes/diamond';
import { StartElement } from '../other-classes/start-element';
import { EndElement } from '../other-classes/end-element';


/*
- pridanie portov, spajanie elementov/utvarov
- upravenie textu v elemente/utvare
- toolbox na utvary
*/

@Component({
  selector: 'app-diagram-paper',
  templateUrl: './diagram-paper.component.html',
  styleUrls: ['./diagram-paper.component.css'],
  providers: [Paper, ActionElement],
})
export class DiagramPaperComponent implements OnInit {

  graph: joint.dia.Graph;
  paper: joint.dia.Paper;
  action: ActionElement;
  diamond: DiamondElement;
  start: StartElement;
  end: EndElement;

  constructor(paper: Paper) {
    // pomocne veci
    const namespace = joint.shapes;
    const paperElement: HTMLDivElement = document.createElement('div');
    const paperHeight: number = 700;
    const paperWidth: number = 1200;

    // nastavenie html elementu pre papier
    paperElement.id = 'paper';
    paperElement.style.margin = 'auto';
    paperElement.style.borderStyle = 'solid';
    paperElement.style.borderWidth = '2px';
    paperElement.style.overflow = 'auto';
    document.body.appendChild(paperElement);

    // vytvorenie grafu a papiera
    this.graph = new joint.dia.Graph({}, { cellNamespace: namespace });
    this.paper = paper.createNewPaper(paperElement, this.graph, paperWidth, paperHeight, namespace);
    this.paper.drawGrid();

    this.action = new ActionElement();
    this.diamond = new DiamondElement();
    this.start = new StartElement();
    this.end = new EndElement();
  }

  ngOnInit(): void {
		// Pridanie link eventov
		this.paper.on('link:mouseenter', (linkView) => {
      this.showLinkTools(linkView);
  	});
		this.paper.on('link:mouseleave', (linkView) => {
			linkView.removeTools();
		});
  }

  addActionToGraph(): void {
    let element = this.action.createActionElement();
    element.addTo(this.graph);
  }

  addDiamondToGraph(): void {
    let element = this.diamond.createDiamondElement();
    element.addTo(this.graph);
  }

  addStartToGraph(): void {
    let element = this.start.createStartElement();
    element.addTo(this.graph);
  }

  addEndToGraph(): void {
    let element = this.end.createEndElement();
    element.addTo(this.graph);
  }

  saveDiagram(): void {
    let json = this.graph.toJSON();
    console.log(json);
  }


	// na toto pozriet este nejaku alternativu
  showLinkTools(linkView: any) {
    var tools = new joint.dia.ToolsView({
			tools: [
				new joint.linkTools.Remove({
					distance: '50%',
					markup: [{
						tagName: 'circle',
						selector: 'button',
						attributes: {
							'r': 7,
							'fill': '#f6f6f6',
							'stroke': '#ff5148',
							'stroke-width': 2,
							'cursor': 'pointer'
						}
					}, {
						tagName: 'path',
						selector: 'icon',
						attributes: {
							'd': 'M -3 -3 3 3 M -3 3 3 -3',
							'fill': 'none',
							'stroke': '#ff5148',
							'stroke-width': 2,
							'pointer-events': 'none'
						}
					}]
				})
			]
    });
    linkView.addTools(tools);
}

}