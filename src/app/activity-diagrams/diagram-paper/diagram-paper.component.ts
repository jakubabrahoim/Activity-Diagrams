import { Component, OnInit } from '@angular/core';
import * as joint from 'jointjs';
import { Paper } from '../other-classes/paper';

import { ActionElement } from '../other-classes/action';
import { DiamondElement } from '../other-classes/diamond';
import { StartElement } from '../other-classes/start-element';
import { EndElement } from '../other-classes/end-element';

@Component({
  selector: 'app-diagram-paper',
  templateUrl: './diagram-paper.component.html',
  styleUrls: ['./diagram-paper.component.css'],
  providers: [Paper, ActionElement],
})
export class DiagramPaperComponent implements OnInit {

  graph: joint.dia.Graph;
  paper: joint.dia.Paper;

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

    // vytvorenie grafu
    this.graph = new joint.dia.Graph({}, { cellNamespace: namespace });
    this.paper = paper.createNewPaper(paperElement, this.graph, paperWidth, paperHeight, namespace);
    this.paper.drawGrid();
  }

  ngOnInit(): void {
    var action : ActionElement = new ActionElement();
    var diamond : DiamondElement = new DiamondElement();
    var start : StartElement = new StartElement();
    var end : EndElement = new EndElement();

    var el1 = action.createActionElement();
    var el2 = diamond.createDiamondElement();
    var el3 = start.createStartElement();
    var el4 = end.createEndElement();

    el1.addTo(this.graph);
    el2.addTo(this.graph);
    el3.addTo(this.graph);
    el4.addTo(this.graph);
  }
}
