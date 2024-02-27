import { parseHTML } from './parser-html';
// 匹配 {{ }} 表达式
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

/**
 * 处理属性 拼接成属性的字符串
 * @param {*} attrs 
 * @returns 
 */
function genProps(attrs) {
  let str = '';
  for (let i = 0; i < attrs.length; i++) {
    let attr = attrs[i];
    if (attr.name === 'style') {
      // style="color: red;" => {style:{color:'red'}}
      let obj = {};
      attr.value.split(';').forEach(item => {
        let [key, value] = item.split(':');
        obj[key] = value;
      })
      attr.value = obj;
    }
    str += `${attr.name}:${JSON.stringify(attr.value)},`
  }
  return `{${str.slice(0, -1)}}`;
}

function genChildren(el) {
  let children = el.children;
  if (children && children.length > 0) {
    return `${children.map(c => gen(c)).join(',')}`
  } else {
    return false;
  }
}

function gen(node) {
  if (node.type == 1) {
    // 元素标签
    return generate(node);
  } else {
    let text = node.text; // <div>a {{  name}} b {{age}} c</div>
    let tokens = [];
    let match, index;
    let lastIndex = defaultTagRE.lastIndex = 0;
    while (match = defaultTagRE.exec(text)) {
      index = match.index;
      if (index > lastIndex) {
        tokens.push(JSON.stringify(text.slice(lastIndex, index)));
      }
      tokens.push(`_s(${match[1].trim()})`);
      lastIndex = index + match[0].length;
    }
    if (lastIndex < text.length) {
      tokens.push(JSON.stringify(text.slice(lastIndex)))
    }
    // _v("a" + _s(name) + "b" + _s(age) + "c")

    return `_v(${tokens.join('+')})`;
  }
}

function generate(el) {
  let children = genChildren(el);
  let code = `_c("${el.tag}",${el.attrs.length ? genProps(el.attrs) : 'undefined'
    }${children ? `,${children}` : ''
    })`;

  return code;
}

export function compileToFunction(template) {
  let root = parseHTML(template);

  let code = generate(root);

  // 核心思想就是将模板转换成 下面这段字符串
  // <div id="app"><p>hello {{ name }}</p></div>
  // 将ast再次转成js语法
  // _c("div", { id: app }, _c("p", undefined, _v('hello' + _s(name)), _v('hello')))

  // 所有的模板引擎实现 都需要new Function + with
  // 模板引擎的原理：1.拼接字符串 2.增加with 3.new Function
  let renderFn = new Function(`with(this){return ${code}}`)
  return renderFn;
}

/**
 * ast语法树
 * 
start div: attrs:[{name:'id',value:'app'}]
start p
text hello
end p
end div 

<div id="app">
  <p>hello</p>
</div>

let root = {
  tage: 'div',
  attrs: [{ name: id, value: 'app' }],
  parent: null,
  type: 1,
  children: [
    {
      tag: 'p',
      attrs: [],
      parent: root,
      type: 1,
      children: [
        {
          text: 'hello',
          type: 3
        }
      ]
    }
  ]
}
 */

/**
 * 虚拟dom
 * 
<div id="app">
  <p>{{name}}</p>
  <span>{{age}}</span>
</div>

render(){
  return _c('div',{id:'app'},_c('p',undefiend,_v(_s(name))),_c('span',undefiend,_v(_s(age))))
}
 */