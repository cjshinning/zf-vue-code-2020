import { parseHTML } from './parser-html';
import { generate } from './generate';
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