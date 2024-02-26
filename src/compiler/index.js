import { parseHTML } from './parser-html';

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

function generate(el) {
  let code = `_c("${el.tag}",${el.attrs.length ? genProps(el.attrs) : 'undefined'
    })
  
  `;

  return code;
}

export function compileToFunction(template) {
  let root = parseHTML(template);
  console.log(root);

  let code = generate(root);
  console.log(code);

  // 核心思想就是将模板转换成 下面这段字符串
  // <div id="app"><p>hello {{ name }}</p></div>
  // 将ast再次转成js语法
  // _c("div", { id: app }, _c("p", undefined, _v('hello' + _s(name)), _v('hello')))

  return function render() {

  }
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