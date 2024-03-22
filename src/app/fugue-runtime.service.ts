import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class FugueRuntimeService {
  constructor() {
    const imports = {
      "env": new Proxy({
        wasm_write_string: (s_count: bigint, s_data: bigint, to_standard_error: boolean) => {
            const str = this.toJsString2(s_data, s_count);
            this.writeToConsoleLog(str, to_standard_error);
        },
        memcmp: (a: bigint, b: bigint, count: bigint) => {
          const [na, nb, nc] = [Number(a), Number(b), Number(count)];
          const u8    = this.getWasmMemory();
          const buf_a = u8.subarray(na, na + nc);
          const buf_b = u8.subarray(nb, nb + nc);
          for (let i = 0; i < count; i++) {
            const delta = Number(buf_a[i]) - Number(buf_b[i]);
            if (delta !== 0) return delta;
          }
          return 0;
        },
        current_time_seconds: () => window.performance.now() * 0.001
      }, {
        get(target: any, prop: any, receiver: any) {
          if (target.hasOwnProperty(prop)) return target[prop];
          return () => { throw new Error("Missing function: " + prop); };
        }
      })
    };
    
    (async () => {
      const resp = await fetch("assets/main.wasm");
      const data = await resp.arrayBuffer();
      const wasm = await WebAssembly.instantiate(data, imports);
      return wasm.instance;
    })().then((instance) => {
      this.wasmModule     = instance;
      this.jaiContext     = (this.wasmModule.exports['__jai_runtime_init'] as Function)(0, 0n);
      console.log(this.wasmModule);
      this.returnSpace = (this.wasmModule.exports['get_return_register'] as Function)();
      this.wasmLoaded     = true;
    });
  }
  
  
  // something like updateSource(str) that might reload the program and debugger state
  // then we can have: stepDebuggerTo(ip), testProgram(), resetProgram(), 
  
  fugueState: any = undefined;
  private updateFugueState(): string {
    this.findExport('get_fugue_state')(this.jaiContext, this.returnSpace);
    const str = this.toJsString(this.returnSpace);
    const old = this.fugueState;
    try {
        this.fugueState = JSON.parse(str);
    } catch (e: any) {
        this.fugueState = old;
        console.log("Invalid json ", str);
        return e.toString();
    }
    console.log(this.fugueState);
    return '';
  }
  
  loadProgram(src: string): string {
    if (!this.wasmLoaded) return 'ERROR: Could not load Fugue environment';
    this.findExport('reset_temporary_storage')(this.jaiContext);
    
    const jaiStr = this.toJaiString(src);
    this.findExport('load')(this.jaiContext, jaiStr, this.returnSpace);
    const errorString = this.toJsString(this.returnSpace);
    if (errorString !== '') return errorString;
    
    const err = this.updateFugueState();
    if (err !== '') return err;
    
    return '';
  }
  
  stepProgram() {
    this.findExport('reset_temporary_storage')(this.jaiContext);
    this.findExport('step')(this.jaiContext);
    this.updateFugueState();
    console.log(this.fugueState);
  }
  
  // stinky wasm stuff below this point beware!
  
  private wasmLoaded  : boolean = false;
  private wasmModule  : WebAssembly.Instance | undefined;
  private jaiContext  : bigint = 0n;
  private returnSpace : bigint = 0n; // 16 bytes of static jai memory
  
  private resolvedProcs: { [key: string]: any; } = {};
  private findExport(name: string): any {
    if (!this.wasmLoaded) {
      console.error("WebAssembly has not yet been loaded! Please try again in a bit.");
      return
    }
    
    const exports = (this.wasmModule as WebAssembly.Instance).exports;
    let proc = this.resolvedProcs[name];
    if (proc === undefined) {
        const re = new RegExp('^'+name+'_[0-9a-z]+$');
        for (let full_name in exports) if (re.test(full_name)) {
            proc = exports[full_name];
            this.resolvedProcs[name] = proc;
            break;
        }
    }
    
    if (proc === undefined) {
        console.error("wasm procedure", name, "does not exist!");
        return;
    }
    
    return proc;
  }
  
  // TODO: this might only work by accident, might have to do something
  // more sophisticated than just reversing all of the bytes if we want something
  // more than 8 bytes
  private copyJaiMemory(addr: bigint, size: bigint): DataView {
    return (new DataView((new Uint8Array(
        this.getWasmMemory().buffer.slice(Number(addr), Number(addr) + Number(size))
    ).reverse()).buffer, 0));
  }
  
  private getWasmMemory(): Uint8Array {
    return new Uint8Array(((this.wasmModule as WebAssembly.Instance).exports['memory'] as any).buffer);
  }
  
  private textDecoder = new TextDecoder();
  private toJsString(pointer: bigint) {
    const mem   = this.copyJaiMemory(pointer, 16n);
    const data  = mem.getBigInt64(0);
    const count = mem.getBigInt64(8);
    return this.toJsString2(data, count);
  }
  
  private toJsString2(data: bigint, count: bigint) {
    const u8    = this.getWasmMemory();
    const bytes = u8.subarray(Number(data), Number(data) + Number(count));
    return this.textDecoder.decode(bytes);
  }
  
  private toJaiString(str: string): bigint {
    if (str !== '') {
      // allocate space for string
      // at most 4 bytes per UTF-8 code point
      let count = BigInt(str.length << 2);
      this.findExport("talloc")(this.jaiContext, count, this.returnSpace);
      const data = this.copyJaiMemory(this.returnSpace, 8n).getBigInt64(0);
      count = this.stringToUTF8(str, data, count);
      
      // construct the string, also uses temporary storage
      this.findExport("make_string")(this.jaiContext, count, data, this.returnSpace);
      return this.copyJaiMemory(this.returnSpace, 8n).getBigInt64(0);
    }
    return 0n;
  }
  
  // this is from the jai beta wasm example program
  // console.log and console.error always add newlines so we need to buffer the output from write_string
// to simulate a more basic I/O behavior. We’ll flush it after a certain time so that you still
// see the last line if you forget to terminate it with a newline for some reason.
private console_buffer: string = "";
private console_buffer_is_standard_error: boolean = false;
private console_timeout: any;
private  FLUSH_CONSOLE_AFTER_MS = 3;

private flushBuffer() {
    if (!this.console_buffer) return;
    if (this.console_buffer_is_standard_error) {
        console.error(this.console_buffer);
    } else {
        console.log(this.console_buffer);
    }
    this.console_buffer = "";
}

private writeToConsoleLog(str: string, to_standard_error: boolean) {
    if (this.console_buffer && this.console_buffer_is_standard_error != to_standard_error) {
        this.flushBuffer();
    }

    this.console_buffer_is_standard_error = to_standard_error;
    const lines = str.split("\n");
    for (let i = 0; i < lines.length - 1; i++) {
        this.console_buffer += lines[i];
        this.flushBuffer();
    }

    this.console_buffer += lines[lines.length - 1];

    clearTimeout(this.console_timeout);
    if (this.console_buffer) {
        this.console_timeout = setTimeout(() => {
            this.flushBuffer();
        }, this.FLUSH_CONSOLE_AFTER_MS);
    }    
}
  
  // from: https://github.com/elvis-epx/emscripten-example/blob/master/c_module.js#L781
  private stringToUTF8(str: string, outIdx: bigint, maxBytesToWrite: bigint): bigint {
    const outU8Array = this.getWasmMemory();
    // Parameter maxBytesToWrite is not optional. Negative values, 0, null, undefined and false each don't write out any bytes.
    if (!(maxBytesToWrite > 0n)) return 0n;

    let startIdx: any = outIdx;
    let endIdx: any = outIdx + maxBytesToWrite - 1n;
    for (let i = 0; i < str.length; ++i) {
      // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
      // See http://unicode.org/faq/utf_bom.html#utf16-3
      // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description and https://www.ietf.org/rfc/rfc2279.txt and https://tools.ietf.org/html/rfc3629
      let u = str.charCodeAt(i); // possibly a lead surrogate
      if (u >= 0xD800 && u <= 0xDFFF) {
        let u1 = str.charCodeAt(++i);
        u = 0x10000 + ((u & 0x3FF) << 10) | (u1 & 0x3FF);
      }
      if (u <= 0x7F) {
        if (outIdx >= endIdx) break;
        outU8Array[Number(outIdx++)] = u;
      } else if (u <= 0x7FF) {
        if (outIdx + 1n >= endIdx) break;
        outU8Array[Number(outIdx++)] = 0xC0 | (u >> 6);
        outU8Array[Number(outIdx++)] = 0x80 | (u & 63);
      } else if (u <= 0xFFFF) {
        if (outIdx + 2n >= endIdx) break;
        outU8Array[Number(outIdx++)] = 0xE0 | (u >> 12);
        outU8Array[Number(outIdx++)] = 0x80 | ((u >> 6) & 63);
        outU8Array[Number(outIdx++)] = 0x80 | (u & 63);
      } else if (u <= 0x1FFFFF) {
        if (outIdx + 3n >= endIdx) break;
        outU8Array[Number(outIdx++)] = 0xF0 | (u >> 18);
        outU8Array[Number(outIdx++)] = 0x80 | ((u >> 12) & 63);
        outU8Array[Number(outIdx++)] = 0x80 | ((u >> 6) & 63);
        outU8Array[Number(outIdx++)] = 0x80 | (u & 63);
      } else if (u <= 0x3FFFFFF) {
        if (outIdx + 4n >= endIdx) break;
        outU8Array[Number(outIdx++)] = 0xF8 | (u >> 24);
        outU8Array[Number(outIdx++)] = 0x80 | ((u >> 18) & 63);
        outU8Array[Number(outIdx++)] = 0x80 | ((u >> 12) & 63);
        outU8Array[Number(outIdx++)] = 0x80 | ((u >> 6) & 63);
        outU8Array[Number(outIdx++)] = 0x80 | (u & 63);
      } else {
        if (outIdx + 5n >= endIdx) break;
        outU8Array[Number(outIdx++)] = 0xFC | (u >> 30);
        outU8Array[Number(outIdx++)] = 0x80 | ((u >> 24) & 63);
        outU8Array[Number(outIdx++)] = 0x80 | ((u >> 18) & 63);
        outU8Array[Number(outIdx++)] = 0x80 | ((u >> 12) & 63);
        outU8Array[Number(outIdx++)] = 0x80 | ((u >> 6) & 63);
        outU8Array[Number(outIdx++)] = 0x80 | (u & 63);
      }
    }
    // Null-terminate the pointer to the buffer.
    outU8Array[Number(outIdx)] = 0;
    return outIdx - startIdx;
  }
}
