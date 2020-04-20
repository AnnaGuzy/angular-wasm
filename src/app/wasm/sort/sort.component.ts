import { Component, OnInit } from '@angular/core';
import { EmscriptenWasmComponent } from '../emscripten-wasm.component';
import { arrayToPtr, ptrToArray } from '../tools';
import { quickSort } from './sort';

@Component({
  selector: 'app-sort',
  templateUrl: './sort.component.html'
})
export class SortComponent extends EmscriptenWasmComponent
implements OnInit {
  length = 100;
  runs = 5;

  constructor() {
    super('SortModule', 'sort.js');
  }

  ngOnInit(): void {
  }

  onClick(): void {
    const arrayDataToPass = this.generateArray(this.length);
    const copies: number[][] = Array(this.runs);
    for (let index = 0; index < this.runs; index++) {
      copies[index] = [...arrayDataToPass];
    }

    this.sortWithWasm(arrayDataToPass);
    this.sortWithJs(copies);
  }

  private sortWithJs(copies: number[][]) {
    const tj0 = performance.now();
    for (let index = 0; index < this.runs; index++) {
      quickSort(copies[index], 0, this.length - 1);
    }
    const tj1 = performance.now();
    console.log('Sorting with js took ' + (tj1 - tj0) / this.runs + ' milliseconds on avarage.');
  }

  private sortWithWasm(arrayDataToPass: number[]) {
    const tw0 = performance.now();
    for (let index = 0; index < this.runs; index++) {
      this.sortWasm(arrayDataToPass);
    }
    const tw1 = performance.now();
    console.log('Sorting with wasm took ' + (tw1 - tw0) / this.runs + ' milliseconds on avarage.');
  }

  generateArray(length: number): number[] {
    return Array.from({length: length}, () => Math.floor(Math.random() * length));
  }

  sortWasm(array: number[]) {
    const ptr = arrayToPtr(array, this.module);
    (this.module as any)._quickSort(ptr, 0, array.length - 1);
    const sorted = ptrToArray(ptr, 4, this.module);
  }
}
