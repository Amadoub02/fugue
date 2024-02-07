import { Component, ViewChild, ElementRef } from '@angular/core';
import { FugueRuntimeService } from '../fugue-runtime.service';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent {
  userString: string = 'reckless: ';
  consoleContent: string = '';
  editorContent: string = '';

  @ViewChild('editor') editor!: ElementRef;

  onKeydown(event:Event):void {
    if(event instanceof KeyboardEvent) {
      if(event.key === 'Enter'){
        console.log('Keydown event triggered');
        const commandLineValue = (event.target as HTMLInputElement).value;
        this.appendContent(this.userString + commandLineValue);

        (event.target as HTMLInputElement).value = '';
      }
    }
  }
  
  constructor(private fugue: FugueRuntimeService) { }

  private appendContent(content: string): void {
    this.consoleContent += content + '<br>';
  }

  onEditorInput() {
    console.log('Editor input event triggered');
  }

  runCode(): void{
    console.log(this.editor);
    const editorContent = this.editor.nativeElement.value;

    if(editorContent.trim() !== ''){
      const [ok, instructions, output] = this.fugue.loadProgram(editorContent);
      if (ok) {
        console.log("Loaded program");
        console.log(instructions);
        console.log(output);
        this.appendContent(output);
      } else {
        throw new Error('TODO: error information');
      }
      
    }
  }
  

  toggleConsole() {
    setTimeout(()=> {
      const input = document.getElementById("commandline");
      if(input) {
        input.focus();
      }
    });
  }
}
