import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class FugueRuntimeService {
  private worker: Worker;
  private stateSubject = new Subject<any>();
  fugueState = this.stateSubject.asObservable();
  
  constructor() {
    // if (typeof Worker !== 'undefined') {
    this.worker = new Worker(new URL('./fugue.worker', import.meta.url));
    this.worker.onmessage = (message: any) => {
      const args = message.data;
      const name = args.shift();
      
      const proc = (this as any)[name];
      if (name === 'state') {
        console.log('state ', args[0]);
        this.stateSubject.next(args[0]);
      } else if (name === 'error') {
        this.stateSubject.next(args[0]);
      } else {
        // console.log('page got ', name);
      }
      
      if (proc === undefined) {
        // console.error('TODO: ', name);
      } else {
        proc(...args);
        console.log('page got message:', name, args);
      }
    };
    this.worker.postMessage(['init']);
    // } else {
      // Web Workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
    // }
  }
  
  
  // something like updateSource(str) that might reload the program and debugger state
  // then we can have: stepDebuggerTo(ip), testProgram(), resetProgram(), 
  // private updateFugueState() {
  //   this.findExport('get_fugue_state')(this.jaiContext, this.returnSpace);
  //   const str       = this.toJsString(this.returnSpace);
  //   this.fugueState = JSON.parse(str);
  // }
  
  loadProgram(program: string): void {
    this.worker.postMessage(['load', program]);
    
    
    // this.updateFugueState();
    // return '';
  }
  
  stepProgram(): void {
    this.worker.postMessage(['step', 1]);
    // this.findExport('reset_temporary_storage')(this.jaiContext);
    // this.findExport('step')(this.jaiContext);
    // this.updateFugueState();
    // console.log(this.fugueState);
  }
}