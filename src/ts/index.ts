import { CreateElement,Product } from "./types";
const serverUrl = "http://localhost:5000";

let globalFitlersVal:any;

function main() {
  handleProductInfo()
  handleOrderVisibility()
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

async function handleProductInfo(){
  await fetch('http://localhost:5000/products')
  .then(rawData => rawData.json())
  .then((data:Product[]) => {
    const colors = [...new Set(data.map((product) => product.color))]
    const sizes = [...new Set(data.map((product) => product.size[0]))]
    const price = [
      "de R$:0 até R$50",
      "de R$:51 até R$150",
      "de R$:151 até R$300",
      "de R$:301 até R$500",
      "a partir de R$500",
    ]
    const products = data.map((product) => {
      const productListItem  = createProductCardElement(product)

      return productListItem
    })
  const productsSliced = products.slice(0,9)
    const colorFilter = createFilter(colors,'Cores')
    const sizeFilter = createFilter(sizes,'Tamanhos',true)
    const priceFilter = createFilter(price,"Faixa de preço")
    renderProducts(productsSliced)
    loadMoreProducts(data)
    handleFiltersSelect(data)
    renderFilters([colorFilter,sizeFilter,priceFilter])
    handleChooseOrder(data)
    // handleFilters(data)

    
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
  const $resultListWrapper = document.querySelector<HTMLElement>('.searchResultList')
  if(!$resultListWrapper) return;
  $resultListWrapper.innerHTML = ''
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
        "role":"button",
          "dataId":`${size}`,
          "filter-type":`${title}`
      }
    }
  })

  const defaultFilterItems = filterOptions.map((filterOption) => {
    return {
       tag:"li",
       classes:["filterOptionItem"],
       attributes:{
        "dataId":`${filterOption}`,
         "filter-type":`${title}`
       },
       children:[filterOption],
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

function handleFiltersSelect(products:Product[]){
  window.addEventListener('click',(event) => {
    const target = event.target as Element
    if(!target.classList.contains('filterOptionItem') && !target.classList.contains('filterOptionSizeListItem')) return;
    target.classList.toggle('checked')  


    const filterType = target.getAttribute('filter-type')
    const dataId = target.getAttribute('dataid')

    if(filterType === "Cores"){
      globalFitlersVal = [...products.filter((product) => product.color === dataId)].map(x => createProductCardElement(x))
    renderProducts(globalFitlersVal)
    }

  })  
}
function teste(a:any){
  console.log(a)
}

function loadMoreProducts(products:Product[]){
  const $loadMoreBtn = document.querySelector('.loadMoreBtn')
  if(!$loadMoreBtn) return;


  const productOrderByOption = {
    "Menor Preço": (() =>  orderByPriceAsc(products).map((product => createProductCardElement(product))))(),
    "Maior Preço": (() =>  orderByPriceDesc(products).map((product => createProductCardElement(product))))(),
    "Mais Recentes":(() => orderByReleaseDate(products).map((product => createProductCardElement(product))))()
  }


  $loadMoreBtn.addEventListener('click',(event) => {
      const orderOptionChoosed  = document.querySelector('.triggerSelected').textContent 
      const $totalItens = [...document.querySelectorAll('.searchResultList li')]
      if($totalItens.length  >= products.length)return hideLoadMoreContent();

      if(orderOptionChoosed === "Ordenar por:") {
        const defaultProducts = products.map((product) => createProductCardElement(product)).slice(0,$totalItens.length + 3)
        renderProducts(defaultProducts)
        return;
      }
      
      const newProducts = productOrderByOption[orderOptionChoosed as keyof typeof productOrderByOption].slice(0,$totalItens.length + 3)
      renderProducts(newProducts)
      return;
  })  
}

function hideLoadMoreContent() {
  const $loadMoreWrapper = document.querySelector('.loadMore')
  if(!$loadMoreWrapper) return;

  $loadMoreWrapper.setAttribute('style','display:none;')
}

function handleOrderVisibility() {
  const $trigger = document.querySelector('.orderTrigger')
  const $orderWrapper = document.querySelector('.searchResultOrderWrapper')
  $trigger.addEventListener('click',function() {
      $orderWrapper.classList.toggle('visible')
  })
}

function handleChooseOrder(products:Product[]) {
  const $orderOptions = [...document.querySelectorAll('.orderListItem')]
  const $triggerChoosed = document.querySelector('.orderTrigger .triggerSelected')
  const $orderOptionsList = document.querySelector('.searchResultOrderWrapper')
  



  const productOrderByOption = {
    "Menor Preço": (() =>  orderByPriceAsc(products).map((product => createProductCardElement(product))))(),
    "Maior Preço": (() =>  orderByPriceDesc(products).map((product => createProductCardElement(product))))(),
    "Mais Recentes":(() => orderByReleaseDate(products).map((product => createProductCardElement(product))))()
  }


  $orderOptions.forEach((orderOption) => {
    orderOption.addEventListener('click',function(){
      const textOption = this.textContent as keyof typeof productOrderByOption
      $triggerChoosed.textContent = textOption
      $orderOptionsList.classList.remove('visible')
      renderProducts(productOrderByOption[textOption].slice(0,9))
      removeFilters()
    })
  })
}

function  orderByPriceAsc (products:Product[])  {
  return products.sort((a,b) => a.price - b.price)
 }
 function orderByPriceDesc  (products:Product[])  {
   return products.sort((a,b) => b.price - a.price  )
 }

 function  orderByReleaseDate (products:Product[])  {
   return products.sort((a,b) =>   new Date(b.date).valueOf()- new Date(a.date).valueOf())
 }

function removeFilters() {
  const $filtersChecked = [...document.querySelectorAll('.filterOptionList .checked')]
  $filtersChecked.forEach((checked) => {
    checked.classList.remove('checked')
  })
}

// function handleFilters(data:Product[]) {
// const targetNode = document.querySelector('aside');

// const config = { attributes: true,subtree: true };

// const callback = (mutationList:MutationRecord[], ) => {
//   for (const mutation of mutationList) {
//     const target = mutation.target as Element
//     if(!target.classList.contains('filterOptionItem') && !target.classList.contains('filterOptionSizeListItem')) return;
//     getAllCheckedFilters(data)
//   }
// };

// const observer = new MutationObserver(callback);

// observer.observe(targetNode, config);

// }

// function getAllCheckedFilters(data:Product[]) {
//   const checkedFilters = [...document.querySelectorAll<HTMLElement>('.filterOptionItem.checked')]
//   const checkedSizes = [...document.querySelectorAll('.filterOptionSizeListItem.checked')]

//   const colorsOptions = handleFilterByAttribute(checkedFilters,"Cores")
//   const sizeOptions = handleFilterByAttribute(checkedSizes,"Tamanhos")

// } 

// function handleFilterByAttribute(elements:Element[],filterTypeName:string){
//   return elements.filter(element => {
//     const filterType = element.getAttribute('filter-type')
//     return filterType === filterTypeName
//   })
// }