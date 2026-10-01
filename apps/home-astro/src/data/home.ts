export type Locale = 'en' | 'es';
type Case = {title:string; category:string; problem:string; intervention:string; href:string};
type Home = {
 title:string; description:string; preview:string; skip:string; work:string; capabilities:string; studio:string; contact:string;
 heroTop:string; heroBottom:string; heroBody:string; viewWork:string; photoLabel:string; photoAlt:string;
 workHeading:string; workIntro:string; own:string; caseLink:string; problem:string; intervention:string; cases:[Case,Case];
 screen:string; intakeWords:[string,string,string]; intakeCaption:string; identityHeading:string; identityBody:string; mockup:string;
 identityAlts:[string,string]; editorialHeading:string; editorialBody:string; editorialAlts:[string,string];
 servicesHeading:string; services:{title:string; description:string; href:string}[];
 contactHeading:string; contactBody:string; contactAction:string; footer:string; privacy:string; terms:string;
};
export const home:Record<Locale,Home> = {
 es:{
 title:'Creative MK — Marca, web e IA',description:'Unimos identidad de marca, diseño web y automatización con IA. Explora el trabajo propio de Creative MK y conversemos sobre tu proyecto.',
 preview:'Vista previa · propuesta en revisión',skip:'Saltar al contenido',work:'Trabajo',capabilities:'Capacidades',studio:'Estudio',contact:'Hablemos',
 heroTop:'Ideas que',heroBottom:'dejan huella',heroBody:'Conectamos marca, web e IA para darle forma a lo que sigue en tu negocio.',viewWork:'Explora nuestro trabajo',
 photoLabel:'Imagen ilustrativa generada con IA',photoAlt:'Escena ilustrativa: manos organizando pruebas editoriales sobre una mesa de trabajo con luz natural.',
 workHeading:'Del concepto\na la experiencia',workIntro:'Diseñamos y construimos. Estas dos iniciativas propias muestran cómo llevamos una idea hasta una experiencia que puedes explorar.',
 own:'Creative MK · iniciativa propia',caseLink:'Explorar el caso',problem:'El reto',intervention:'Nuestra intervención',
 cases:[
 {title:'Una web con carácter',category:'Diseño web · desarrollo',problem:'Hacer que el sitio del estudio muestre el oficio detrás de la oferta.',intervention:'Un sistema de contornos que acompaña la navegación y adapta su nivel de detalle al dispositivo.',href:'/es/trabajo/campo-de-contornos/'},
 {title:'Una conversación con contexto',category:'Automatización IA · desarrollo',problem:'Organizar las primeras consultas sin perder lo que cada persona necesita.',intervention:'Un agente de recepción que recoge el brief, identifica el servicio y prepara el seguimiento humano.',href:'/es/trabajo/agente-de-recepcion/'}],
 screen:'Captura del sitio propio · versión existente',intakeWords:['Recibir.','Entender.','Conectar.'],intakeCaption:'Captura de la interfaz propia · sin conversación activa',
 identityHeading:'Una identidad\nMuchos puntos de contacto',identityBody:'La marca toma forma en cada soporte. Aplicaciones del archivo visual de Creative MK, del papel al espacio público.',mockup:'Aplicación de marca propia · mockup',
 identityAlts:['Mockup de papelería de Creative MK: cuaderno, tarjetas y materiales impresos.','Mockup de una valla publicitaria con la identidad de Creative MK.'],
 editorialHeading:'El diseño también\nse siente',editorialBody:'Exploraciones visuales de materiales, luz y trabajo creativo. Imágenes ilustrativas generadas con IA; no representan proyectos de clientes ni al equipo del estudio.',
 editorialAlts:['Escena ilustrativa de una prueba de impresión sobre papel con textura.','Escena ilustrativa de diseño web con un portátil, un teléfono y bocetos.'],
 servicesHeading:'Una misma idea,\nbien conectada',services:[
 {title:'Marca',description:'Identidad, lenguaje visual y aplicaciones que mantienen una presencia coherente.',href:'/es/servicios/branding/'},
 {title:'Web',description:'Diseño y desarrollo de sitios que hacen visible tu oferta y facilitan el siguiente paso.',href:'/es/servicios/sitios-web/'},
 {title:'IA',description:'Automatizaciones para recibir consultas, organizar información y apoyar el trabajo del equipo.',href:'/es/servicios/automatizacion-ia/'}],
 contactHeading:'¿Qué hacemos\nrealidad contigo?',contactBody:'Cuéntanos qué estás construyendo y dónde necesitas avanzar.',contactAction:'Iniciar un proyecto',footer:'Marca, web e IA. Con intención.',privacy:'Privacidad',terms:'Términos'
 },
 en:{
 title:'Creative MK — Brand, web & AI',description:'We connect brand identity, web design and AI automation. Explore Creative MK’s own work and tell us about your project.',
 preview:'Preview · design under review',skip:'Skip to content',work:'Work',capabilities:'Capabilities',studio:'Studio',contact:'Let’s talk',
 heroTop:'Ideas that',heroBottom:'leave a mark',heroBody:'We connect brand, web and AI to shape what comes next for your business.',viewWork:'Explore our work',
 photoLabel:'AI-generated illustrative image',photoAlt:'Illustrative scene: hands arranging editorial proofs on a worktable in natural daylight.',
 workHeading:'From concept\nto experience',workIntro:'We design and build. These two in-house initiatives show how we take an idea into an experience you can explore.',
 own:'Creative MK · in-house initiative',caseLink:'Explore the case',problem:'The challenge',intervention:'Our contribution',
 cases:[
 {title:'A website with character',category:'Web design · development',problem:'Make the studio website demonstrate the craft behind its offer.',intervention:'A contour system that follows the page and adjusts its level of detail to the device.',href:'/work/contour-field/'},
 {title:'A conversation with context',category:'AI automation · development',problem:'Organize first enquiries without losing what each person needs.',intervention:'An intake agent that gathers the brief, identifies the service and prepares human follow-up.',href:'/work/intake-agent/'}],
 screen:'Screenshot of our own website · existing version',intakeWords:['Receive.','Understand.','Connect.'],intakeCaption:'Screenshot of our own interface · no active conversation',
 identityHeading:'One identity\nMany points of contact',identityBody:'A brand takes shape across its applications. From paper to public space, these pieces come from Creative MK’s visual archive.',mockup:'In-house brand application · mockup',
 identityAlts:['Creative MK stationery mockup with notebook, cards and printed material.','Billboard mockup featuring the Creative MK identity.'],
 editorialHeading:'Design has\na tangible side',editorialBody:'Visual explorations of materials, light and creative work. AI-generated illustrative images; they do not depict client projects or studio staff.',
 editorialAlts:['Illustrative scene of a print proof on textured paper.','Illustrative web design scene with a laptop, phone and sketches.'],
 servicesHeading:'One idea,\nfully connected',services:[
 {title:'Brand',description:'Identity, visual language and applications that keep your presence consistent.',href:'/services/branding/'},
 {title:'Web',description:'Website design and development that makes your offer clear and the next step easy.',href:'/services/websites/'},
 {title:'AI',description:'Automation to receive enquiries, organize information and support your team’s work.',href:'/services/ai-automation/'}],
 contactHeading:'What shall we\nmake real together?',contactBody:'Tell us what you are building and where you need to go next.',contactAction:'Start a project',footer:'Brand, web & AI. With purpose.',privacy:'Privacy',terms:'Terms'
 }
};
