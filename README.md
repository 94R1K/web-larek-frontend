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
export interface IProduct {
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
export type TBasketProduct = Pick<IProduct, '_title' | '_price' | '_id'>;
```

**Информация о заказе, получаемая из модальной формы (адрес и способ оплаты)**
```ts
export type TOrderInfo = Pick<IOrder, 'payment' | 'address'>;
```

**Данные пользователя, вводимые в модальном окне (email и телефон)**
```ts
export type TUserInfo = Pick<IOrder, 'email' | 'phone'>;
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
- `formErrors: FormErrors` — ошибки, возникшие при заполнении данных для заказа.

**Методы:**
- `setProducts(items: IProduct[]): void` — задаёт список товаров и инициирует событие обновления.
- `setPreview(item: LotItem): void` — устанавливает товар для предварительного просмотра и генерирует событие.
- `getPreviewProduct(productId: string): IProduct` — возвращает данные о товаре по его ID.
- `addProductInBasket(product: IProduct): void` — добавляет товар в корзину и сообщает об этом через событие.
- `removeProductFromBasket(product: IProduct): void` — удаляет товар из корзины, инициируя событие.
- `clearBasket(): void` — очищает корзину.
- `getTotal(): number` — рассчитывает общую стоимость товаров в корзине.
- `setOrderField(field: keyof IOrderForm, value: string): void` — обновляет указанное поле заказа.
- `validateOrder(): boolean` — проверяет, заполнены ли все необходимые данные для оформления заказа.

---

## Слой представления – View

Классы этого уровня отвечают за отображение информации на странице.

### Класс View

Абстрактный класс, содержащий базовые свойства и методы для создания визуальных компонентов.

**Конструктор:**
- `protected constructor(protected readonly container: HTMLElement, protected events: IEvents)` — принимает DOM-контейнер и менеджер событий.

**Поля:**
- `protected readonly container: HTMLElement` — контейнер для рендеринга и объект для работы с событиями.

**Методы:**
- `protected setText(element: HTMLElement, value: unknown): void` — устанавливает текстовое содержимое элемента.
- `setDisabled(element: HTMLElement, state: boolean): void` — меняет состояние блокировки элемента.
- `protected setImage(element: HTMLImageElement, src: string, alt?: string): void` — задаёт изображение с альтернативным текстом.
- `render(data?: Partial<T>): HTMLElement` — возвращает DOM-элемент, заполненный переданными данными.

### Класс ModalView

Класс для управления модальными окнами, который наследуется от View.

**Поля:**
- `container: HTMLElement` — элемент модального окна.
- `protected _content: HTMLElement` — содержимое, выводимое внутри модального окна.
- `protected_closeButton: HTMLButtonElement` — кнопка для закрытия окна.
- `events: IEvents` — менеджер событий.

**Методы:**
- `set content(value: HTMLElement)` — задаёт содержимое модального окна.
- `open(): void` — делает окно видимым на странице.
- `close(): void` — скрывает окно.
- `render(data: IModalData): HTMLElement` — расширяет метод render базового класса, возвращая заполненный данными корневой элемент модального окна.

### Класс Form

Класс для создания форм в модальных окнах, основанный на View.

**Поля:**
- `container: HTMLFormElement` — HTML-форма.
- `protected _submit: HTMLButtonElement` — кнопка отправки формы.
- `protected _errors: HTMLElement` — элемент для отображения ошибок.

**Методы:**
- `set valid(value: boolean)` — включает или отключает кнопку отправки.
- `getInputValues(): Record<string, string>` — возвращает объект с данными, введёнными в форму.
- `set error(data: (value: string) => void)` — выводит сообщение об ошибке.
- `resetForm(): void` — очищает все поля ввода.
- `onInputChange(field: keyof T, value: string)` — инициирует событие изменения значения в форме.

### Класс FormOrder

Класс, реализующий форму для ввода данных об оплате и адресе доставки, наследуется от Form.

**Поля:**
- `container: HTMLFormElement` — HTML-форма.
- `protected _submit: HTMLButtonElement` — кнопка подтверждения формы.
- `protected _errors: HTMLElement` — область для вывода ошибок.
- `protected buttonOnline: HTMLButtonElement;` — кнопка для выбора онлайн-оплаты.
- `protected buttonСash: HTMLButtonElement` — кнопка для оплаты при получении.
- `protected inputAddress: HTMLInputElement` — поле для ввода адреса.

**Методы:**
- `setSelected(name: string): void` — выделяет выбранную пользователем кнопку.
- `toggleClass(element: HTMLElement, className: string, force?: boolean): void` — переключает наличие указанного класса у элемента.
- `resetSelested(name: string): void` — убирает выделение с кнопки.

### Класс BasketView

Отвечает за отображение содержимого корзины в модальном окне.

**Поля:**
- `container: HTMLElement` — контейнер корзины.
- `protected _items: HTMLElement[]` — массив элементов для вывода товаров.
- `protected _list: HTMLElement` — элемент списка выбранных товаров.
- `protected _total: HTMLElement` — элемент, демонстрирующий итоговую стоимость.
- `protected _button: HTMLElement` — кнопка для оформления заказа.

**Методы:**
- `set itemsList(items: HTMLElement[])` — заполняет список корзины элементами.
- `set total(total: number)` — обновляет значение итоговой суммы.
- `isEmpty(): boolean` — проверяет, содержит ли корзина товары.

### Класс Success

Класс, отвечающий за показ сообщения об успешном оформлении заказа в модальном окне, наследуется от View.

**Поля:**
- `container: HTMLElement` — корневой DOM-элемент.
- `protected _button: HTMLButtonElement` — кнопка завершения.
- `protected _totalMessage: HTMLElement` — элемент для отображения сообщения о списании средств.

**Методы:**
- `set totalMessage(text: string)` — задаёт текст, информирующий о сумме списания.

### Класс Сard

Класс, предназначенный для отображения карточки товара как на главной странице, так и в модальном окне с детальной информацией или в списке корзины, наследуется от View.

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

### Класс CardBasket

Дочерний от Card класс, предназначенный для отображения товара в списке корзины.

Дополнительно содержит:
- `deleteButton: HTMLButtonElement` — кнопка для удаления товара из корзины.
- `index: HTMLElement` — порядковый номер товара в списке.

**Методы:**
- `setIndex` — устанавливает индекс товара в корзине
---

## Слой коммуникации

### Класс AppApi

Этот класс расширяет функциональность базового Api и отвечает за взаимодействие с сервером.

**Методы:**
- `getProductsList(): Promise<IProduct[]>` — возвращает промис с массивом всех товаров, полученных с сервера.
- `getProduct(id: string): Promise<IProduct>` — получает данные о товаре по его идентификатору.
- `postOrder(order: IOrder): Promise<TOrderResult>` — отправляет информацию о заказе на сервер для оформления.

---

## Взаимодействие слоев

Логика связи между представлением и данными описана в файле `index.ts`, который выполняет роль презентера. Сначала создаются все необходимые экземпляры классов, а затем настраивается обработка событий с использованием EventEmitter.

**Перечень событий, генерируемых в системе:**

**События, связанные с изменением данных (от моделей):**
- `products: changed` — изменение каталога товаров.
- `basket: changed` — обновление списка товаров в корзине.

**События, возникающие при взаимодействии пользователя с интерфейсом (от представлений):**
- `card:select` — выбор карточки для просмотра в модальном окне.
- `card:open` — открытие модального окна с информацией о товаре.
- `card:add` — добавление товара в корзину.
- `card:delete` — удаление товара из корзины.
- `basket:open` — отображение модального окна с содержимым корзины.
- `basket:close` — закрытие окна корзины.
- `basket:submit` — отправка заказа из корзины при нажатии кнопки «Оформить».
- `orderInfo:open` — показ модального окна с информацией о заказе.
- `cash:selected` — выбор способа оплаты наличными.
- `online:selected` — выбор онлайн-оплаты.
- `orderInfo:input` — изменение данных в форме заказа.
- `orderInfo:submit` — закрытие модального окна с информацией о пользователе при нажатии «Далее» с переходом к форме заказа.
- `orderInfo:validation` — событие, сигнализирующее о необходимости проверки формы с информацией о заказе.
- `userInfo:input` — изменение данных адреса в форме пользователя.
- `userInfo:submit` — закрытие модального окна с данными пользователя при нажатии «Далее».
- `userInfo:validation` — событие, указывающее на необходимость валидации формы с информацией о пользователе.
- `orderSubmit:open` — открытие окна с подтверждением успешного оформления заказа.
- `orderSubmit:submit` — закрытие окна с успешным оформлением заказа по нажатию кнопки «За новыми покупками».
- `modal:close` — закрытие модального окна при нажатии на крестик, клавишу Esc или клике по затемнённому оверлею.
