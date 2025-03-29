# Проектная работа "Веб-ларек"
### https://github.com/94R1K/web-larek-frontend.git

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```

## 🧾 Применяемые данные и интерфейсы

### Интерфейс продукта
```ts
export interface IProductStatus {
  inBasket: boolean;
}
```

```ts
export interface IProductItem {
  id: string;
  title: string;
  description: string;
  image: string;
  category: 'софт-скил' | 'хард-скил' | 'кнопка' | 'дополнительное' | 'другое';
  price: number | null
}
```

**Интерфейс заказа**
```ts
export interface IOrder {
  payment: 'cash' | 'card';
  email: string;
  phone: string;
  address: string;
  total: number;
  items: string[];
}
```

**Интерфейс для хранения состояния приложения**
```ts
export interface IAppState {
  catalog: IProduct[];
  basket: string[];
  preview: string | null;
  order: IOrder | null;
}
```

**Данные товара для отображения в корзине**
```ts
export type TBasketProduct = Pick<IProduct, '_title' | '_price' | '_id' | 'inBasket'>;
```

**Информация о заказе, получаемая из модальной формы (адрес и способ оплаты)**
```ts
export interface IOrderInfoForm {
	payment: 'cash' | 'card' | null;
	address: string;
}
```

**Данные пользователя, вводимые в модальном окне (email и телефон)**
```ts
export interface IContactForm {
	email: string;
	phone: string;
}
```

**Тип для формирования ошибок при проверке полей заказа**
```ts
export type FormErrors = Partial<Record<keyof IOrder, string>>;
```

**Результат, возвращаемый сервером после успешного оформления заказа**
```ts
export type TOrderResult = {
  id: string;
  total: number;
}
```
---

## Архитектура приложения

Приложение организовано по принципу MVP, разделяясь на три основных уровня:

- **View** – отвечает за визуальное представление информации на странице.
- **Model** – занимается хранением и изменением данных.
- **Presenter** – служит связующим звеном между представлением и данными.

### Базовый код

### Класс Api

Этот класс реализует базовую логику для выполнения HTTP-запросов.

**Конструктор:**
- `constructor(baseUrl: string, options: RequestInit = {})` — принимает базовый URL и, опционально, глобальные настройки для запросов.

**Поля:**
- `readonly baseUrl: string` — базовый адрес сервера.
- `protected options: RequestInit` — объект с дополнительными заголовками для запросов.

**Методы:**
- `protected handleResponse(response: Response): Promise<object>` — обрабатывает ответ от сервера.
- `get(uri: string)` — выполняет GET-запрос по указанному эндпоинту и возвращает промис с данными ответа.
- `post(uri: string, data: object, method: ApiPostMethods = 'POST')` — отправляет данные в формате JSON на указанный эндпоинт; по умолчанию используется метод POST, но его можно изменить, передав третий параметр.

#### Класс EventEmitter

Этот класс предназначен для управления событиями – регистрации, отправки и отмены подписок. Он применяется как в презентере, так и в других слоях приложения.

**Поля:**
- `_events: Map<EventName, Set<Subscriber>>` — структура для хранения событий, где ключ может быть строкой или регулярным выражением, а значение – набор функций-обработчиков.

**Основные методы (согласно интерфейсу IEvents):**
- `on<T extends object>(eventName: EventName, callback: (event: T) => void)` — назначает обработчик для указанного события.
- `emit<T extends object>(eventName: string, data?: T)` — инициирует событие с заданными данными.
- `trigger<T extends object>(eventName: string, context?: Partial<T>)` — возвращает функцию, которая при вызове инициирует соответствующее событие.

**Дополнительные методы:**
- `off(eventName: EventName, callback: Subscriber)` — убирает обработчик с события.
- `onAll(callback: (event: EmitterEvent) => void)` — подписывается на все события.
- `offAll()` — отменяет подписки на все события.

---

## Слой данных – Model

### Класс Model

Это абстрактный класс, содержащий общие свойства и методы для всех моделей данных.

**Конструктор:**
- `constructor(data: Partial<T>, protected events: IEvents)` — принимает объект с начальными данными и экземпляр EventEmitter для уведомления об изменениях.

**Поля:**
- Копия всех свойств, переданных через объект данных.
- `events: IEvents` — менеджер событий для оповещений.

**Метод:**
- `emitChanges(event: string, payload?: object)` — уведомляет подписчиков о том, что модель была изменена.

### Класс AppState

Этот класс отвечает за хранение состояния приложения и наследуется от Model.

**Поля:**
- `products: IProduct[]` — список всех товаров.
- `basket: TBasketProduct[]` — данные о товарах, добавленных пользователем в корзину.
- `order: IOrder | null` — информация о заказе.
- `preview: string | null` — ID товара для предварительного просмотра в модальном окне.
- `formErrors: FormErrors | null` — ошибки, возникшие при заполнении данных для заказа.

**Методы:**
- `setProducts(items: IProduct[]): void` — задаёт список товаров и инициирует событие обновления.
- `setPreview(item: IPtoduct): void` — устанавливает товар для предварительного просмотра и генерирует событие.
- `getProductById(productId: string): IProduct` - принимает в аргументы ID продукта и возращает товара.
- `addProductInBasket(product: IProduct): void` — добавляет товар в корзину и сообщает об этом через событие.
- `removeProductFromBasket(product: IProduct): void` — удаляет товар из корзины, инициируя событие.
- `clearBasket(): void` — очищает корзину.
- `clearOrder(): void ` - очищает данные о заказе
- `clearErrors(): void` - очищает сообщения об ошибках форм
- `getTotal(): number` — рассчитывает общую стоимость товаров в корзине.
- `setOrderBasket()` - устанавливает данные о заказанных товарах и сумме покупок в `order`.
- `setOrderField(field: keyof IOrderForm, value: string): void` — обновляет указанное поле заказа.
- `validateOrder(): boolean` — проверяет, заполнены ли все необходимые данные для оформления заказа.

---

## Слой представления – View

Классы этого уровня отвечают за отображение информации на странице.

### Класс View

Абстрактный класс, содержащий базовые свойства и методы для создания визуальных компонентов.

**Конструктор:**
- `protected constructor(protected readonly container: HTMLElement` - принимает DOM-элемент контейнер.

**Поля:**
- `protected readonly container: HTMLElement` — контейнер для рендеринга и объект для работы с событиями.

**Методы:**
- `protected setText(element: HTMLElement, value: unknown): void` — устанавливает текстовое содержимое элемента.
- `protected setImage(element: HTMLImageElement, src: string, alt?: string): void` — задаёт изображение с альтернативным текстом.
- `setDisabled(element: HTMLElement, state: boolean): void` - сменить статус блокировки.
- `render(data?: Partial<T>): HTMLElement` — возвращает DOM-элемент, заполненный переданными данными.

### Класс Modal

Класс для управления модальными окнами, который наследуется от View.

- `constructor(container: HTMLElement, protected events: IEvents)` - конструктор наследуется от абстрактного класса View, а также принимает экземпляр класса EventEmmiter.

**Поля:**
- `container: HTMLElement` — элемент модального окна.
- `protected _content: HTMLElement` — содержимое, выводимое внутри модального окна.
- `protected_closeButton: HTMLButtonElement` — кнопка для закрытия окна.
- `events: IEvents` — менеджер событий.

**Методы:**
- `set content(value: HTMLElement)` — задаёт содержимое модального окна.
- `open(): void` — делает окно видимым на странице.
- `close(): void` — скрывает окно.
- `closeByEsc(evt: KeyboardEvent)` - отвечает за закрытие модального окна нажатием на клавишу `Esc`
- `render(data: IModalData): HTMLElement` — расширяет метод render базового класса, возвращая заполненный данными корневой элемент модального окна.

### Класс Form

Предназначен для реализаци форм для вывода в модальном окне. Класс наследуется от абстрактного класса View.

- `constructor(container: HTMLElement, protected events: IEvents)` - конструктор наследуется от абстрактного класса View, а также принимает экземпляр класса EventEmmiter.

**Поля:**
- `container: HTMLFormElement` — HTML-форма.
- `protected _submit: HTMLButtonElement` — кнопка отправки формы.
- `protected _errors: HTMLElement` — элемент для отображения ошибок.

**Методы:**
- `onInputChange(field: keyof T, value: string)` - инициирует событие изменения инпутов.
- `set valid(value: boolean)` — включает или отключает кнопку отправки.
- `set error(data: (value: string) => void)` — выводит сообщение об ошибке.
- `resetForm(): void` — очищает все поля ввода.
- `render(state: Partial<T> & IFormState)` - наследует и расширяет родительский метод отрисовки элемента.

### Класс OrderInfoForm

Необходим для реализации контента модального окна с данными о оплате и адресе доставки заказа. Является дочерним от класса Form.

Конструктор наследуется от абстрактного класса родительского класса Form.

**Поля:**
- `container: HTMLFormElement` — HTML-форма.
- `protected _submit: HTMLButtonElement` — кнопка подтверждения формы.
- `protected _errors: HTMLElement` — область для вывода ошибок.
- `protected _paymentButtons: HTMLButtonElement[];` - массив элементов кнопок выбора оплаты.

**Методы:**
- `set address(value: string)` - устанавливает значение в поле адреса.
- `set payment(name: string)` - переключает выбранную пользователем кнопку выбора способа оплаты.
- `resetForm(): void` - наследует родительский клас - очищает поля формы и убирает выделение с кнопки.

#### Класс ContactsForm
Необходим для реализации контента модального окна с данными о контактах пользователя. Является дочерним от класса Form.

Конструктор наследуется от абстрактного класса родительского класса Form.

Методы:
- `set phone(value: string)` - устанавливает данные в input `phone`.
- `set email(value: string)` - устанавливает данные в input `email`.

### Класс Basket

Отвечает за отображение корзины с товарами в модальном окне. Класс наследуется от абстрактного класса View.

- `constructor(container: HTMLElement, protected events: IEvents)` - конструктор наследуется от абстрактного класса View, а также принимает экземпляр класса EventEmmiter

**Поля:**
- `container: HTMLElement` — контейнер корзины.
- `protected _items: HTMLElement[]` — массив элементов для вывода товаров.
- `protected _list: HTMLElement` — элемент списка выбранных товаров.
- `protected _total: HTMLElement` — элемент, демонстрирующий итоговую стоимость.
- `protected _button: HTMLElement` — кнопка для оформления заказа.

**Методы:**
- `set itemsList(items: HTMLElement[])` — заполняет список корзины элементами.
- `set total(total: number)` — обновляет значение итоговой суммы.

### Класс Success

Класс, отвечающий за показ сообщения об успешном оформлении заказа в модальном окне, наследуется от View.

- `constructor(container: HTMLElement, actions: ISuccessActions)` - конструктор наследуется от абстрактного класса View, а также принимает вторым аргументом объект с обработчиком клика кнопки закрытия окна подтверждения успешного заказа.

**Поля:**
- `container: HTMLElement` — корневой DOM-элемент.
- `protected _button: HTMLButtonElement` — кнопка завершения.
- `protected _total: HTMLElement` - сообщение о списании суммы.

**Методы:**
- `set total(text:string)` - устанавливает текст сообщения о списании стоимости товаров.

### Класс Page
Отвечает за главную страницу сайта. Наследуется от абстрактного класса View.

-`constructor(container: HTMLElement, events: IEvents)` - конструктор наследуется от абстрактного класса View, а также принимает экземпляр класса EventEmmiter.

Поля:
- `protected _counter: HTMLElement` - счетчик товаров в корзине.
- `protected _gallery: HTMLElement` - список товаров для покупки.
- `protected _wrapper: HTMLElement` - контейнер-обертка страницы.
- `protected _basket: HTMLElement` - кнопка перехода в корзину.

Методы:
- `set counter(value: number)` - устанавливает контент счетчика.
- `set gallery(items: HTMLElement[])` - устанавливает контент галереи.
- `set locked(value: boolean)` - отвечает за блокировку прокрутки страницы при открытии модального окна.

### Класс Сard

Класс, предназначенный для отображения карточки товара как на главной странице, так и в модальном окне с детальной информацией или в списке корзины, наследуется от View.

- `constructor(protected blockName: string, container: HTMLElement, actions?: ICardActions)` - конструктор наследуется от абстрактного класса View, а также принимает первым аргументом имя блолка и третьим, необязательным - объект с обработчиком клика по карточке товара.

**Поля:**
- `container: HTMLElement` — DOM-элемент карточки.
- `events: IEvents` — менеджер событий.
- `protected _id: string` — идентификатор товара.
- `protected _title: HTMLElement` — заголовок карточки.
- `protected _category: HTMLElement` — категория товара.
- `protected _image: HTMLImageElement` — изображение товара.
- `protected _price: HTMLSpanElement` — отображение цены.

**Методы:**
- `set id(value: string)` — присваивает значение идентификатора.
- `get id(): string` — возвращает идентификатор.
- `set title(value: string)` — устанавливает заголовок.
- `get title(): string` — получает заголовок.
- `set price(value: string)` — задаёт цену.
- `get price(): string` — возвращает цену.
- `set category(value: string)` — обновляет информацию о категории.
- `set image(value: string)` — задаёт изображение товара.

### Класс CardPreview

Дочерний класс от Card, отвечающий за показ карточки товара в модальном окне.

- `constructor(container: HTMLElement, actions?: ICardActions)` - конструктор наследуется от родительского класса и принимает в аргументы опциональный аргумент - действие при клике на кнопку покупки товара.

**Поля:**
- `container: HTMLElement` — элемент карточки.
- `events: IEvents` — менеджер событий.
- `protected _id: string` — идентификатор товара.
- `protected _title: HTMLElement` — заголовок.
- `protected _category: HTMLElement` — категория товара.
- `protected _image: HTMLImageElement` — изображение.
- `protected _price: HTMLSpanElement` — цена.
- `protected _description: HTMLElement` — описание товара.
- `protected _button: HTMLButtonElement` — кнопка для добавления товара в корзину.

**Методы:**
- `cheсkProduct(id: string): string` — проверяет стоимость товара и его наличие в корзине, возвращая соответствующий текст для кнопки.
- `setButtonContent(content: string): void` — устанавливает текст кнопки.
- `set description(value: string | string[])` — задаёт или обновляет описание товара.
- `set inBasket(value: boolean)` - устанавливает значение поля кнопки.
- `set price(value: number)` - устанавливает значение цены, блокирует кнопку, если товар бесценен.
- `disabledButton()` - блокирует кнопку покупки бесценного товара.

### Класс CardBasket

Дочерний от Card класс, предназначенный для отображения товара в списке корзины.

- `constructor(container: HTMLElement, actions?: ICardActions)` - конструктор наследуется от родительского класса и принимает в аргументы опциональный аргумент - действие при клике на кнопку удаления товара из корзины.

Дополнительно содержит:
- `_button: HTMLButtonElement` - кнопка удаления из корзины.
- `index: HTMLElement` — порядковый номер товара в списке.

**Методы:**
- `setIndex` — устанавливает индекс товара в корзине.
---

## Слой коммуникации

### Класс AppApi

Этот класс расширяет функциональность базового Api и отвечает за взаимодействие с сервером.

- `constructor(cdn: string, baseUrl: string, options?: RequestInit)` - конструктор наследуется от базового класса Api, а также принимает адрес для получения изображения товаров.

Поля наследуется от базового класса Api, а также включает поле:
- `readonly cdn: string` - адрес для получения изображения товаров.

**Методы:**
- `getProductsList(): Promise<IProduct[]>` — возвращает промис с массивом всех товаров, полученных с сервера.
- `getProduct(id: string): Promise<IProduct>` — получает данные о товаре по его идентификатору.
- `postOrder(order: IOrder): Promise<TOrderResult>` — отправляет информацию о заказе на сервер для оформления.

---

## Взаимодействие слоев

Логика связи между представлением и данными описана в файле `index.ts`, который выполняет роль презентера. Сначала создаются все необходимые экземпляры классов, а затем настраивается обработка событий с использованием EventEmitter.

**Перечень событий, генерируемых в системе:**

**События, связанные с изменением данных (от моделей):**
- `products:changed` - изменение каталога товаров.
- `basket:changed` - изменения списка товаров в корзине.
- `preview:changed` - изменеие элемента, выбранного для превью.
- `order:ready` - заполнены все поля для оформления заказа.
- `formErrors:change` - изменился объект, хранящий данные об ошибках.

**События, возникающие при взаимодействии пользователя с интерфейсом (от представлений):**
- `card:select` — выбор карточки для просмотра в модальном окне.
- `card:open` — открытие модального окна с информацией о товаре.
- `card:add` — добавление товара в корзину.
- `card:remove` - удаление товара из корзины.
- `basket:open` - открытие модального окна с корзиной.
- `basket:submit` — отправка заказа из корзины при нажатии кнопки «Оформить».
- `orderInfo:open` — показ модального окна с информацией о заказе.
- `/^order\..*:change/` - изменение данных в форме информации о заказе.
- `/^contacts\..*:change/` - изменение данных в форме контактов пользователя.
- `order:submit` - закрытие модального окна с информацией о пользователе при нажатии на кнопку «Далее».
- `contacts:submit` - закрытие модального окна с информацией о пользователе при нажатии на кнопку «Далее».
- `order:success` - успешное оформление заказа.
- `modal:open` - открытие модального окна.
- `modal:close` — закрытие модального окна при нажатии на крестик, клавишу Esc или клике по затемнённому оверлею.
