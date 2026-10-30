/** @param {{name:string,props:{name:string,required:boolean}[]}} doc @param {Record<string,unknown>} args */
export function playgroundCode(doc, args) {
  const changes = {
    onValueChange: "value",
    onCheckedChange: "checked",
    onCountryCodeChange: "countryCode",
    onPageChange: "page",
  };
  const callbacks = doc.props
    .filter((prop) => prop.name.startsWith("on") && prop.required)
    .map((prop) => `${prop.name}:()=>{}`)
    .join(",");
  const handlers = Object.entries(changes)
    .filter(([callback]) => doc.props.some((prop) => prop.name === callback))
    .map(
      ([callback, value]) =>
        `${callback}={${value}=>setProps(current=>({...current,${value}}))}`,
    )
    .join("\n      ");
  const initial = JSON.stringify(args, null, 2).replace(
    /\n}$/,
    `${callbacks ? `,\n  ${callbacks}` : ""}\n}`,
  );
  return `import {useState, type ComponentProps} from "react";\nimport {${doc.name}} from "@parya/design-system";\nimport "@parya/design-system/styles.css";\n\nexport function ${doc.name}Example() {\n  const [props,setProps] = useState<ComponentProps<typeof ${doc.name}>>(${initial});\n  return <${doc.name} {...props}${handlers ? `\n      ${handlers}` : ""} />;\n}`;
}
