export interface IProduct {
	id: string;
	title: string;
	description: string;
	image: string;
	price: number | null
	category: 'софт-скил' | 'хард-скил' | 'кнопка' | 'дополнительное' | 'другое';
}

export interface IOrder {
	payment: 'cash' | 'card';
	email: string;
	phone: string;
	address: string;
	total: number;
	items: string[];
}

export interface IAppState {
	catalog: IProduct[];
	basket: string[];
	preview: string | null;
	order: IOrder | null;
}

export type TOrderInfo = Pick<IOrder, 'payment' | 'address'>;
export type TUserInfo = Pick<IOrder, 'email' | 'phone'>;
export type FormErrors = Partial<Record<keyof IOrder, string>>;
export type TBasketProduct = Pick<IProduct, 'title' | 'price' | 'id'>;
export type TOrderResult = {
	id: string;
	total: number;
}
