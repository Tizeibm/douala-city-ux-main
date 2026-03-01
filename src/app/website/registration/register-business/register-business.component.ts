import { Component } from '@angular/core';




export enum StructureType {
    ADMINISTRATIONPUBLIQUE = "ADMINISTRATIONPUBLIQUE",
    COMMERCE="COMMERCE",
    EDUCATION="EDUCATION",
    ENERGIE= "ENERGIE",
    FINANCEASSURANCE= "FINANCEASSURANCE",
    HEBERGEMENTRESTAURATION= "HEBERGEMENTRESTAURATION",
    PRESTATAIREINDIVIDUEL="PRESTATAIREINDIVIDUEL",
    SANTE="SANTE",
    SECURITE="SECURITE",
    SPORTLOISIRS="SPORTLOISIRS",
    TELECOMNUMERIQUE="TELECOMNUMERIQUE",
    TOURISMECULTURE="TOURISMECULTURE",
    TRANSPORTLOGISTIQUE="TRANSPORTLOGISTIQUE",
    SERVICESSPECIALISES="SERVICESSPECIALISES"
}


@Component({
  selector: 'app-register-business',
  standalone: false,
  templateUrl: './register-business.component.html',
  styleUrl: './register-business.component.scss'
})
export class RegisterBusinessComponent {


  
edu="";
name= '';
email= '';
password= '';
lastname='';
phone="";
entname="";
entemail="";
entpassword="";
entnum="";
ser="";


type: {
  type:StructureType |null;
  valeur: string
}
={
  type: null,
  valeur: ""
};
username="";
spec="";
fonction="";
etabniv="";
etabp="";
etabpr="";
etabs="";
etabsu="";
etabf="";
eq="";
heb="";
adm="";
san="";
com="";
trans="";
sp="";
en="";

  types=[
    {
    type:StructureType.ADMINISTRATIONPUBLIQUE,
    valeur:'Administratif'
    },
   {  
   type: StructureType.EDUCATION,
   valeur:'educatif'
   },
    {
      type: StructureType.SANTE,
      valeur:'santé'},
    {
      type: StructureType.COMMERCE,
      valeur:'commerce'},
    {
      type: StructureType.TRANSPORTLOGISTIQUE,
      valeur:'transport'},
    {
      type: StructureType.SPORTLOISIRS,
      valeur:'sport/culture'},
    {

      type: StructureType.ENERGIE,
      valeur:'énergie/hydraulytique'},

       {

      type: StructureType.SERVICESSPECIALISES,
      valeur:'services'}
    
  ];
  

education=[
  "écoles",
  "universités",
  "centres de formation"
]

Fonctions=[
  "Etablissements d enseignement",
  "équipements d appui à l éducation",
  "structures d hébergement éducatives"

];


niv=[
  "prescolaire",
  "primaire",
  "secondaire",
  "superieur",
  "formation professionnelle et technique"

]


etabpres=[
  "crèches",
  "jardins d'enfant",
  "écoles maternelles"
]

etabpri=[
"ecoles primaires publiques",
"écoles primaires privées",
"écoles confessionnelles"
];

etabsec=[
  "collèges",
  "lycées",
  "lycées techniques et professionnels",
  "collèges et lycées confessionnels ou privés"

]

etabsup=[

  "universités publiques",
  "universités privées",
  "grandes écoles",
  "instituts supérieurs",
  "centre de formation des enseignants"

]

etabFor=[

  "centre de formation professionnelle",
  "ecole de metiers",
  "centres d apprentissage"

]

equip=[

  "bibliotheques scolaires et universitaires",
  "laboratoires",
  "salles multimedias et cyber-centres",
  "centres de documentation"


]

heber=[

  "internats",
  "résidences universitaires",
  "foyers d'étudiants"

]

admin=[

  "mairies",
  "préfectures",
  "centres de services publics",
  "postes, tribunaux"

];

sante=[

  "hôpitaux, cliniques",
  "centres de santé, dispensaires",
  "pharmacies"
  

];

commerces=[

"marchés",
"centres commerciaux",
"boutiques, supermarchés"


];

transport=[

  "routes, ponts",
  "gares, aéroports, ports",
  "stations de bus, gares routières"

]

sportCulture=[

  "stades, gymnases",
  "salles de spectacle, bibliothèques",
  "centres culturels"
]

enerHydrau=[
  "réseaux d'eau potables, barrages",
  "réseaux électriques",
  "stations de traitement des eaux usées"
]


services=[
  "banques",
  "notaires",
  "avocats",
  "architectes"

]


inscrire(){

}

}

