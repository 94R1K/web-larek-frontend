import { IEvents } from "./base/Events";
import { Form } from "./common/Form";
import { IOrderInfoForm } from "../types";
import { ensureAllElements } from "../utils/utils";


export class OrderInfoForm extends Form<IOrderInfoForm> {
  protected _paymentButtons: HTMLButtonElement[];
  
  constructor(container: HTMLFormElement, events: IEvents) {
    super(container, events);

    this._paymentButtons = ensureAllElements<HTMLButtonElement>('.button_alt', container);

    this._paymentButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.payment = button.name;
        this.onInputChange('payment', button.name);
      })
    })
  }

  set payment(name: string) {
    this._paymentButtons.forEach(button => {
      button.classList.toggle('button_alt-active', button.name === name);
      this.setDisabled(button, button.name === name)
    })
  }

  set address(value: string) {
    (this.container.elements.namedItem('address') as HTMLInputElement).value = value;
  }

  resetForm(): void {
    super.resetForm()
    this._paymentButtons.forEach(button => {
      button.classList.remove('button_alt-active');
      this.setDisabled(button, false)
    })
  }
}
