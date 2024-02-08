import { Component, ViewChild, ElementRef } from '@angular/core';
import { FugueRuntimeService } from '../fugue-runtime.service';
import { JavaService } from './java.service';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent {
  userString: string = 'reckless: ';
  consoleContent: string = '';
  editorContent: string = '';

  constructor(private javaService: JavaService, private fugue: FugueRuntimeService) {}

  /* Allows us to watch text editor field */
  @ViewChild('editor') editor!: ElementRef;

  /* On enter, runs command on console */
  onKeydown(event:Event):void {
    if(event instanceof KeyboardEvent) {
      if(event.key === 'Enter') {

        console.log('Keydown event triggered');
        const commandLineValue = (event.target as HTMLInputElement).value;
        this.appendContent(this.userString + commandLineValue);

        // Handle console command
        this.handleCommand(commandLineValue);

        // Resets command line
        (event.target as HTMLInputElement).value = '';
        this.toggleConsole();
      }
    }
  }

  onKeydownTab(event:Event):void {
    if(event instanceof KeyboardEvent) {
      if(event.key === 'Tab') {
        console.log('Tab keydown event triggered');
            event.preventDefault();
            const cursorPos = this.editor.nativeElement.selectionStart;
            const currentValue = this.editor.nativeElement.value;
            const newValue = currentValue.slice(0, cursorPos) + '\t' + currentValue.slice(cursorPos);
            this.editor.nativeElement.value = newValue;
            this.editor.nativeElement.setSelectionRange(cursorPos + 1, cursorPos + 1);
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

  /* Run Button */
  run() {
    this.appendContent(this.userString + 'run');
    this.handleCommand('run');
  }

  /* Runs the code from Text Editor on console */
  runCode(): void{
    console.log(this.editor);
    const editorContent = this.editor.nativeElement.value;

    /* As of right now, just to no overload the console */
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

  private handleCommand(command: string){
    const commandArgs = command.split(' ');
    if(commandArgs.length > 1){
      this.appendContent('Too many arguments >:(');
      return;
    }
    const cmd = commandArgs[0];
    switch(cmd) {
      case '':
        this.toggleConsole();
        break;
      case 'help':
        this.showHelp();
        break;
      case 'clear':
        this.clearConsole();
        break;
      case 'run':
        this.appendContent('Running Fugue...');
        this.runCode();
        break;
      default:
        this.appendContent('Unknown command: ' + command);
    }
  }

  private showHelp(): void {
    const helpText = `
      Available commands:
      run - Runs fugue code
      help - Show this help message
      clear - Clear the console
    `;
    this.appendContent(helpText);
  }
  
  private clearConsole(): void {
    this.consoleContent = '';
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
