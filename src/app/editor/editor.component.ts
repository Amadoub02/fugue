import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FugueRuntimeService } from '../fugue-runtime.service';
import { JavaService } from './java.service';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css',]
})
export class EditorComponent{
  userString: string = 'reckless: ';
  consoleContent: string = '';
  debuggerContent: string = '';
  editorContent: string = '';
  
  ngOnInit() {
    this.fugue.fugueState.subscribe((state: any) => {
      if (typeof(state) === 'string') {
        /// update error message
        this.debuggerContent = state;
      } else {
        // TODO: You guys have to make this look good and have all the stuff
        const stateJson = JSON.parse(state);
        this.debuggerContent = state;
      }
    });
  }

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
  
  // TODO: Clicking on the hyperlinks have to execute smth
  private updateDebuggerContent() {
    const fugueState = JSON.parse(JSON.stringify(this.fugue.fugueState));
    let debuggerContentString = `<div>`;


    for(const key in fugueState) {
      if(Object.prototype.hasOwnProperty.call(fugueState, key)) {
        const propertyValue = fugueState[key];
        debuggerContentString += `<p class="DebuggerButtons"><a href="">${key}: ${propertyValue}</a></p>`;
      }
    }
    debuggerContentString += `</div>`;
    this.debuggerContent = debuggerContentString;
  }
  
  updateSource() {
    const err = this.fugue.loadProgram(this.editor.nativeElement.value);
    if (err === '') {
      this.updateDebuggerContent();
    }
    else   {
      this.debuggerContent = err;
    }         
    // const [ok, state] = this.fugue.loadProgram(this.editor.nativeElement.value);
    // if (ok) this.updateDebuggerContent();
    // else    this.debuggerContent = 'TODO: return error info from jai code instead of just logging';
  }

  /* Prevents Tab from switching focus and appends the space to textarea */
  onKeydownTab(event:Event):void {
    if(event instanceof KeyboardEvent) {
    // console.log('Editor input event triggered');
    
    
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

  /* Run Button */
  run() {
    this.appendContent(this.userString + 'run');
    this.handleCommand('run');
  }

  /* Runs the code from Text Editor on console */
  // TODO: i think this button should be deprecated and repl
  private finalOutput: string | undefined;
  runCode(): void {
    if (this.fugue.fugueState !== undefined) {
      this.appendContent(this.finalOutput as string);
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
  
  private lastCommand: string = '';
  private handleCommand(command: string){
    const commandArgs = command.split(' ');
    if(commandArgs.length > 2){
      this.appendContent('Too many arguments >:(');
      return;
    }
    const cmd = commandArgs[0];
    if (cmd !== '') this.lastCommand = command;
    switch(cmd) {
      case '':
        if(commandArgs.length > 1) {
          this.appendContent('Too many arguments >:(');
          break;
        }
        
        if (this.lastCommand !== '') {
            this.handleCommand(this.lastCommand);
            return;
        }
        
        break;
      case 'help':
        if(commandArgs.length > 1) {
          this.appendContent('Too many arguments >:(');
          break;
        }
        this.showHelp();
        break;
      case 'clear':
        if(commandArgs.length > 1) {
          this.appendContent('Too many arguments >:(');
          break;
        }
        this.clearConsole();
        break;
      case 'run':
        if(commandArgs.length > 1) {
          this.appendContent('Too many arguments >:(');
          break;
        }
        this.runCode();
        break;
      case 'step':
        this.fugue.stepProgram();
        break;
      case 'save':
        const savedElements = this.editor.nativeElement.value;
        if(savedElements.trim() !== '') {
          const response = '';
        }
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
