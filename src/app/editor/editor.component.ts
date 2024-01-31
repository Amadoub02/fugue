import { Component, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.css'
})
export class EditorComponent {
  consoleContent: string = '';
  editorContent: string = '';

  @ViewChild('editor') editor: ElementRef;

  onKeydown(event:Event):void {
    if(event instanceof KeyboardEvent) {
      if(event.key === 'Enter'){
        const commandLineValue = (event.target as HTMLInputElement).value;
        this.appendContent(commandLineValue);

        (event.target as HTMLInputElement).value = '';
      }
    }
  }

  private appendContent(content: string): void {
    this.consoleContent += content + '<br>';
  }

  onEditorInput() {}

  runCode(): void{
    const editorContent = this.editor.nativeElement.value;

    if(editorContent.trim() !== ''){
      this.appendContent(editorContent);
      this.editor.nativeElement.value = '';
    }
  }
}
