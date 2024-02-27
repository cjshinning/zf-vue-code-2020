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

export function parseHTML(html) {
  let root = null;  //ast语法的树根
  let currentParent = null; //标识当前父亲是谁
  let stack = [];
  const ELEMENT_TYPE = 1;
  const TEXT_TYPE = 3;

  function createASTElement(tagName, attrs) {
    return {
      tag: tagName,
      type: ELEMENT_TYPE,
      children: [],
      attrs,
      parent: null
    }
  }

  // [div, p, span]
  // < div > <p><span></span></p></div>

  function start(tagName, attrs) {
    // console.log('开始标签：', tagName, '属性是：', attrs);
    // 遇到开始标签就创建一个ast元素
    let element = createASTElement(tagName, attrs);
    if (!root) {
      root = element;
    }
    currentParent = element;  //把当前元素标记成父ast树
    stack.push(element);
  }
  function chars(text) {
    // console.log('文本是：', text);
    text = text.replace(/\s/g, '');
    if (text) {
      currentParent.children.push({
        text,
        type: TEXT_TYPE
      })
    }
  }
  function end(tagName) {
    // console.log('结束标签：', tagName);
    let element = stack.pop();
    currentParent = stack[stack.length - 1];
    if (currentParent) {
      element.parent = currentParent;
      currentParent.children.push(element); //实现了树的关系
    }
  }
  // 不停的解析html
  while (html) {
    let textEnd = html.indexOf('<');
    if (textEnd === 0) {
      // 如果当前索引为0，肯定是一个标签 开始标签 或 结束标签
      let startTagMatch = parseStartTag(); //通过这个方法获取到匹配的结果 tagName attrs
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs); //1.解析开始标签
        continue; //如果开始标签匹配完毕 继续下一次匹配
      }
      let endTagMatch = html.match(endTag);
      if (endTagMatch) {
        advance(endTagMatch[0].length);
        end(endTagMatch[1]);  //2.解析结束标签
        continue;
      }
    }
    let text;
    if (textEnd >= 0) {
      text = html.substring(0, textEnd);
    }
    if (text) {
      advance(text.length);
      chars(text);  //3.解析文本标签
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
  return root;
}
