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

function start(tagName, attrs) {
  console.log('开始标签：', tagName, '属性是：', attrs);
}
function chars(text) {
  console.log('文本是：', text);
}
function end(tagName) {
  console.log('结束标签：', tagName);
}
function parseHTML(html) {
  // 不停的解析html
  while (html) {
    let textEnd = html.indexOf('<');
    if (textEnd === 0) {
      // 如果当前索引为0，肯定是一个标签 开始标签 或 结束标签
      let startTagMatch = parseStartTag(); //通过这个方法获取到匹配的结果 tagName attrs
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs);
        continue; //如果开始标签匹配完毕 继续下一次匹配
      }
      let endTagMatch = html.match(endTag);
      if (endTagMatch) {
        advance(endTagMatch[0].length);
        end(endTagMatch[1]);
        continue;
      }
    }
    let text;
    if (textEnd >= 0) {
      text = html.substring(0, textEnd);
    }
    if (text) {
      advance(text.length);
      chars(text);
    }
  }
  function advance(n) {
    html = html.substring(n);
  }
  function parseStartTag() {
    let start = html.match(startTagOpen);
    if (start) {
      const match = {
        tagName: start[1],
        attrs: []
      }
      advance(start[0].length);
      let end, attr;
      while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
        advance(attr[0].length);  //将属性去掉
        match.attrs.push({ name: attr[1], value: attr[3] || attr[4] || attr[5] });
      }
      if (end) {  //去掉开始标签的<
        advance(end[0].length);
        return match;
      }
    }

  }
}

export function compileToFunction(template) {
  let root = parseHTML(template);
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