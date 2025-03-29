import { IEvents } from "./base/Events";
import { IContactForm } from "../types";
import { Form } from "./common/Form";

export class ContactsForm extends Form<IContactForm> {

  constructor(container: HTMLFormElement, protected events: IEvents) {
    super(container, events);
  }

  set email(value: string) {
    (this.container.elements.namedItem('email') as HTMLInputElement).value = value;
  }

  set phone(value: string) {
    (this.container.elements.namedItem('phone') as HTMLInputElement).value = value;
  }
}
