

## PlantUML

[PlantUML](http://plantuml.com) is used for the technical diagrams using [Unified Modeling Language (UML)](https://en.wikipedia.org/wiki/Unified_Modeling_Language) and [Archimate](https://www.itmg-int.com/itmg-int-wp-content/Archimate/An%20Introduction%20to%20Archimate%203.0.pdf).

The PlantUML files have the `.puml` file extension.

To generate files, use the [node-plantuml](https://www.npmjs.com/package/node-plantuml) package in the dev dependencies
```
cd docs
npx puml generate createPrivacyGroup.puml -o .
npx puml generate pantheonSendTransaction.puml -o .
```

### GraphViz

[Graphviz](http://graphviz.org/) is required to generate PlantUML sequence, component and activity diagrams. Installation can be done using [brew](https://brew.sh/) on Mac OSX
```
brew install graphviz
```

### VS Code extension

[Jebbs PlantUML](https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml) extension for VS Code is used to authoring the PlantUML diagrams.

VS Code settings.json
```json
{
    "plantuml.diagramsRoot": "docs",
}
```

`Alt-D` on Windows, or `Option-D` on Mac, to start PlantUML preview in VS Code.

## Markdown table of contents

[markdown-toc](https://github.com/jonschlinkert/markdown-toc) can be used to generate a table of content for markdown files.
```
npm install -g markdown-toc
markdown-toc README.md --maxdepth 2
```

## Useful links

* [Markdown Cheatsheet](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet)
