import { Component, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JavaService } from './java.service';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent {
  userString: string = 'reckless: ';
  consoleContent: string = '';
  editorContent: string = '';

  /* For java test only */
  constructor(private http: HttpClient, private javaService: JavaService) {}

  /* Allows us to watch text editor field */
  @ViewChild('editor') editor!: ElementRef;

  /* On enter, runs command on console */
  onKeydown(event:Event):void {
    if(event instanceof KeyboardEvent) {
      if(event.key === 'Enter'){
        console.log('Keydown event triggered');
        const commandLineValue = (event.target as HTMLInputElement).value;
        this.appendContent(this.userString + commandLineValue);

        // Resets command line
        (event.target as HTMLInputElement).value = '';
      }
    }
  }

  private appendContent(content: string): void {
    this.consoleContent += content + '<br>';
  }

  /* Just to manipulate text editor later */
  onEditorInput() {
    console.log('Editor input event triggered');
  }

  /* Runs the code from Text Editor on console */
  runCode(): void{
    console.log(this.editor);
    const editorContent = this.editor.nativeElement.value;

    /* As of right now, just to no overload the console */
    if(editorContent.trim() !== ''){
      this.appendContent(this.userString + editorContent);
    }
  }

  /* Allows users to click anywhere on console to focus typing */
  toggleConsole() {
    setTimeout(()=> {
      const input = document.getElementById("commandline");
      if(input) {
        input.focus();
      }
    });
  }

  resetTextEditor() {
    this.editor.nativeElement.value = '';
  }

  /* FOR TESTING ONLY: runs java at endpoint for testing only */
  async runJava() {
    const editorContent = this.editor.nativeElement.value;

    if (editorContent.trim() !== '') {
      try {
        const response: any = await this.javaService.runJavaCode(editorContent).toPromise();
        console.log('Response:', response);
        this.appendContent(this.userString + response);
      } catch (error) {
        console.error('Error executing Java code:', error);
      }
    }
  }
}
