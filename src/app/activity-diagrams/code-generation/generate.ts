import { MatTableDataSource } from "@angular/material/table";
import { dia } from "jointjs";
import { DataSource } from "../paper-elements/data-source";

/** 
 * Function called before generating the code for all possible checks on elements 
*/
export function prerequisites(serializedGraph: any, graph: joint.dia.Graph, inputs: MatTableDataSource<DataSource>, outputs: MatTableDataSource<DataSource>, linkLabels: any, loops: any): string {
  //console.log('Running prerequisites...');
  //console.log('Serialized graph: ', serializedGraph);
  //console.log('Graph: ', graph);
  //console.log('Link labels: ', linkLabels);

  // Check if start element exists
  let startElement = serializedGraph.cells.filter((element: { name: string; }) => element.name == 'start');
  if (startElement.length == 0) {
    return 'Error: No start element found.';
  } else if (startElement.length > 1) {
    return 'Error: More than one start element found.';
  }

  // Check is end element exists
  let endElement = serializedGraph.cells.filter((element: { name: string; }) => element.name == 'end');
  if (endElement.length == 0) {
    return 'Error: No end element found.';
  } else if (endElement.length > 1) {
    return 'Error: More than one end element found.';
  }

  // Check for all elements
  for (let i = 0; i < serializedGraph.cells.length; i++) {
    if (serializedGraph.cells[i].type == 'standard.Link') continue;

    let links = graph.getConnectedLinks(serializedGraph.cells[i]);

    // Check if element has at least 1 link
    if (links.length == 0) {
      return 'Error: All elements must have at least one link.';
    }

    // Check for start element
    // (1) - Start element can have only 1 link which is going outwards
    if (serializedGraph.cells[i]['name'] == 'start') {
      // (1)
      if (links.length > 1) {
        return 'Error: Start element can have only 1 link.';
      }
      if (links[0].get('source').id != serializedGraph.cells[i].id) {
        return 'Error: Start element can have only 1 link which is going outwards.';
      }
    }
    // Check for end element
    // (1) - End element can only have 1 link which is going inwards
    else if (serializedGraph.cells[i]['name'] == 'end') {
      // (1)
      if (links.length > 1) {
        return 'Error: End element can have only 1 link.';
      }
      if (links[0].get('target').id != serializedGraph.cells[i].id) {
        return 'Error: End element can have only 1 link which is going inwards.';
      }
    }
    // Check for action elements
    // (1) - If action has more than 2 links -> error
    // (2) - If action has 2 links -> check if one is in and one is out
    // (3) - Check if action element has caption
    else if (serializedGraph.cells[i]['name'] == 'action') {
      // (1)
      if (links.length > 2) {
        return 'Error: Actions can have at most 2 links.';
      }
      // (2)
      else if (links.length == 2) {
        let inLink = false;
        let outLink = false;
        for (let j = 0; j < links.length; j++) {
          if (links[j].attributes['source'].id == serializedGraph.cells[i].id) {
            outLink = true;
          } else if (links[j].attributes['target'].id == serializedGraph.cells[i].id) {
            inLink = true;
          }
        }
        if (inLink == false || outLink == false) {
          return 'Error: Action can have only 1 connection going in and only 1 connection going out.';
        }
      }

      // (3)
      if (serializedGraph.cells[i].attrs.label['text'] == '' || serializedGraph.cells[i].attrs.label['text'] == undefined) {
        return 'Error: Action elements must have a caption.';
      }
    }
    // Check for if elements
    // (1) - If needs to have 3 links -> 1 going in and 2 going out
    // (2) - Check if all outgoing links from if have caption
    // (3) - Check if IF element has caption
    else if (serializedGraph.cells[i]['name'] == 'if') {
      let outgoingLinks = graph.getConnectedLinks(serializedGraph.cells[i], { outbound: true });
      let ingoingLinks = graph.getConnectedLinks(serializedGraph.cells[i], { inbound: true });
      //console.log('Outgoing links: ', outgoingLinks);
      //console.log('Ingoing links: ', ingoingLinks);

      // (1)
      if (links.length != 3) {
        return 'Error: If element must have 3 connections (1 going in and 2 going out).';
      } else {
        if (outgoingLinks.length != 2 && ingoingLinks.length != 1) {
          return 'Error: If element must have 2 outgoing connections and 1 connection going inwards.';
        }
      }

      // (2)
      for (let j = 0; j < outgoingLinks.length; j++) {
        let linkCaption = linkLabels.find((label: { id: string | number; }) => label.id == outgoingLinks[j].id);

        if (linkCaption == undefined || linkCaption.label == '') {
          return 'Error: All outgoing links from if element must have a caption.';
        }
      }

      // (3)
      if (serializedGraph.cells[i].attrs.label['text'] == '' || serializedGraph.cells[i].attrs.label['text'] == undefined) {
        return 'Error: If elements must have a caption.';
      }

    }
    // Check for case elements
    // (1) - Case needs to have al least 3 links
    // (2) - Check if all outgoing links from case have caption
    // (3) - Check if case element has caption
    // (4) - Check if there is 1 incoming link
    else if (serializedGraph.cells[i]['name'] == 'case') {
      let outgoingLinks = graph.getConnectedLinks(serializedGraph.cells[i], { outbound: true });
      let ingoingLinks = graph.getConnectedLinks(serializedGraph.cells[i], { inbound: true });
      //console.log('Outgoing links: ', outgoingLinks);
      //console.log('Ingoing links: ', ingoingLinks);

      // (1)
      if (links.length < 3) {
        return 'Error: Case element must have at least 3 connections (1 going in and 2 going out).';
      }

      // (2)
      for (let j = 0; j < outgoingLinks.length; j++) {
        let linkCaption = linkLabels.find((label: { id: string | number; }) => label.id == outgoingLinks[j].id);

        if (linkCaption == undefined || linkCaption.label == '') {
          return 'Error: All outgoing links from case element must have a caption.';
        }
      }

      // (3)
      if (serializedGraph.cells[i].attrs.label['text'] == '' || serializedGraph.cells[i].attrs.label['text'] == undefined) {
        return 'Error: Case elements must have a caption.';
      }

      // (4)
      if (ingoingLinks.length != 1) {
        return 'Error: There can be only 1 ingoing link to case element.';
      }
    } 
    // Check for loop elements
    // Same conditions as for action element
    else if (serializedGraph.cells[i]['name'] == 'loop') {
      // (1)
      if (links.length > 2) {
        return 'Error: Loop can have at most 2 links.';
      }
      // (2)
      else if (links.length == 2) {
        let inLink = false;
        let outLink = false;
        for (let j = 0; j < links.length; j++) {
          if (links[j].attributes['source'].id == serializedGraph.cells[i].id) {
            outLink = true;
          } else if (links[j].attributes['target'].id == serializedGraph.cells[i].id) {
            inLink = true;
          }
        }
        if (inLink == false || outLink == false) {
          return 'Error: Loop can have only 1 connection going in and only 1 connection going out.';
        }
      }

      // (3) - check if current loop has any caption from loops structure
      let currentLoop = loops.find((loop: { loopId: string | number; }) => loop.loopId == serializedGraph.cells[i].id);
      if (currentLoop == undefined) {
        return 'Error: Unknown loop element.';
      } else if (currentLoop.loopContent == '') {
        return 'Error: Loop elements must have content.';
      }
    }
    // Check for join element
    // (1) - Join needs to have at least 3 links
    // (2) - Inwards going links - at least 2
    // (3) - Outwards going links - at least 1
    else if (serializedGraph.cells[i]['name'] == 'join') {
      let outgoingLinks = graph.getConnectedLinks(serializedGraph.cells[i], { outbound: true });
      let ingoingLinks = graph.getConnectedLinks(serializedGraph.cells[i], { inbound: true });
      
      // (1)
      if (links.length < 3) {
        return 'Error: Join element must have at least 3 connections (x going in and 1 going out).';
      }

      // (2)
      if (ingoingLinks.length <= 1) {
        return 'Error: Join element must have at least 2 connections going in.';
      }

      // (3)
      if (outgoingLinks.length != 1) {
        return 'Error: Join element must have exactly 1 connection going out.';
      }
    }
  }

  let checkInputs = checkIO(inputs, outputs, 'Input');
  if(checkInputs != '') {
    return checkInputs;
  }

  let checkOutputs = checkIO(outputs, inputs , 'Output');
  if(checkOutputs != '') {
    return checkOutputs;
  }

  return '';
}

let code = '';
let lastVisitedJoin = '';

export function generateCode(serializedGraph: any, graph: joint.dia.Graph, inputs: MatTableDataSource<DataSource>, outputs: MatTableDataSource<DataSource>, linkLabels: any, loops: any): string {
  const INDENT_SIZE = 4;
  const INDENT = ' '.repeat(INDENT_SIZE);
  let indentLevel = 2;
  console.log('serializedGraph: ', serializedGraph);

  codeForIO(INDENT, inputs, outputs);

  code += INDENT + 'always_comb begin\n';

  let startElement = serializedGraph.cells.find((element: {name: string}) => element.name == 'start');
  let element = getSuccessor(graph, startElement);

  // action, if, case caption -> element.attributes.attrs.label.text

  while (element != undefined) {
    if (element.attributes['name'] == 'action' && element.attributes.attrs.label.text != 'Loop') {
      let actionCaption = element.attributes.attrs.label.text.replaceAll(' ', '');
      // Check if user didn't forget semicolon
      actionCaption[actionCaption.length - 1] == ';' ? 
        code += INDENT.repeat(2) + element.attributes.attrs.label.text + '\n' :
        code += INDENT.repeat(2) + element.attributes.attrs.label.text + ';\n';
    } else if (element.attributes['name'] == 'if') {
      let links = graph.getConnectedLinks(element, { outbound: true });
      let link1Info = linkLabels.find((label: { id: string | number; }) => label.id == links[0].id);
      let link2Info = linkLabels.find((label: { id: string | number; }) => label.id == links[1].id);
      let trueBranch: dia.Cell<dia.Cell.Attributes, dia.ModelSetOptions> | undefined;
      let falseBranch: dia.Cell<dia.Cell.Attributes, dia.ModelSetOptions> | undefined;

      // Find the first element in true and false branch
      if(link1Info.label == 'true') {
        // (1) - Determine which link is true/false
        trueBranch = links.find((link: { id: any; }) => link.id == link1Info.id);
        falseBranch = links.find((link: { id: any; }) => link.id == link2Info.id);
        // (2) - Get the first element in true/false branch
        trueBranch = graph.getCells().find(cell => cell.id == trueBranch?.attributes['target'].id);
        falseBranch = graph.getCells().find(cell => cell.id == falseBranch?.attributes['target'].id);
      } else if(link2Info.label == 'true') {
        // (1) - Determine which link is true/false
        trueBranch = links.find((link: { id: any; }) => link.id == link2Info.id);
        falseBranch = links.find((link: { id: any; }) => link.id == link1Info.id);
        // (2) - Get the first element in true/false branch
        trueBranch = graph.getCells().find(cell => cell.id == trueBranch?.attributes['target'].id);
        falseBranch = graph.getCells().find(cell => cell.id == falseBranch?.attributes['target'].id);
      }

      // True branch
      code += INDENT.repeat(2) + 'if (' + element.attributes.attrs.label.text + ') begin\n';
      codeForBranch(INDENT, indentLevel + 1, trueBranch, graph, linkLabels, loops);
      code += INDENT.repeat(2) +  'end\n';

      // False branch
      // check if false branch isn't directly connected to join -> if yes no need to call anything
      if(falseBranch?.attributes['name'] != 'join') {
        code += INDENT.repeat(2) + 'else begin\n';
        codeForBranch(INDENT, indentLevel + 1, falseBranch, graph, linkLabels, loops);
        code += INDENT.repeat(2) + 'end\n';
      }

      element = getSuccessor(graph, lastVisitedJoin);
      continue;
    } else if (element.attributes['name'] == 'case') {
      let links = graph.getConnectedLinks(element, { outbound: true });

      code += INDENT.repeat(2) + 'case (' + element.attributes.attrs.label.text + ')\n';

      for(let i = 0; i < links.length; i++) {
        // (1) - Get the label of the link
        let linkCaption = linkLabels.find((label: { id: string | number; }) => label.id == links[i].id);
        // (2) - Get the target element of the link
        let successor = graph.getCells().find(cell => cell.id == links[i].attributes['target'].id);
        // (3) - Generate code for the branch
        code += INDENT.repeat(3) + linkCaption.label + ' : begin\n';
        codeForBranch(INDENT, indentLevel + 2, successor, graph, linkLabels, loops);
        code += INDENT.repeat(3) + 'end\n';
      }

      code += INDENT.repeat(2) + 'endcase\n';

      element = getSuccessor(graph, lastVisitedJoin);
      continue;
    } else if (element.attributes.attrs.label.text == 'Loop') {
      let loop = loops.find((loop: {loopId: string | number;}) => loop.loopId == element.id);
      let parsedLoop = loop.loopContent.split('\n');

      for(let i = 0; i < parsedLoop.length; i++) {
        code += INDENT.repeat(2) + parsedLoop[i] + '\n';
      }
    } else if (element.attributes['name'] == 'join') {
      console.log('Unexpected join.');
      break;
    } else if (element.attributes['name'] == 'end') {
      break;
    }

    element = getSuccessor(graph, element);
  }

  code += INDENT + 'end\n\n';

  code += 'endmodule';

  let finalCode: string = code;
  code = '';

  return finalCode;
}

/** 
 * Generate code for inputs and outputs 
*/
function codeForIO(INDENT: string, inputs: MatTableDataSource<DataSource>, outputs: MatTableDataSource<DataSource>): void {
  code += 'module module_name (\n';
  
  for (let i = 0; i < inputs.data.length; i++) {
    if(inputs.data[i].bits == '1') {
      code += INDENT + 'input ' + inputs.data[i].name;

      if((i == inputs.data.length - 1) && (outputs.data.length == 0)) {
        code += '\n';
      } else {
        code += ',\n';
      }
    } else {
      let bits: number = parseInt(inputs.data[i].bits);
      code += INDENT + 'input ' + `[${bits-1}:0]` + ' ' + inputs.data[i].name;

      if((i == inputs.data.length - 1) && (outputs.data.length == 0)) {
        code += '\n';
      } else {
        code += ',\n';
      }
    }
  }

  for (let i = 0; i < outputs.data.length; i++) {
    if(outputs.data[i].bits == '1') {
      code += INDENT + 'output ' + outputs.data[i].name;

      if((i == outputs.data.length - 1)) {
        code += '\n';
      } else {
        code += ',\n';
      }

    } else {
      let bits: number = parseInt(outputs.data[i].bits);
      code += INDENT + 'output ' + `[${bits-1}:0]` + ' ' + outputs.data[i].name;

      if((i == outputs.data.length - 1)) {
        code += '\n';
      } else {
        code += ',\n';
      }
    }
  }

  code += ');\n\n';

  return;
}

/**
 *  Generate code for branches of if and case statements 
*/
function codeForBranch(INDENT: string, indentLevel: number, element: any, graph: joint.dia.Graph, linkLabels: any, loops: any): void {
  while (element != undefined) {
    if (element.attributes['name'] == 'action' && element.attributes.attrs.label.text != 'Loop') {
      let actionCaption = element.attributes.attrs.label.text.replaceAll(' ', '');
      // Check if user didn't forget semicolon
      actionCaption[actionCaption.length - 1] == ';' ? 
        code += INDENT.repeat(indentLevel) + element.attributes.attrs.label.text + '\n' :
        code += INDENT.repeat(indentLevel) + element.attributes.attrs.label.text + ';\n';
    } else if (element.attributes['name'] == 'if') {
      let links = graph.getConnectedLinks(element, { outbound: true });
      let link1Info = linkLabels.find((label: { id: string | number; }) => label.id == links[0].id);
      let link2Info = linkLabels.find((label: { id: string | number; }) => label.id == links[1].id);
      let trueBranch: dia.Cell<dia.Cell.Attributes, dia.ModelSetOptions> | undefined;
      let falseBranch: dia.Cell<dia.Cell.Attributes, dia.ModelSetOptions> | undefined;

      // Find the first element in true and false branch
      if(link1Info.label == 'true') {
        // (1) - Determine which link is true/false
        trueBranch = links.find((link: { id: any; }) => link.id == link1Info.id);
        falseBranch = links.find((link: { id: any; }) => link.id == link2Info.id);
        // (2) - Get the first element in true/false branch
        trueBranch = graph.getCells().find(cell => cell.id == trueBranch?.attributes['target'].id);
        falseBranch = graph.getCells().find(cell => cell.id == falseBranch?.attributes['target'].id);
      } else if(link2Info.label == 'true') {
        // (1) - Determine which link is true/false
        trueBranch = links.find((link: { id: any; }) => link.id == link2Info.id);
        falseBranch = links.find((link: { id: any; }) => link.id == link1Info.id);
        // (2) - Get the first element in true/false branch
        trueBranch = graph.getCells().find(cell => cell.id == trueBranch?.attributes['target'].id);
        falseBranch = graph.getCells().find(cell => cell.id == falseBranch?.attributes['target'].id);
      }

      // True branch
      code += INDENT.repeat(indentLevel) + 'if (' + element.attributes.attrs.label.text + ') begin\n';
      codeForBranch(INDENT, indentLevel + 1, trueBranch, graph, linkLabels, loops);
      code += INDENT.repeat(indentLevel) +  'end\n';

      // False branch
      // check if false branch isn't directly connected to join -> if yes no need to call anything
      if(falseBranch?.attributes['name'] != 'join') {
        code += INDENT.repeat(indentLevel) + 'else begin\n';
        codeForBranch(INDENT, indentLevel + 1, falseBranch, graph, linkLabels, loops);
        code += INDENT.repeat(indentLevel) + 'end\n';
      }

      element = getSuccessor(graph, lastVisitedJoin);
      continue;
    } else if (element.attributes['name'] == 'case') {
      let links = graph.getConnectedLinks(element, { outbound: true });

      code += INDENT.repeat(indentLevel) + 'case (' + element.attributes.attrs.label.text + ')\n';

      for(let i = 0; i < links.length; i++) {
        // (1) - Get the label of the link
        let linkCaption = linkLabels.find((label: { id: string | number; }) => label.id == links[i].id);
        // (2) - Get the target element of the link
        let successor = graph.getCells().find(cell => cell.id == links[i].attributes['target'].id);
        // (3) - Generate code for the branch
        code += INDENT.repeat(indentLevel + 1) + linkCaption.label + ' : begin\n';
        codeForBranch(INDENT, indentLevel + 2, successor, graph, linkLabels, loops);
        code += INDENT.repeat(indentLevel + 1) + 'end\n';
      }

      code += INDENT.repeat(indentLevel) + 'endcase\n';

      element = getSuccessor(graph, lastVisitedJoin);
      continue;
    } else if (element.attributes.attrs.label.text == 'Loop') {
      let loop = loops.find((loop: {loopId: string | number;}) => loop.loopId == element.id);
      let parsedLoop = loop.loopContent.split('\n');

      for(let i = 0; i < parsedLoop.length; i++) {
        code += INDENT.repeat(indentLevel) + parsedLoop[i] + '\n';
      }
    } else if (element.attributes['name'] == 'join') {
      lastVisitedJoin = element;
      break;
    } else if (element.attributes['name'] == 'end') {
      break;
    }

    element = getSuccessor(graph, element);
  }
  
  return;
}

/** 
 * Check Input/Output data sources, taken from state machines and modified for this use case 
*/
function checkIO(dataSource1: MatTableDataSource<DataSource>, dataSource2: MatTableDataSource<DataSource>, type: string): string {
  let containsAlphabet : RegExp =  /[a-zA-Z]/;
  let containsAlphaNumeric : RegExp =  /^[a-z0-9-_]+$/i;

  for (let i = 0; i < dataSource1.data.length; i++) {
    if(dataSource1.data[i].name == 'input' || dataSource1.data[i].name == 'output') {
      return 'Error: "input" and "output" are reserved keywords.';
    }
    if (!containsAlphabet.test(dataSource1.data[i].name[0])) {
      return 'Error: ' + type + ' name must start with a letter and contain only alphanumeric characters or underscores.';
    } else if (!containsAlphaNumeric.test(dataSource1.data[i].name)) {
      return 'Error: ' + type + ' name must start with a letter and contain only alphanumeric characters or underscores.';
    } else if (isNaN(Number(dataSource1.data[i].bits)) || Number(dataSource1.data[i].bits) < 1) {
      return 'Error: ' + type + ' bit size must be a positive integer.';
    } else {
      for (let j = i; j < dataSource1.data.length; j++) {
        if (j !== i && dataSource1.data[i].name === dataSource1.data[j].name) {
          return 'Error: ' + type + ' name must be unique.';
        }
        for (let k = 0; k < dataSource2.data.length; k++) {
          if (dataSource1.data[j].name === dataSource2.data[k].name) {
            return 'Error: Inputs and outputs can not have the same name.';
          }
        }
      }
    }
  }
  
  return '';
}

/** 
 * Get successor of given element
*/
function getSuccessor(graph: joint.dia.Graph, element: any): any {
  let links = graph.getConnectedLinks(element, { outbound: true });

  if (links.length == 1) {
    let successor = links[0].attributes['target'].id;
    return graph.getCells().find(element => element.id == successor);
  } else if (links.length > 1) {
    let successors = [];
    for (let i = 0; i < links.length; i++) {
      let successor = graph.getCells().find(element => element.id == links[i].attributes['target'].id);
      successors.push(successor);
    }
    return successors;
  }
}