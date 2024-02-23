// ast语法树：用对象来描述原生语法  
// 虚拟dom：用对象来描述dom节点
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;  //标签名
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;  //用来获取的标签名的match的索引为1的
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 匹配开始标签的
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配闭合标签的
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;  //匹配属性
// 匹配标签结束的 >
const startTagClose = /^\s*(\/?)>/;
// 匹配 {{ }} 表达式
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

export function compileToFunction(template) {
  console.log(template, '---')
}

/**
 * ast语法树
 * 
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