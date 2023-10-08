import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, WritableSignal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FileTree, Rectangle } from 'src/app/types/disk-types';

@Component({
  selector: 'app-treeview',
  templateUrl: './treeview.component.html',
  styleUrls: ['./treeview.component.css'],
  standalone: true,
  imports: [CommonModule, TranslateModule]
})
export class TreeviewComponent {
  @Input() filetree!: FileTree;
  @Output() eventEmiter = new EventEmitter<any>();

  public unnested: string[] = []

  ngOnInit(){
    if(!this.filetree.children) return;
    for(let child of this.filetree.children){
      this.unnested.push(child.name);
    }
  }

  //nest and unnested folder content
  toggle_nest_item(dirname: string){
    if(!this.unnested.includes(dirname)){
      this.unnested.push(dirname);
    }else{
      this.unnested.splice(this.unnested.indexOf(dirname), 1);
    }
  }

  //copy the path of this folder-file
  copy_path_to_clipboard(path: string){
    navigator.clipboard.writeText(path);
  }

  back_propagate_highlight(filetree: FileTree){
    this.eventEmiter.emit(filetree);
  }
}
