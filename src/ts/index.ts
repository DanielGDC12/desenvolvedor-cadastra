import { CreateElement,Product } from "./types";
const serverUrl = "http://localhost:5000";

function main() {
  console.log(serverUrl);
  getProductData()
}

document.addEventListener("DOMContentLoaded", main);

export function formatPrice(price: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price)
}


function createElement(element: Element | CreateElement)  {
  if (element instanceof Element) {
    return element
  } else {
    const tagName = element.tag
    const attributes = element?.attributes ?? {}
    const events = element?.events ?? {}
    const classes = element?.classes
    const children = element?.children ?? []

    // Constrói os filhos de maneira recursiva
    const $children = children.map((child) => {
      if (typeof child === 'string') {
        return child
      } else {
        return createElement(child)
      }
    })

    const $element = document.createElement(tagName)
    for (const attrName in attributes) {
      $element.setAttribute(attrName, attributes[attrName])
    }
    for (const eventName in events) {
      $element.addEventListener(eventName, events[eventName])
    }
    classes && $element.classList.add(...classes)
    $element.append(...$children)

    return $element
  }
}

async function getProductData(){
 

  await fetch('http://localhost:5000/products')
  .then(rawData => rawData.json())
  .then((data:Product[]) => {
    console.log(data)
    const colors = [...new Set(data.map((product) => product.color))]
    const sizes = [...new Set(data.map((product) => product.size[0]))]
    const price = [
      "de R$:0 até R$50",
      "de R$:51 até R$150",
      "de R$:151 até R$300",
      "de R$:301 até R$500",
      "a partir de R$500",
    ]

    const colorFilter = createFilter(colors,'Cores')
    const sizeFilter = createFilter(sizes,'Tamanhos',true)
    const priceFilter = createFilter(price,"Faixa de preço")
    const products = data.map((product) => {
      const productListItem  = createProductCardElement(product)

      return productListItem
    })

    renderProducts(products)
    renderFilters([colorFilter,sizeFilter,priceFilter])
  })
}


function createProductCardElement(product:Product) { 

  const {color,date,id,image,name,parcelamento,price,size} = product

  const element = createElement({
    tag:"li",
    children:[
      {
        tag:"img",
        classes:["productImage"],
        attributes:{
          "src":`${image}`,
          "alt":`${name}`,
          "title":`${name}`
        }
      },
      {
        tag:"p",
        classes:["productName"],
        children:[`${name}`]
      },
      {
        tag:"div",
        classes:['productpriceContainer'],
        children:[
          {
            tag:"p",
            classes:["productPrice"],
            children:[`${formatPrice(price)}`]
          },
          {
            tag:"p",
            classes:["productInstallment"],
            children:[`até ${parcelamento[0]}x de ${formatPrice(parcelamento[1])}`]
          }
        ]
      },
      {
        tag:"button",
        classes:["addToCart"],
        children:["Comprar"]
      }
    ],
    classes:["searchResultListItem"]
  })

  return element
}

function renderProducts(products:Element[]){
  const $resultListWrapper= document.querySelector<HTMLElement>('.searchResultList')
  if(!$resultListWrapper) return;

  products.forEach(product => {
    $resultListWrapper.appendChild(product)
  })
}

function renderFilters(filters:Element[]) {
  const $aside = document.querySelector('.searchResultWrapper aside')
  if(!$aside) return;

  filters.forEach((filter) => {
    $aside.appendChild(filter)
  })

}

function createFilter(filterOptions:string[],title:string,isSizeFilter?:boolean) {


  const sizeFilterItems = filterOptions.map((size) => {

    return {
      tag:"li",
      classes:['filterOptionSizeListItem'],
      children:[`${size}`],
      attributes:{
        "role":"button"
      }
    }
  })

  const defaultFilterItems = filterOptions.map((filterOption) => {
    return {
       tag:"li",
       classes:["filterOptionItem"],
       children:[{
        tag:"input",
        classes:["checkBoxOption"],
        attributes:{
          "type":"checkbox",
          "name":`${filterOption}-option`,
          "id":`${filterOption}-option`
        }
       },{
        tag:"label",
        children:[`${filterOption}`],
        attributes:{
          "for":`${filterOption}-option`
        }
       }],
    }
  })

  const filter = createElement({
    tag:'details',
    classes:['filterDefault','sizeFilter'],
    attributes:{
      "open":true,
    },
    children:[{
      tag:"summary",
      children:[`${title}`],
      classes:["filterTitle"]
    },{
      tag:"ul",
      classes:["filterOptionList",`${isSizeFilter && "filterSizeList"}`],
      children: isSizeFilter ? sizeFilterItems : defaultFilterItems
    }]
  })


  return filter
}

