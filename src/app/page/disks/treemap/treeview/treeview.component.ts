import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FileTree } from 'src/app/types/disk-types';

@Component({
  selector: 'app-treeview',
  templateUrl: './treeview.component.html',
  styleUrls: ['./treeview.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class TreeviewComponent {
  @Input() filetree!: FileTree;

  public nested: boolean = true;

  public unnested: string[] = []
  ngOnInit(){
    if(!this.filetree.children) return;
    for(let child of this.filetree.children){
      this.unnested.push(child.name);
    }
  }

  toggle_nest(){
    this.nested = !this.nested;
  }

  toggle_nest_item(dirname: string){
    if(!this.unnested.includes(dirname)){
      this.unnested.push(dirname);
    }else{
      this.unnested.splice(this.unnested.indexOf(dirname), 1);
    }
  }

}
