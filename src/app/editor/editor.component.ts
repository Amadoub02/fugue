import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.css'
})
export class EditorComponent {
  consoleContent: string = '';
  editorContent: string = '';

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

  onEditorInput(): void {
    // Just so we can get the textbox
  }

  runCode(): void{
    this.consoleContent += this.editorContent + '<br>';
    this.editorContent = '';
  }
}
