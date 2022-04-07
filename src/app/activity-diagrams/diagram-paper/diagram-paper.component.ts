import { Component, OnInit, Output, EventEmitter } from '@angular/core';
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
  providers: [Paper], // tu daval aj provider na svoj element 
})
export class DiagramPaperComponent implements OnInit {

  // Graph, paper and element variables
  graph: joint.dia.Graph;
  paper: joint.dia.Paper;
  action: ActionElement;
  diamond: DiamondElement;
  start: StartElement;
  end: EndElement;

  // V activePaper<> je vzdy elemenet, na ktory klikol uzivatel
  activePaperElement: any = null;
  activePaperLink: any = null;
  toolsView: any;
  elementToolsView: any;

  // Event emitters
  @Output() currentElementName: EventEmitter<String> = new EventEmitter<String>();

  elementIds: Array<number> = [1000];

  drawingMode: boolean = false;
  toggleCaption: string;

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

    // vytvorenie tools view
    // vertices - na zmenu tvaru spojenia, boundary - ohranicenie prepojenia, remove - odstranenie prepojenia
    let verticesTool: joint.linkTools.Vertices = new joint.linkTools.Vertices();
    let boundaryTool: joint.linkTools.Boundary = new joint.linkTools.Boundary();
    let removeTool: joint.linkTools.Remove = new joint.linkTools.Remove();
    this.toolsView = new joint.dia.ToolsView({tools: [verticesTool, boundaryTool, removeTool]});
    this.elementToolsView = new joint.dia.ToolsView({tools: [boundaryTool, removeTool]});

    this.elementIds.fill(0);

    this.toggleCaption = 'Moving mode';
  }

  ngOnInit(): void {
    this.addActionListeners();
  }

  ngOnDestroy(): void {
    this.paper.remove();
    this.graph.clear();
  }

  addActionListeners(): void {
    this.paper.on('element:mouseenter', (elementView: any) => {
      elementView.removeTools();
      elementView.addTools(this.elementToolsView);
      elementView.showTools(this.elementToolsView);
    });

    this.paper.on('element:mouseleave', (elementView: any) => {
      elementView.hideTools();
    });
    
    // Zobrazenie context menu pre element
    this.paper.on('element:element-contextmenu', (elementView, _evt, x, y) => {
      let elementContextMenu: HTMLElement = document.getElementById('element-context-menu')!;
      let linkContextMenu: HTMLElement = document.getElementById('link-context-menu')!;

      this.activePaperElement = elementView.model;
      elementContextMenu.style.left = x + 70 + 'px';
      elementContextMenu.style.top = y + 75 + 'px';
      elementContextMenu.style.display = 'block';
      
      linkContextMenu.style.display = 'none';
    });

    // Zobrazenie context menu pre prepojenie
    this.paper.on('element:link-contextmenu', (linkView, _evt, x, y) => {
      let elementContextMenu: HTMLElement = document.getElementById('element-context-menu')!;
      let linkContextMenu: HTMLElement = document.getElementById('link-context-menu')!;

      this.activePaperLink = linkView.model;
      linkContextMenu.style.left = x + 70 + 'px';
      linkContextMenu.style.top = y + 75 + 'px';
      linkContextMenu.style.display = 'block';

      elementContextMenu.style.display = 'none';
    });

    // Schovanie obidvoch context menu
    this.paper.on('blank:pointerclick', () => {
      let elementContextMenu: HTMLElement = document.getElementById('element-context-menu')!;
      let linkContextMenu: HTMLElement = document.getElementById('link-context-menu')!;

      elementContextMenu.style.display = 'none';
      linkContextMenu.style.display = 'none';
    });

    // Zobrazenie nasho custom toolsView pre linky
    this.paper.on('link:mouseenter', (linkView) => {
      linkView.removeTools();
      linkView.addTools(this.toolsView);
      linkView.showTools(this.toolsView);
    });

    // Schovanie nasho custom toolsView pre linky
    this.paper.on('link:mouseleave', (linkView) => {
      linkView.hideTools(this.toolsView);
    });

    this.paper.on('link: connect', (linkView) => {
      console.log('pripojenie');
    });
  }


  // Context menu click actions/functions
  onShowElementPropertiesClicked(){
    let elementContextMenu: HTMLElement = document.getElementById('element-context-menu')!;
    elementContextMenu.style.display = 'none';
    this.currentElementName.emit(this.activePaperElement.attributes.name);
  }

  onDeleteElementClicked(){
    let id: number = this.activePaperElement.id; // .uniqueid
    this.elementIds[id] = 0;
    this.activePaperElement.remove();
    this.activePaperElement = null;

    let elementContextMenu: HTMLElement = document.getElementById('element-context-menu')!;
    elementContextMenu.style.display = 'none';
  }

  onShowLinkPropertiesClicked() {
    let linkContextMenu: HTMLElement = document.getElementById('link-context-menu')!;
    linkContextMenu.style.display = 'none';
    //this.currentEquation.emit(this.activePaperLink.attributes.equation);
    //this.currentTransitionOutputs.emit(this.activePaperLink.attributes.outputs);
  }


  // ADD ELEMENT FUNCTIONS BELOW
  addActionToGraph(drawingMode: boolean): void {
    let element = this.action.createActionElement();
    
    /*
    if (drawingMode) {
      element.prop('attrs/body/magnet', true);
    } else {
      //element.prop('attr/body/magnet', false);
    }*/
    //console.log(element);
    this.drawingMode = true;
    this.changeDrawingMode(event);

    element.addTo(this.graph);
    //this.modeChanged(drawingMode);
  }

  addDiamondIfToGraph(drawingMode: boolean): void {
    let element = this.diamond.createDiamondElement('if');

    /*
    if (drawingMode) {
      element.prop('attrs/body/magnet', true);
    } else {
      //element.prop('attr/body/magnet', false);
    }*/
    //console.log(element);
    this.drawingMode = true;
    this.changeDrawingMode(event);

    element.addTo(this.graph);
  }

  addDiamondCaseToGraph(drawingMode: boolean): void {
    let element = this.diamond.createDiamondElement('case');

    /*
    if (drawingMode) {
      element.prop('attrs/body/magnet', true);
    } else {
      //element.prop('attr/body/magnet', false);
    }*/
    //console.log(element);
    this.drawingMode = true;
    this.changeDrawingMode(event);

    element.addTo(this.graph);
  }

  addStartToGraph(drawingMode: boolean): void {
    let element = this.start.createStartElement();

    /*
    if (drawingMode) {
      element.prop('attrs/body/magnet', true);
    } else {
      //element.prop('attr/body/magnet', false);
    }*/
    //console.log(element);
    this.drawingMode = true;
    this.changeDrawingMode(event);

    element.addTo(this.graph);
  }

  addEndToGraph(drawingMode: boolean): void {
    let element = this.end.createEndElement();

    /*
    if (drawingMode) {
      element.prop('attrs/body/magnet', true);
    } else {
      //element.prop('attr/body/magnet', false);
    }*/
    //console.log(element);
    this.drawingMode = true;
    this.changeDrawingMode(event);

    element.addTo(this.graph);
  }


  // SAVE DIAGRAM
  saveDiagram(): void {
    let json = this.graph.toJSON();
    console.log(json);
  }


	changeDrawingMode(e : any): void {
    if(this.drawingMode) { // vypnem drawing mode, zapne sa moving mode
      this.drawingMode = false;
      this.modeChanged(this.drawingMode);
      this.toggleCaption = 'Moving mode';
      e.checked = true;
    } else { // zapnem drawing mode, vypne sa moving mode
      this.drawingMode = true;
      this.modeChanged(this.drawingMode);
      this.toggleCaption = 'Drawing mode';
      e.checked = false;
    }
  }

  modeChanged(mode: boolean): void {
    if(mode == true) { // zapne sa drawing mode -> viem spajat elementy, neviem hybat elementy
      this.graph.getElements().forEach(element => {
        element.prop('attrs/body/magnet', true);
      });
      this.paper.options.interactive = false;
    } else { // vypnem drawing mode (zapne sa moving mode) -> viem hybat elementy, neviem spajat elementy
      this.graph.getElements().forEach(element => {
        element.prop('attrs/body/magnet', 'passive');
      });
      this.paper.options.interactive = true;
    }
  }

  isChecked(): boolean {
    //console.log('dasda');
    return false;
  }

}