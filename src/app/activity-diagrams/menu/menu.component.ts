import { Component, OnInit, ViewChild } from '@angular/core';
import { DiagramPaperComponent } from '../diagram-paper/diagram-paper.component';


@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  @ViewChild(DiagramPaperComponent) public readonly paper: DiagramPaperComponent;

  constructor() { }

  ngOnInit(): void {
  }

}
