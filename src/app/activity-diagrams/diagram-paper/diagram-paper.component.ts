import { Component, OnInit, Output, EventEmitter, HostListener } from '@angular/core';
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
  providers: [Paper],
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

  // Mode toggle variables
  drawingMode: boolean = false;
  toggleCaption: string;

  // Table variables
  moduleInputs: MatTableDataSource<DataSource> = new MatTableDataSource;
  moduleOutputs: MatTableDataSource<DataSource> = new MatTableDataSource;
  internalSignals: MatTableDataSource<DataSource> = new MatTableDataSource;

  // Error message for modal 
  errorMessage: string = '';

  // Link labels;
  linkLabels: any = [];

  paperScale: number = 1;
  dragStartPosition: any;

  constructor(paper: Paper) {
    // Helper variables
    const namespace = joint.shapes;
    const paperElement: HTMLDivElement = document.createElement('div');
    const paperHeight: any = '93%';
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
    this.paper.scale(1);

    this.action = new ActionElement();
    this.diamond = new DiamondElement();
    this.start = new StartElement();
    this.end = new EndElement();

    // Tools view setup for elements and links
    // Vertices - add vertices to links, boundary - to see a dotted boundary around element, remove - to remove element
    let verticesTool: joint.linkTools.Vertices = new joint.linkTools.Vertices();
    let boundaryTool: joint.linkTools.Boundary = new joint.linkTools.Boundary();
    let removeTool: joint.linkTools.Remove = new joint.linkTools.Remove();
    let segments: joint.linkTools.Segments = new joint.linkTools.Segments();
    this.toolsView = new joint.dia.ToolsView({tools: [verticesTool, boundaryTool, removeTool, segments]});
    this.elementToolsView = new joint.dia.ToolsView({tools: [boundaryTool]});

    this.toggleCaption = 'Moving mode';
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: { offsetX: number; offsetY: number; }) {
    if (this.dragStartPosition)
      this.paper.translate(e.offsetX - this.dragStartPosition.x * this.paperScale, e.offsetY - this.dragStartPosition.y * this.paperScale);
  }

  ngOnInit(): void {
    this.addActionListeners();

    // Add tab indent support for text areas
    let textArea = document.querySelectorAll('textarea')!;

    textArea.forEach(area => {
      area.addEventListener('keydown', (event: any) => {
        if (event.keyCode == 9) {
          event.preventDefault();
          area.setRangeText('    ', area.selectionStart, area.selectionEnd, 'end');
        }
      })
    });
  }

  ngOnDestroy(): void {
    this.paper.remove();
    this.graph.clear();
  }

  /** 
   * Function that adds event listeners to paper elements and links 
  */
  addActionListeners(): void {
    // Show element boundary on hover
    this.paper.on('element:mouseenter', (elementView: any) => {
      elementView.removeTools();
      elementView.addTools(this.elementToolsView);
      elementView.showTools(this.elementToolsView);
    });

    // Hide element boundary on hover
    this.paper.on('element:mouseleave', (elementView: any) => {
      elementView.hideTools();
    });
    
    // Show context menu for elemnt
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
      elementContextMenu.style.left = (x * this.paperScale).toString() + 'px';
      elementContextMenu.style.top = ((y + 100) * this.paperScale).toString() + 'px';
      elementContextMenu.style.display = 'block';
      
      linkContextMenu.style.display = 'none';
    });

    // Show context menu for link
    this.paper.on('link:contextmenu', (linkView, _evt, x, y) => {
      
      let sourceElement = this.graph.getCell(linkView.model.attributes.source.id);
      if(sourceElement.attributes['name'] != 'if' && sourceElement.attributes['name'] != 'case') return;

      let elementContextMenu: HTMLElement = document.getElementById('element-context-menu')!;
      let linkContextMenu: HTMLElement = document.getElementById('link-context-menu')!;

      this.activePaperLink = linkView.model;
      linkContextMenu.style.left = (x * this.paperScale).toString() + 'px';
      linkContextMenu.style.top = ((y + 100) * this.paperScale).toString() + 'px';
      linkContextMenu.style.display = 'block';

      elementContextMenu.style.display = 'none';
    });

    // Hide context menus
    this.paper.on('blank:pointerclick', () => {
      let elementContextMenu: HTMLElement = document.getElementById('element-context-menu')!;
      let deleteContextMenu: HTMLElement = document.getElementById('delete-context-menu')!;
      let linkContextMenu: HTMLElement = document.getElementById('link-context-menu')!;

      elementContextMenu.style.display = 'none';
      deleteContextMenu.style.display = 'none';
      linkContextMenu.style.display = 'none';
    });

    // Show tools view for links
    this.paper.on('link:mouseenter', (linkView) => {
      linkView.removeTools();
      linkView.addTools(this.toolsView);
      linkView.showTools(this.toolsView);
    });

    // Hide tools view for links
    this.paper.on('link:mouseleave', (linkView) => {
      linkView.hideTools(this.toolsView);
    });

    this.paper.on('blank:pointerdown', (event, x, y) => {
      this.dragStartPosition = { x: x, y: y};
    });

    this.paper.on('cell:pointerup blank:pointerup', (cellView, x, y) => {
      delete this.dragStartPosition;
    });
  }

  /** 
   * Shows element properties modal window 
  */
  onShowElementPropertiesClicked(){
    // Hide context menu
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

    // Set needed variables and show modal window
    let elementType = this.activePaperElement.attributes['name'];
    this.activePaperElementCaption = this.activePaperElement.attributes.attrs?.label?.text;
    this.elementEditing = true;
    this.showModal(elementType);
  }

  /** 
   * Deletes element from paper 
  */
  onDeleteElementClicked(){
    this.activePaperElement.remove();
    this.activePaperElement = null;

    let elementContextMenu: HTMLElement = document.getElementById('element-context-menu')!;
    let deleteContextMenu: HTMLElement = document.getElementById('delete-context-menu')!;
    elementContextMenu.style.display = 'none';
    deleteContextMenu.style.display = 'none';
  }

  /** 
   * Shows link properties modal window 
  */
  onShowLinkPropertiesClicked() {
    let linkContextMenu: HTMLElement = document.getElementById('link-context-menu')!;
    linkContextMenu.style.display = 'none';

    // Get source element -> needed for type checking below
    let sourceElement = this.graph.getCell(this.activePaperLink.attributes.source.id);
    let sourceElementType = sourceElement.attributes['name'];
    this.elementEditing = true;

    let currentLinkCaption = this.linkLabels.find((label: { id: any; }) => label.id == this.activePaperLink.id);
    if(currentLinkCaption == undefined) {
      this.activePaperLinkCaption = '';
    } else {
      this.activePaperLinkCaption = currentLinkCaption.label;
    }

    // Only links from ifs and cases can have labels
    if(sourceElementType == 'if') {
      this.showModal('ifLink');
    } else if (sourceElementType == 'case') {
      this.showModal('caseLink');
    }
  }

  addActionToGraph(caption: any): void {
    let element = this.action.createActionElement();
    // This prevents highlighting element caption -> when in drawing mode it was highlighting the text
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
    element.attr('label/text', 'Join');

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
    element.addTo(this.graph);

    this.closeModal();
  }

  /** 
   * Updates the caption of current selected element 
  */
  updateElementCaption(newCaption: any): void {
    this.activePaperElement.attr('label/text', newCaption);
    this.elementEditing = false;
    this.closeModal();
  }

  /** 
   * Updates the caption of current selected link
  */
  updateLinkCaption(newCaption: any, linkType: any): void {
    if((linkType == 'ifLink') && (newCaption != 'true') && (newCaption != 'false')) {
      alert('If link caption can only be true/false');
      return;
    } 

    // Removes old label
    this.activePaperLink.removeLabel(0);

    // Remove old label
    for(let i = 0; i < this.linkLabels.length; i++) {
      if(this.linkLabels[i].id == this.activePaperLink.id) {
        this.linkLabels.splice(i, 1);
        break;
      }
    }

    // Add new label
    this.activePaperLink.appendLabel({
      attrs: {
          text: {
              text: newCaption,
          }
      }
    });

    // Add new label;
    this.linkLabels.push({id: this.activePaperLink.id, label: newCaption});
  
    this.elementEditing = false;
    this.closeModal();
  }

  /** 
   * Update the content of selected loop
  */
  updateLoopContent(newContent: any): void {
    this.currentLoop.loopContent = newContent;
    this.elementEditing = false;
    this.closeModal();
  }

  /** 
   * Shows specific modal window according to type 
  */
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
      case 'internalSignals':
        modal = document.getElementById('signalTable')!;
        modal.style.display = 'block';
        break;
      case 'error':
        modal = document.getElementById('modalError')!;
        modal.style.display = 'block';
        break;
      case 'code':
        modal = document.getElementById('modalCode')!;
        modal.style.display = 'block';
        break;
      case 'clearPaper':
        modal = document.getElementById('modalClearPaper')!;
        modal.style.display = 'block';
        break;
      default:
        console.log('Unknown modal type!');
        break;
    }
  }

  /** 
   * Closes all modal windows 
  */
  closeModal(): void {
    let actionModal: HTMLElement = document.getElementById('modalAction')!;
    let ifModal: HTMLElement = document.getElementById('modalIf')!;
    let caseModal: HTMLElement = document.getElementById('modalCase')!;
    let ifLinkModal: HTMLElement = document.getElementById('modalIfLink')!;
    let caseLinkModal: HTMLElement = document.getElementById('modalCaseLink')!;
    let loopModal: HTMLElement = document.getElementById('modalLoop')!;
    let inputModal: HTMLElement = document.getElementById('inputTable')!;
    let outputModal: HTMLElement = document.getElementById('outputTable')!;
    let signalModal: HTMLElement = document.getElementById('signalTable')!;
    let errorModal: HTMLElement = document.getElementById('modalError')!;
    let codeModal: HTMLElement = document.getElementById('modalCode')!;
    let clearPaperModal: HTMLElement = document.getElementById('modalClearPaper')!;
    
    actionModal.style.display = 'none';
    ifModal.style.display = 'none';
    caseModal.style.display = 'none';
    ifLinkModal.style.display = 'none';
    caseLinkModal.style.display = 'none';
    loopModal.style.display = 'none';
    inputModal.style.display = 'none';
    outputModal.style.display = 'none';
    signalModal.style.display = 'none';
    errorModal.style.display = 'none';
    codeModal.style.display = 'none';
    clearPaperModal.style.display = 'none';

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
    let ifLinkForm: any = document.getElementById('ifLinkForm')!;
    let caseLinkForm: any = document.getElementById('caseLinkForm')!;
    let codeTextArea: any = document.getElementById('codeContent')!;

    actionForm.reset();
    ifForm.reset();
    caseForm.reset();
    loopForm.reset();
    ifLinkForm.reset();
    caseLinkForm.reset();
    codeTextArea.value = '';
  }

  /** 
   * Add new input to input table 
  */
  addInput(): void {
    this.moduleInputs.data.push({name: 'input_name', bits: '1'});
    this.moduleInputs._updateChangeSubscription();
  }

  /** 
   * Add new output to output table
  */
  addOutput(): void {
    this.moduleOutputs.data.push({name: 'output_name', bits: '1'});
    this.moduleOutputs._updateChangeSubscription();
  }

  /**
   * Add new internal signal to signal table
  */
  addSignal(): void {
    this.internalSignals.data.push({name: 'signal_name', bits: '1'});
    this.internalSignals._updateChangeSubscription();
  }

  /** 
   * Deletes module input from table 
  */
  deleteModuleInput(element: any) {
    let index: number = this.moduleInputs.data.indexOf(element);
    this.moduleInputs.data.splice(index, 1);
    this.moduleInputs._updateChangeSubscription();
  }

  /** 
   * Deletes module ouput from table 
  */
  deleteModuleOutput(element: any) {
    let index: number = this.moduleOutputs.data.indexOf(element);
    this.moduleOutputs.data.splice(index, 1);
    this.moduleOutputs._updateChangeSubscription();
  }

  /**
   * Deletes internal signal from table 
  */
  deleteSignal(element: any) {
    let index: number = this.internalSignals.data.indexOf(element);
    this.internalSignals.data.splice(index, 1);
    this.internalSignals._updateChangeSubscription();
  }

  /** 
   * Saves diagram to JSON file and downloads it 
  */
  saveDiagram(): void {
    let json = this.graph.toJSON();

    let serializedDiagram = {
      graph: json,
      linkLabels: this.linkLabels,
      loops: this.loops,
      moduleInputs: this.moduleInputs.data,
      moduleOutputs: this.moduleOutputs.data,
      internalSignals: this.internalSignals.data,
    }

    let jsonUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(serializedDiagram));
    let exportFileDefaultName = 'diagram.json';

    let linkElement = document.createElement('a');
    linkElement?.setAttribute('href', jsonUri);
    linkElement?.setAttribute('download', exportFileDefaultName);
    linkElement?.click();
  }

  /** 
   * Load diagram from uploaded JSON file and displays it on paper 
  */
  loadDiagram(): void {
    let inputFile: any = document.getElementById('jsonUpload')!;
    let fileReader = new FileReader();

    try {
      let file: File = inputFile.files[0];

      if(file == undefined || file == null) {
        alert('No file selected!');
        return;
      }
      
      fileReader.readAsText(file);
    } catch (error) {
      console.log(error);
    }

    this.drawingMode = true;
    this.changeDrawingMode(event);

    fileReader.onload = () => {
      let json: any;
      try {
        json = JSON.parse(fileReader.result as string);
      } catch {
        alert('Invalid JSON file!');
        return;
      }
      
      try {
        this.loops = json.loops;
        this.moduleInputs.data = json.moduleInputs;
        this.moduleOutputs.data = json.moduleOutputs;
        this.internalSignals.data = json.internalSignals;
        this.linkLabels = json.linkLabels;
        this.graph.fromJSON(json.graph);
      } catch {
        alert('JSON file isn\'t in correct format!');
      }
    }
  }

  generateCode(): void {
    let graphJSON: Array<Object> = this.graph.toJSON();
    let checkResult = prerequisites(graphJSON, this.graph, this.moduleInputs, this.moduleOutputs, this.internalSignals, this.linkLabels, this.loops);

    if(checkResult != '') {
      this.errorMessage = checkResult;
      this.showModal('error');
      return;
    }

    let code = generateCode(graphJSON, this.graph, this.moduleInputs, this.moduleOutputs, this.internalSignals, this.linkLabels, this.loops);

    let codeTextArea: any = document.getElementById('codeContent')!;
    codeTextArea.value = code;
    this.showModal('code');
  }

  saveCode(code: string): void {
    let codeURI = 'data:text/plain;charset=utf-8,' + encodeURIComponent(code);
    let exportFileDefaultName = 'code.sv';

    let linkElement = document.createElement('a');
    linkElement?.setAttribute('href', codeURI);
    linkElement?.setAttribute('download', exportFileDefaultName);
    linkElement?.click();
  }

  /** 
   * Changes current paper mode (drawing/moving) 
  */
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

  /** 
   * Adds removes magnets from all elements on the paper 
  */
  modeChanged(mode: boolean): void {
    if(mode == true) { // Drawing mode enabled -> magnets are true and user can connect elements
      this.graph.getElements().forEach(element => {
        element.prop('attrs/body/magnet', true);
      });
      this.paper.options.interactive = false;
    } else { // Drawing mode disabled -> magnets are false and user can't connect elements, but he can move them
      this.graph.getElements().forEach(element => {
        element.prop('attrs/body/magnet', 'passive');
      });
      this.paper.options.interactive = true;
    }
  }
}