
export interface CreateElement {
    tag: string;
    classes?: string[];
    children?: Array<string | CreateElement>;
    attributes?: any;
    events?: any;
  }

  export interface Product {
    id: string;
    name: string;
    price: number;
    parcelamento: Array<number>;
    color: string;
    image: string;
    size: Array<string>;
    date: string;
  }
  
  