import { IEvents } from "./Events";


export abstract class View<T> {
  protected constructor(protected readonly container: HTMLElement) {}

  protected setImage(element: HTMLImageElement, src: string, alt?: string): void {
    if (element) {
      element.src = src;
      if (alt) {
        element.alt = alt;
      }
    }
  }

  protected setText(element: HTMLElement, value: unknown): void {
    if (element) {
      element.textContent = String(value);
    }
  }
  
  setDisabled(element: HTMLElement, state: boolean): void {
    if(element) {
      if (state) {
        element.setAttribute('disabled', 'disabled');
      } else element.removeAttribute('disabled');
    }
  }

  render(data?: Partial<T>): HTMLElement {
    Object.assign(this as object, data ?? {});
    return this.container;
  }
}
