import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import * as joint from 'jointjs';

import { Paper } from '../paper-elements/paper';
import { DataSource } from '../paper-elements/data-source';
import { ActionElement } from '../paper-elements/action';
import { DiamondElement } from '../paper-elements/diamond';
import { StartElement } from '../paper-elements/start-element';
import { EndElement } from '../paper-elements/end-element';

import { prerequisites, generateCode } from '../code-generation/generate';

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

  // Currently selected elements
  activePaperElement: any = null;
  activePaperElementCaption: string = '';
  activePaperLink: any = null;
  activePaperLinkCaption: string = '';
  currentLoop: any = null;
  elementEditing: boolean = false;

  // Element hover view variables
  toolsView: any;
  elementToolsView: any;

  // Loop and module variables
  loops: any[] = [];
  module: Object = {};

  // Mode toggle variables
  drawingMode: boolean = false;
  toggleCaption: string;

  // Table variables
  moduleInputs: MatTableDataSource<DataSource> = new MatTableDataSource;
  moduleOutputs: MatTableDataSource<DataSource> = new MatTableDataSource;

  // Error message for modal 
  errorMessage: string = '';

  constructor(paper: Paper) {
    // Helper variables
    const namespace = joint.shapes;
    const paperElement: HTMLDivElement = document.createElement('div');
    const paperHeight: any = '82%';
    const paperWidth: any = '99%';

    // Setup for HTML element that will contain the paper
    paperElement.id = 'paper';
    paperElement.style.width = '100%';
    paperElement.style.height = '100vh'
    paperElement.style.margin = 'auto';
    paperElement.style.borderStyle = 'solid';
    paperElement.style.borderWidth = '1px';
    paperElement.style.overflow = 'auto';
    document.body.appendChild(paperElement);

    // Graph setup
    this.graph = new joint.dia.Graph({}, { cellNamespace: namespace });
    this.paper = paper.createNewPaper(paperElement, this.graph, paperWidth, paperHeight, namespace);
    this.paper.drawGrid();
    this.paper.scale(0.8);

    this.action = new ActionElement();
    this.diamond = new DiamondElement();
    this.start = new StartElement();
    this.end = new EndElement();

    // Tools view setup for elements and links
    // Vertices - add vertices to links, boundary - to see a dotted boundary around element, remove - to remove element
    let verticesTool: joint.linkTools.Vertices = new joint.linkTools.Vertices();
    let boundaryTool: joint.linkTools.Boundary = new joint.linkTools.Boundary();
    let removeTool: joint.linkTools.Remove = new joint.linkTools.Remove();
    this.toolsView = new joint.dia.ToolsView({tools: [verticesTool, boundaryTool, removeTool]});
    this.elementToolsView = new joint.dia.ToolsView({tools: [boundaryTool]});

    this.toggleCaption = 'Moving mode';
  }

  ngOnInit(): void {
    this.addActionListeners();

    // Add tab indent support for text areas
    let loopTextArea = document.querySelector('textarea')!;
    loopTextArea.addEventListener('keydown', (event: any) => {
      if(event.keyCode == 9) {
        event.preventDefault();
        loopTextArea.setRangeText('\t', loopTextArea.selectionStart, loopTextArea.selectionEnd, 'end');
      }
    });
  }

  ngOnDestroy(): void {
    this.paper.remove();
    this.graph.clear();
  }

  /** Function that adds event listeners to paper elements and links */
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
    this.paper.on('element:contextmenu', (elementView, _evt, x, y) => {
      let clickedELementType: any = elementView.model.attributes['name'];
      let elementContextMenu: HTMLElement;
      let linkContextMenu: HTMLElement = document.getElementById('link-context-menu')!;

      if(clickedELementType == 'start' || clickedELementType == 'end' || clickedELementType == 'join') {
        elementContextMenu = document.getElementById('delete-context-menu')!;
      } else {
        elementContextMenu = document.getElementById('element-context-menu')!;
      }

      this.activePaperElement = elementView.model;
      elementContextMenu.style.left = (x + 15).toString() + 'px';
      elementContextMenu.style.top = (y + 20).toString() + 'px';
      elementContextMenu.style.display = 'block';
      
      linkContextMenu.style.display = 'none';
    });

    // Zobrazenie context menu pre prepojenie
    this.paper.on('link:contextmenu', (linkView, _evt, x, y) => {
      
      let sourceElement = this.graph.getCell(linkView.model.attributes.source.id);
      if(sourceElement.attributes['name'] != 'if' && sourceElement.attributes['name'] != 'case') return;

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
      let deleteContextMenu: HTMLElement = document.getElementById('delete-context-menu')!;
      let linkContextMenu: HTMLElement = document.getElementById('link-context-menu')!;

      elementContextMenu.style.display = 'none';
      deleteContextMenu.style.display = 'none';
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

  /** Shows element properties modal window */
  onShowElementPropertiesClicked(){
    let elementContextMenu: HTMLElement = document.getElementById('element-context-menu')!;
    elementContextMenu.style.display = 'none';

    // Specific behaviour for loops
    if(this.activePaperElement.attributes.attrs.label.text == 'Loop') {
      let loopId: string = this.activePaperElement.attributes.id;
      this.currentLoop = this.loops.find(loop => loop.loopId == loopId);

      this.elementEditing = true;

      let loopContentTextArea: any = document.getElementById('loopContent')!;
      loopContentTextArea.value = this.currentLoop.loopContent;

      this.showModal('loop');
      
      return;
    }

    let elementType = this.activePaperElement.attributes['name'];
    this.activePaperElementCaption = this.activePaperElement.attributes.attrs?.label?.text;
    this.elementEditing = true;
    this.showModal(elementType);
  }

  /** Deletes element from paper */
  onDeleteElementClicked(){
    this.activePaperElement.remove();
    this.activePaperElement = null;

    let elementContextMenu: HTMLElement = document.getElementById('element-context-menu')!;
    let deleteContextMenu: HTMLElement = document.getElementById('delete-context-menu')!;
    elementContextMenu.style.display = 'none';
    deleteContextMenu.style.display = 'none';
  }

  /** Shows link properties modal window */
  onShowLinkPropertiesClicked() {
    let linkContextMenu: HTMLElement = document.getElementById('link-context-menu')!;
    linkContextMenu.style.display = 'none';

    let sourceElement = this.graph.getCell(this.activePaperLink.attributes.source.id);
    let sourceElementType = sourceElement.attributes['name'];
    this.elementEditing = true;

    if(sourceElementType == 'if') {
      this.showModal('ifLink');
    } else if (sourceElementType == 'case') {
      this.showModal('caseLink');
    }
  }

  addActionToGraph(caption: any): void {
    let element = this.action.createActionElement();
    // this prevents highlighting element caption -> when in drawing mode it was highlighting the text
    // when connecting elements
    element.attr(
      "label/style",
      "-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;"
    );
    element.attr('label/text', caption);
    
    this.drawingMode = true;
    this.changeDrawingMode(event);

    element.addTo(this.graph);

    this.closeModal();
  }

  addDiamondIfToGraph(caption: any ): void {
    let element = this.diamond.createDiamondElement('if', 'black');
    element.attr(
      "label/style",
      "-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;"
    );
    element.attr('label/text', caption);

    this.drawingMode = true;
    this.changeDrawingMode(event);

    element.addTo(this.graph);

    this.closeModal();
  }

  addDiamondCaseToGraph(caption: any): void {
    let element = this.diamond.createDiamondElement('case', 'blue');
    element.attr(
      "label/style",
      "-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;"
    );
    element.attr('label/text', caption);

    this.drawingMode = true;
    this.changeDrawingMode(event);

    element.addTo(this.graph);

    this.closeModal();
  }

  addDiamondJoinToGraph(): void {
    let element = this.diamond.createDiamondElement('join', 'red');
    element.attr(
      "label/style",
      "-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;"
    );

    this.drawingMode = true;
    this.changeDrawingMode(event);

    element.addTo(this.graph);
  }

  addStartToGraph(): void {
    let element = this.start.createStartElement();
    element.attr(
      "label/style",
      "-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;"
    );

    this.drawingMode = true;
    this.changeDrawingMode(event);

    element.addTo(this.graph);
  }

  addEndToGraph(): void {
    let element = this.end.createEndElement();
    element.attr(
      "label/style",
      "-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;"
    );

    this.drawingMode = true;
    this.changeDrawingMode(event);

    element.addTo(this.graph);
  }

  addLoopToGraph(caption: any, content: any): void {
    let element = this.action.createActionElement();
    element.attr(
      "label/style",
      "-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;"
    );
    element.attr('label/text', caption);

    this.drawingMode = true;
    this.changeDrawingMode(event);

    this.loops.push({loopId: element.id, loopContent: content});
    console.log('Adding to graph loop', this.loops);

    element.addTo(this.graph);

    this.closeModal();
  }

  /** Updates the caption of current selected element */
  updateElementCaption(newCaption: any): void {
    this.activePaperElement.attr('label/text', newCaption);
    this.elementEditing = false;
    this.closeModal();
  }

  /** Updates the caption of current selected link */
  updateLinkCaption(newCaption: any, linkType: any): void {
    if((linkType == 'ifLink') && (newCaption != 'true') && (newCaption != 'false')) {
      alert('If link caption can only be true/false');
      return;
    } 

    // Removes old label
    this.activePaperLink.removeLabel(0);

    // Adds new label
    this.activePaperLink.appendLabel({
      attrs: {
          text: {
              text: newCaption,
          }
      }
    });
  
    this.elementEditing = false;
    this.closeModal();
  }

  /** Update the content of selected loop */
  updateLoopContent(newContent: any): void {
    this.currentLoop.loopContent = newContent;
    this.elementEditing = false;
    this.closeModal();
  }

  /** Shows specific modal window according to type */
  showModal(type: string) {
    let modal: HTMLElement;

    switch(type) {
      case 'action':
        modal = document.getElementById('modalAction')!;
        modal.style.display = 'block';
        break;
      case 'if':
        modal = document.getElementById('modalIf')!;
        modal.style.display = 'block';
        break;
      case 'case':
        modal = document.getElementById('modalCase')!;
        modal.style.display = 'block';
        break;
      case 'ifLink':
        modal = document.getElementById('modalIfLink')!;
        modal.style.display = 'block';
        break;
      case 'caseLink':
        modal = document.getElementById('modalCaseLink')!;
        modal.style.display = 'block';
        break;
      case 'loop':
        modal = document.getElementById('modalLoop')!;
        modal.style.display = 'block';
        break;
      case 'moduleInputs':
        modal = document.getElementById('inputTable')!;
        modal.style.display = 'block';
        break;
      case 'moduleOutputs':
        modal = document.getElementById('outputTable')!;
        modal.style.display = 'block';
        break;
      case 'error':
        modal = document.getElementById('modalError')!;
        modal.style.display = 'block';
        break;
      default:
        console.log('Unknown modal type!');
        break;
    }
  }

  /** Closes all modal windows */
  closeModal(): void {
    let actionModal: HTMLElement = document.getElementById('modalAction')!;
    let ifModal: HTMLElement = document.getElementById('modalIf')!;
    let caseModal: HTMLElement = document.getElementById('modalCase')!;
    let ifLinkModal: HTMLElement = document.getElementById('modalIfLink')!;
    let caseLinkModal: HTMLElement = document.getElementById('modalCaseLink')!;
    let loopModal: HTMLElement = document.getElementById('modalLoop')!;
    let inputModal: HTMLElement = document.getElementById('inputTable')!;
    let outputModal: HTMLElement = document.getElementById('outputTable')!;
    let erroModal: HTMLElement = document.getElementById('modalError')!;
    
    actionModal.style.display = 'none';
    ifModal.style.display = 'none';
    caseModal.style.display = 'none';
    ifLinkModal.style.display = 'none';
    caseLinkModal.style.display = 'none';
    loopModal.style.display = 'none';
    inputModal.style.display = 'none';
    outputModal.style.display = 'none';
    erroModal.style.display = 'none';

    this.activePaperElement = null;
    this.activePaperElementCaption = '';
    this.activePaperLink = null;
    this.activePaperLinkCaption = '';
    this.currentLoop = null;
    this.elementEditing = false;
    this.errorMessage = '';

    // reset values of all forms
    let actionForm: any = document.getElementById('actionForm')!;
    let ifForm: any = document.getElementById('ifForm')!;
    let caseForm: any = document.getElementById('caseForm')!;
    let loopForm: any = document.getElementById('loopForm')!;

    actionForm.reset();
    ifForm.reset();
    caseForm.reset();
    loopForm.reset();
  }

  /** Add new input to input table */
  addInput(): void {
    this.moduleInputs.data.push({name: 'input_name', bits: '1'});
    this.moduleInputs._updateChangeSubscription();
  }

  /** Add new output to output table */
  addOutput(): void {
    this.moduleOutputs.data.push({name: 'output_name', bits: '1'});
    this.moduleOutputs._updateChangeSubscription();
  }

  /** Deletes module input from table */
  deleteModuleInput(element: any) {
    let index: number = this.moduleInputs.data.indexOf(element);
    this.moduleInputs.data.splice(index, 1);
    this.moduleInputs._updateChangeSubscription();
  }

  /** Deletes module ouput from table */
  deleteModuleOutput(element: any) {
    let index: number = this.moduleOutputs.data.indexOf(element);
    this.moduleOutputs.data.splice(index, 1);
    this.moduleOutputs._updateChangeSubscription();
  }

  /** Saves diagram to JSON file and downloads it */
  saveDiagram(): void {
    let json = this.graph.toJSON();
    console.log(json);

    let jsonUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(json));
    let exportFileDefaultName = 'diagram.json';

    let linkElement = document.createElement('a');
    linkElement?.setAttribute('href', jsonUri);
    linkElement?.setAttribute('download', exportFileDefaultName);
    linkElement?.click();
  }

  /** Load diagram from uploaded JSON file and displays it on paper */
  loadDiagram(): void {
    let inputFile: any = document.getElementById('jsonUpload')!;
    let fileReader = new FileReader();

    try {
      let file: File = inputFile.files[0];

      if(file == undefined || file == null) {
        console.log('No file selected!');
        return;
      }
      
      fileReader.readAsText(file);
    } catch (error) {
      console.log(error);
    }

    fileReader.onload = () => {
      let json = JSON.parse(fileReader.result as string);
      this.graph.fromJSON(json);
    }
  }

  generateCode(): void {
    let graphJSON: Array<Object> = this.graph.toJSON();
    let checkResult = prerequisites(graphJSON, this.graph, this.moduleInputs, this.moduleOutputs);

    if(checkResult != '') {
      this.errorMessage = checkResult;
      this.showModal('error');
      return;
    }
  }

  /** Changes current paper mode (drawing/moving) */
	changeDrawingMode(e : any): void {
    if(this.drawingMode) { // disable drawing mode, activate moving mode
      this.drawingMode = false;
      this.modeChanged(this.drawingMode);
      this.toggleCaption = 'Moving mode';
      e.checked = true;
    } else { // activate drawing mode, disable moving mode
      this.drawingMode = true;
      this.modeChanged(this.drawingMode);
      this.toggleCaption = 'Drawing mode';
      e.checked = false;
    }
  }

  /** Adds removes magnets from all elements on the paper */
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
}