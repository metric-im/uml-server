import Componentry from "@metric-im/componentry";
import plantuml from 'node-plantuml';
import express from "express";

export default class UML extends Componentry.Module {
  constructor(connector) {
    super(connector, import.meta.url);
    this.header = `skinparam backgroundColor transparent\n`
    this.umlOptions = {};
  }
  routes() {
    const router = express.Router();
    // router.use('/uml/modules',express.static(`${this.rootPath}/modules`));
    router.get('/uml/draw/:code?',(req,res)=> {
      try {
        let code = decodeURIComponent(req.params.code || req.query.code || req.query.txt); // txt is deprecated
        if (!code) return res.status(400).send({error: 'No code provided'});
        let gen = this.generate(code);
        res.set('Content-Type', 'image/png');
        gen.out.pipe(res);
      } catch (e) {
        res.status(e.status || 500).json({status: "error", message: e.message});
      }
    })
    router.get('/uml/edit/:code?',async (req,res)=>{
      try {
        let code = decodeURIComponent(req.params.code || req.query.code || req.query.txt); // txt is deprecated
        code = code.replaceAll('\n','\\n');
        let html = await this.connector.componentry.render('UmlEditor',{code:code})
        res.send(html);
      } catch (e) {
        res.status(e.status || 500).json({status: "error", message: e.message});
      }
    })
    router.get('/uml/help',(req,res) => {
      res.send('hello help');
    })
    return router;
  }
  get template() {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <meta name="referrer" content="strict-origin-when-cross-origin">
    <link type="text/css" rel="stylesheet" href="/styles/component.css">
    <link type="text/css" rel="stylesheet" href="/styles/static.css">
    <link rel="icon" href="favicon.ico">
    <script src="/lib/moment"></script>
    <script src="/lib/moment-timezone"></script>
    <script type="module" lang="javascript">
        import {{comp}} from '/components/{{comp}}.mjs';
          let comp = new {{comp}}(JSON.parse('{{props}}'));
        setTimeout(async ()=>{
          await comp.render(document.body);
        },100);
    </script>
</head>
<body>
</body>
</html>
`;
  }

  /**
   * Generate a UML image from the given PlantUML code
   * @param code
   * @returns *Buffer
   */
  generate(code) {
    code = code.replace(/^@startuml/i, "");
    code = code.replace(/@enduml$/i, "");
    return plantuml.generate(`@startuml\n${this.header}\n${code}\n@enduml`, {format: 'png'});
  }
}
