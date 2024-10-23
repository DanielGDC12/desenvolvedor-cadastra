
export interface CreateElement {
    tag: string;
    classes?: string[];
    children?: Array<string | CreateElement>;
    attributes?: any;
    events?: any;
  }

export default function createElement(element: Element | CreateElement)  {
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