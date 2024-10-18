import Component from "./Component.mjs";
import CodeBlock from "./CodeBlock.mjs";
import {Button} from "./Button.mjs";
import {InputLongText} from "./InputText.mjs";

export default class UmlEditor extends Component {
  constructor(props) {
    super(props);
  }
  async render(element) {
    await super.render(element);
    this.container = this.div('uml-container',this.element);
    this.source = await this.draw(CodeBlock,{data: {code:this.props.code},
      name:"code", theme:'dawn', interpreter:'javascript'
    },this.container);
    this.source.element.classList.add('uml-source');
    this.source.editor.setOptions({minLines: 12, maxLines: 12});
    this.display = this.div('uml-display',this.container);
    this.graph = document.createElement('img');
    this.display.append(this.graph);
    this.controls = this.div('uml-controls',this.container);
    this.refreshButton = await this.draw(Button,{
      name:'refresh',icon:'cycle',title:'Refresh',onClick:this.renderGraph.bind(this)
    },this.controls);
    this.url = await this.draw(InputLongText,{hideTitle:true},this.controls);
    this.url.element.classList.add('uml-url');
    this.copyButton = await this.draw(Button,{
      name:'refresh',icon:'copy',title:'Copy',onClick:this.copyLink.bind(this)
    },this.controls);
    await this.renderGraph();
  }
  async renderGraph() {
    this.graph.src = `/uml/draw/${encodeURIComponent(this.source.value)}`;
    this.url.value = `<a href="${this.graph.src}" target="_uml"><img src="${this.graph.src}"/></a>`;
  }
  async copyLink() {
    await navigator.clipboard.writeText(this.url.value);
    this.url.element.classList.add('active');
    setTimeout(()=>{this.url.element.classList.remove('active')},200);
  }
}
