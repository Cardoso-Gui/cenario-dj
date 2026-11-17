const path=require('node:path');
const routes={'flavinnho.html':'/flavinnho/','sobre.html':'/flavinnho/sobre/','mixes.html':'/flavinnho/mixes/','fotos.html':'/flavinnho/fotos/','contato.html':'/flavinnho/contato/'};
const pageUrlPath=file=>routes[file]||(file==='index.html'?'/':'/'+file);
const projectPath=(file,...rest)=>path.join(__dirname,'..',routes[file]?routes[file].slice(1)+'index.html':file,...rest);
module.exports={routes,pageUrlPath,projectPath};
